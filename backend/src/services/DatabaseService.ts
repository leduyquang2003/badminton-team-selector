import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { Player, MatchResult, SkillLevel, Hand, Specialty } from '../types';

export class DatabaseService {
  private db: Database | null = null;
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  public async getPlayerMatchHistory(playerId: string, limit: number = 10): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return this.db.all(`
      SELECT 
        match_id as matchId,
        date,
        partner_id as partnerId,
        result,
        score_for as scoreFor,
        score_against as scoreAgainst,
        elo_change as eloChange,
        previous_elo as previousElo,
        new_elo as newElo
      FROM match_history 
      WHERE player_id = ? 
      ORDER BY date DESC 
      LIMIT ?
    `, [playerId, limit]);
  }


  public async getPlayerPartners(playerId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return this.db.all(`
      SELECT 
        partner_id as playerId,
        (SELECT name FROM players WHERE player_id = mh.partner_id) as playerName,
        COUNT(*) as matchesPlayed,
        AVG(CASE WHEN result = 'WIN' THEN 1.0 ELSE 0.0 END) as winRate
      FROM match_history mh
      WHERE player_id = ? AND partner_id IS NOT NULL
      GROUP BY partner_id
      ORDER BY matchesPlayed DESC
      LIMIT 10
    `, [playerId]);
  }
  public async initialize(): Promise<void> {
    // Create database directory if it doesn't exist
    const dbDir = path.join(__dirname, '..', 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Initialize database
    const dbPath = path.join(dbDir, 'badminton.db');
    
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await this.db.exec('PRAGMA foreign_keys = ON');
    await this.db.exec('PRAGMA journal_mode = WAL');
    
    await this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create tables
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        age INTEGER NOT NULL CHECK (age >= 8 AND age <= 80),
        hand TEXT NOT NULL CHECK (hand IN ('LEFT', 'RIGHT', 'AMBIDEXTROUS')),
        specialty TEXT NOT NULL CHECK (specialty IN ('SINGLES', 'DOUBLES', 'MIXED_DOUBLES', 'ALL_AROUND')),
        skill_level TEXT NOT NULL CHECK (skill_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO')),
        current_elo INTEGER DEFAULT 1200 CHECK (current_elo >= 100 AND current_elo <= 3000),
        peak_elo INTEGER DEFAULT 1200,
        initial_elo INTEGER DEFAULT 1200,
        racket_brand TEXT NOT NULL,
        racket_model TEXT NOT NULL,
        racket_weight TEXT NOT NULL,
        racket_tension TEXT NOT NULL,
        racket_string TEXT NOT NULL,
        total_matches INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0.0 CHECK (win_rate >= 0 AND win_rate <= 1),
        current_win_streak INTEGER DEFAULT 0,
        longest_win_streak INTEGER DEFAULT 0,
        average_score_for REAL DEFAULT 0.0,
        average_score_against REAL DEFAULT 0.0,
        recent_form_win_rate REAL DEFAULT 0.0 CHECK (recent_form_win_rate >= 0 AND recent_form_win_rate <= 1),
        current_rank INTEGER DEFAULT 999999,
        previous_rank INTEGER DEFAULT 999999,
        rank_change INTEGER DEFAULT 0,
        avatar TEXT DEFAULT '🏸',
        color TEXT DEFAULT '#4ECDC4',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        preferred_play_times TEXT DEFAULT '[]',
        available_days TEXT DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT UNIQUE NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        team1_player1_id TEXT NOT NULL,
        team1_player2_id TEXT,
        team2_player1_id TEXT NOT NULL,
        team2_player2_id TEXT,
        team1_score INTEGER NOT NULL,
        team2_score INTEGER NOT NULL,
        match_type TEXT NOT NULL CHECK (match_type IN ('SINGLES', 'DOUBLES')),
        duration_minutes INTEGER DEFAULT 30,
        venue TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team1_player1_id) REFERENCES players(player_id),
        FOREIGN KEY (team1_player2_id) REFERENCES players(player_id),
        FOREIGN KEY (team2_player1_id) REFERENCES players(player_id),
        FOREIGN KEY (team2_player2_id) REFERENCES players(player_id)
      );

      CREATE TABLE IF NOT EXISTS match_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id TEXT NOT NULL,
        match_id TEXT NOT NULL,
        date DATETIME NOT NULL,
        partner_id TEXT,
        result TEXT NOT NULL CHECK (result IN ('WIN', 'LOSS')),
        score_for INTEGER NOT NULL,
        score_against INTEGER NOT NULL,
        elo_change INTEGER NOT NULL,
        previous_elo INTEGER NOT NULL,
        new_elo INTEGER NOT NULL,
        FOREIGN KEY (player_id) REFERENCES players(player_id),
        FOREIGN KEY (partner_id) REFERENCES players(player_id),
        FOREIGN KEY (match_id) REFERENCES matches(match_id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_players_elo ON players(current_elo DESC);
      CREATE INDEX IF NOT EXISTS idx_players_matches ON players(total_matches ASC);
      CREATE INDEX IF NOT EXISTS idx_players_active ON players(last_active_at DESC);
      CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date DESC);
      CREATE INDEX IF NOT EXISTS idx_match_history_player ON match_history(player_id);
    `);
  }

  // Player operations
  public async createPlayer(playerData: Omit<Player, '_id' | 'playerId' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>): Promise<Player> {
    if (!this.db) throw new Error('Database not initialized');
    
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.db.run(`
      INSERT INTO players (
        player_id, name, email, age, hand, specialty, skill_level,
        current_elo, peak_elo, initial_elo,
        racket_brand, racket_model, racket_weight, racket_tension, racket_string,
        avatar, color, preferred_play_times, available_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      playerId,
      playerData.name,
      playerData.email,
      playerData.age,
      playerData.hand,
      playerData.specialty,
      playerData.skillLevel,
      playerData.currentElo,
      playerData.peakElo,
      playerData.initialElo,
      playerData.racket.brand,
      playerData.racket.model,
      playerData.racket.weight,
      playerData.racket.tension,
      playerData.racket.string,
      playerData.avatar,
      playerData.color,
      JSON.stringify(playerData.preferredPlayTimes || []),
      JSON.stringify(playerData.availableDays || [])
    ]);

    return (await this.getPlayerById(playerId))!;
  }

  public async getPlayerById(playerId: string): Promise<Player | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const row = await this.db.get(`
      SELECT * FROM players WHERE player_id = ?
    `, [playerId]);
    
    if (!row) return null;
    return this.mapRowToPlayer(row);
  }

  public async getAllPlayers(filters: {
    skillLevel?: string;
    minElo?: number;
    maxElo?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<Player[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM players WHERE 1=1';
    const params: any[] = [];

    if (filters.skillLevel) {
      query += ' AND skill_level = ?';
      params.push(filters.skillLevel);
    }

    if (filters.minElo) {
      query += ' AND current_elo >= ?';
      params.push(filters.minElo);
    }

    if (filters.maxElo) {
      query += ' AND current_elo <= ?';
      params.push(filters.maxElo);
    }

    // Add sorting
    const sortBy = filters.sortBy || 'total_matches';
    const sortOrder = filters.sortOrder || 'asc';
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const rows = await this.db.all(query, params);
    return rows.map(row => this.mapRowToPlayer(row));
  }

  public async updatePlayer(playerId: string, updates: Partial<Player>): Promise<Player | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause: string[] = [];
    const params: any[] = [];

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      switch (key) {
        case 'name':
        case 'email':
        case 'age':
        case 'hand':
        case 'specialty':
        case 'skillLevel':
          setClause.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
          params.push(value);
          break;
        case 'currentElo':
          setClause.push('current_elo = ?');
          params.push(value);
          break;
        case 'stats':
          if (typeof value === 'object') {
            Object.entries(value).forEach(([statKey, statValue]) => {
              const dbKey = statKey.replace(/([A-Z])/g, '_$1').toLowerCase();
              setClause.push(`${dbKey} = ?`);
              params.push(statValue);
            });
          }
          break;
      }
    });

    if (setClause.length === 0) return this.getPlayerById(playerId);

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    params.push(playerId);

    const query = `UPDATE players SET ${setClause.join(', ')} WHERE player_id = ?`;
    await this.db.run(query, params);

    return this.getPlayerById(playerId);
  }

  public async deletePlayer(playerId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run('DELETE FROM players WHERE player_id = ?', [playerId]);
    return (result.changes || 0) > 0;
  }

  // Match operations
  public async recordMatch(matchResult: MatchResult): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Insert match record
    await this.db.run(`
      INSERT INTO matches (
        match_id, date, team1_player1_id, team1_player2_id, 
        team2_player1_id, team2_player2_id, team1_score, team2_score,
        match_type, duration_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      matchResult.matchId,
      matchResult.date.toISOString(),
      matchResult.team1.player1Id,
      matchResult.team1.player2Id || null,
      matchResult.team2.player1Id,
      matchResult.team2.player2Id || null,
      matchResult.score.team1,
      matchResult.score.team2,
      matchResult.matchType,
      matchResult.duration
    ]);

    // Update player statistics
    await this.updatePlayerStatsAfterMatch(matchResult);
  }

  private async updatePlayerStatsAfterMatch(matchResult: MatchResult): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const isTeam1Winner = matchResult.score.team1 > matchResult.score.team2;
    const allPlayerIds = [
      matchResult.team1.player1Id,
      matchResult.team1.player2Id,
      matchResult.team2.player1Id,
      matchResult.team2.player2Id
    ].filter(Boolean);

    for (const playerId of allPlayerIds) {
      if (!playerId) continue;
      
      const player = await this.getPlayerById(playerId);
      if (!player) continue;

      const isTeam1Player = [matchResult.team1.player1Id, matchResult.team1.player2Id].includes(playerId);
      const isWinner = isTeam1Player ? isTeam1Winner : !isTeam1Winner;

      // Calculate ELO change (simplified)
      const eloChange = isWinner ? 16 : -16;
      const newElo = Math.max(100, Math.min(3000, player.currentElo + eloChange));

      // Update player stats
      const newWins = player.stats.wins + (isWinner ? 1 : 0);
      const newLosses = player.stats.losses + (isWinner ? 0 : 1);
      const newTotalMatches = player.stats.totalMatches + 1;
      const newWinRate = newWins / newTotalMatches;
      const newWinStreak = isWinner ? player.stats.currentWinStreak + 1 : 0;

      await this.db.run(`
        UPDATE players SET 
          current_elo = ?,
          total_matches = ?,
          wins = ?,
          losses = ?,
          win_rate = ?,
          current_win_streak = ?,
          longest_win_streak = CASE WHEN ? > longest_win_streak THEN ? ELSE longest_win_streak END,
          last_active_at = CURRENT_TIMESTAMP
        WHERE player_id = ?
      `, [
        newElo,
        newTotalMatches,
        newWins,
        newLosses,
        newWinRate,
        newWinStreak,
        newWinStreak,
        newWinStreak,
        playerId
      ]);

      // Record match history
      const partnerId = isTeam1Player 
        ? (matchResult.team1.player1Id === playerId ? matchResult.team1.player2Id : matchResult.team1.player1Id)
        : (matchResult.team2.player1Id === playerId ? matchResult.team2.player2Id : matchResult.team2.player1Id);

      await this.db.run(`
        INSERT INTO match_history (
          player_id, match_id, date, partner_id, result,
          score_for, score_against, elo_change, previous_elo, new_elo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        playerId,
        matchResult.matchId,
        matchResult.date.toISOString(),
        partnerId || null,
        isWinner ? 'WIN' : 'LOSS',
        isTeam1Player ? matchResult.score.team1 : matchResult.score.team2,
        isTeam1Player ? matchResult.score.team2 : matchResult.score.team1,
        eloChange,
        player.currentElo,
        newElo
      ]);
    }
  }

  // Rankings and stats methods
  public async updateRankings(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const players = await this.db.all(`
      SELECT player_id, current_elo,
             ROW_NUMBER() OVER (ORDER BY current_elo DESC) as new_rank
      FROM players
      ORDER BY current_elo DESC
    `);

    for (const player of players) {
      await this.db.run(`
        UPDATE players SET 
          previous_rank = current_rank,
          current_rank = ?,
          rank_change = current_rank - ?
        WHERE player_id = ?
      `, [player.new_rank, player.new_rank, player.player_id]);
    }
  }

  public async getRankings(page: number = 1, limit: number = 50, skillLevel?: string): Promise<{
    rankings: any[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');
    
    let countQuery = 'SELECT COUNT(*) as count FROM players';
    let dataQuery = `
      SELECT player_id, name, current_elo, skill_level, total_matches, win_rate,
             current_rank, rank_change
      FROM players
    `;
    
    const params: any[] = [];

    if (skillLevel) {
      const whereClause = ' WHERE skill_level = ?';
      countQuery += whereClause;
      dataQuery += whereClause;
      params.push(skillLevel);
    }

    dataQuery += ' ORDER BY current_elo DESC LIMIT ? OFFSET ?';
    
    const countResult = await this.db.get(countQuery, params);
    const totalCount = countResult?.count || 0;

    const offset = (page - 1) * limit;
    const rankings = await this.db.all(dataQuery, [...params, limit, offset]);

    return {
      rankings,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  public async getOverviewStats(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    const totalPlayers = await this.db.get('SELECT COUNT(*) as count FROM players');
    const avgElo = await this.db.get('SELECT AVG(current_elo) as avg FROM players');
    const totalMatches = await this.db.get('SELECT SUM(total_matches) as total FROM players');
    const newPlayers = await this.db.get('SELECT COUNT(*) as count FROM players WHERE total_matches < 5');
    
    const skillDist = await this.db.all(`
      SELECT skill_level, COUNT(*) as count 
      FROM players 
      GROUP BY skill_level
    `);
    
    const mostActive = await this.db.all(`
      SELECT name, last_active_at, total_matches 
      FROM players 
      ORDER BY last_active_at DESC 
      LIMIT 5
    `);
    
    const topPerformers = await this.db.all(`
      SELECT name, current_elo, win_rate 
      FROM players 
      ORDER BY current_elo DESC 
      LIMIT 5
    `);

    const skillDistribution: Record<string, number> = {};
    skillDist.forEach(row => {
      skillDistribution[row.skill_level] = row.count;
    });

    return {
      overview: {
        totalPlayers: totalPlayers?.count || 0,
        averageElo: Math.round(avgElo?.avg || 1200),
        totalMatches: totalMatches?.total || 0,
        newPlayersCount: newPlayers?.count || 0
      },
      skillDistribution,
      mostActive: mostActive.map(p => ({
        name: p.name,
        lastActive: new Date(p.last_active_at),
        totalMatches: p.total_matches
      })),
      topPerformers: topPerformers.map(p => ({
        name: p.name,
        elo: p.current_elo,
        winRate: p.win_rate
      }))
    };
  }

  // Helper method to map database row to Player object
  private mapRowToPlayer(row: any): Player {
    return {
      _id: row.id.toString(),
      id: row.player_id,
      playerId: row.player_id,
      name: row.name,
      email: row.email,
      age: row.age,
      hand: row.hand as Hand,
      specialty: row.specialty as Specialty,
      skillLevel: row.skill_level as SkillLevel,
      currentElo: row.current_elo,
      peakElo: row.peak_elo,
      initialElo: row.initial_elo,
      racket: {
        brand: row.racket_brand,
        model: row.racket_model,
        weight: row.racket_weight,
        tension: row.racket_tension,
        string: row.racket_string
      },
      stats: {
        totalMatches: row.total_matches,
        wins: row.wins,
        losses: row.losses,
        winRate: row.win_rate,
        currentWinStreak: row.current_win_streak,
        longestWinStreak: row.longest_win_streak,
        averageScoreFor: row.average_score_for,
        averageScoreAgainst: row.average_score_against,
        recentFormWinRate: row.recent_form_win_rate
      },
      winRate: row.win_rate,
      gamesPlayed: row.total_matches,
      matchHistory: [],
      frequentPartners: [],
      currentRank: row.current_rank,
      previousRank: row.previous_rank,
      rankChange: row.rank_change,
      avatar: row.avatar,
      color: row.color,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastActiveAt: new Date(row.last_active_at),
      preferredPlayTimes: JSON.parse(row.preferred_play_times || '[]'),
      availableDays: JSON.parse(row.available_days || '[]')
    };
  }

  public async addDemoPlayers(): Promise<void> {
    const demoPlayers = [
      {
        name: 'Alice Chen',
        email: 'alice@example.com',
        age: 28,
        hand: Hand.RIGHT,
        specialty: Specialty.DOUBLES,
        skillLevel: SkillLevel.INTERMEDIATE,
        currentElo: 1300,
        peakElo: 1300,
        initialElo: 1200,
        racket: { brand: 'Yonex', model: 'Arcsaber 11', weight: '85g', tension: '24lbs', string: 'BG80' },
        stats: { totalMatches: 0, wins: 0, losses: 0, winRate: 0, currentWinStreak: 0, longestWinStreak: 0, averageScoreFor: 0, averageScoreAgainst: 0, recentFormWinRate: 0 },
        winRate: 0, gamesPlayed: 0, matchHistory: [], frequentPartners: [], currentRank: 999999, previousRank: 999999, rankChange: 0,
        avatar: '⭐', color: '#FF6B6B', createdAt: new Date(), updatedAt: new Date(), lastActiveAt: new Date(), preferredPlayTimes: [], availableDays: []
      }
      // Add more demo players...
    ];

    for (const playerData of demoPlayers) {
      try {
        await this.createPlayer(playerData);
      } catch (error) {
        console.log(`Demo player ${playerData.name} already exists`);
      }
    }

    await this.updateRankings();
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
  }
}