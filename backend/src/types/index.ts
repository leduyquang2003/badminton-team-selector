// types/index.ts - Main types file for frontend
export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE', 
  ADVANCED = 'ADVANCED',
  PRO = 'PRO'
}

export enum Hand {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  AMBIDEXTROUS = 'AMBIDEXTROUS'
}

export enum Specialty {
  SINGLES = 'SINGLES',
  DOUBLES = 'DOUBLES',
  MIXED_DOUBLES = 'MIXED_DOUBLES',
  ALL_AROUND = 'ALL_AROUND'
}

export interface RacketInfo {
  brand: string;
  model: string;
  weight: string;
  tension: string;
  string: string;
}

export interface MatchHistory {
  matchId: string;
  date: Date;
  partnerId?: string;
  opponentIds: string[];
  result: 'WIN' | 'LOSS';
  scoreFor: number;
  scoreAgainst: number;
  eloChange: number;
  previousElo: number;
  newElo: number;
}

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentWinStreak: number;
  longestWinStreak: number;
  averageScoreFor: number;
  averageScoreAgainst: number;
  recentFormWinRate: number;
}

export interface Player {
  _id?: string;
  id?: string; // for backward compatibility
  playerId: string;
  name: string;
  email: string;
  age: number;
  hand: Hand;
  specialty: Specialty;
  skillLevel: SkillLevel;
  
  // ELO Rating System
  currentElo: number;
  peakElo: number;
  initialElo: number;
  
  // Equipment
  racket: RacketInfo;
  
  // Statistics
  stats: PlayerStats;
  
  // Computed properties for backward compatibility
  winRate: number; // alias for stats.winRate
  gamesPlayed: number; // alias for stats.totalMatches
  
  // Match History
  matchHistory: MatchHistory[];
  
  // Partnership tracking
  frequentPartners: Array<{
    playerId: string;
    playerName: string;
    matchesPlayed: number;
    winRate: number;
  }>;
  
  // Ranking info
  currentRank: number;
  previousRank: number;
  rankChange: number;
  
  // Visual customization
  avatar: string;
  color: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  
  // Matchmaking preferences
  preferredPlayTimes: string[];
  availableDays: string[];
}

export interface Team {
  id: string;
  players: Player[];
  name: string;
  averageSkillLevel: number;
  combinedWinRate: number;
}

export interface GameResult {
  id: string;
  date: Date;
  team1: Team;
  team2: Team;
  winner: Team;
  loser: Team;
  winnerScore: number;
  loserScore: number;
  playersInvolved: Player[];
}

export interface AppState {
  players: Player[];
  teams: Team[];
  gameHistory: GameResult[];
  currentScreen: 'lobby' | 'teams' | 'results' | 'history' | 'leaderboard' | 'profile';
  selectedPlayerProfile?: Player | null;
}

export interface MatchResult {
  matchId: string;
  date: Date;
  team1: {
    player1Id: string;
    player2Id?: string;
  };
  team2: {
    player1Id: string;
    player2Id?: string;
  };
  score: {
    team1: number;
    team2: number;
  };
  matchType: 'SINGLES' | 'DOUBLES';
  duration: number;
  venue?: string;
}

export const ELO_CONSTANTS = {
  INITIAL_RATING: 1200,
  K_FACTOR: 32,
  MIN_RATING: 100,
  MAX_RATING: 3000,
  
  SKILL_THRESHOLDS: {
    BEGINNER: { min: 100, max: 1099 },
    INTERMEDIATE: { min: 1100, max: 1499 },
    ADVANCED: { min: 1500, max: 1899 },
    PRO: { min: 1900, max: 3000 }
  }
};