// Express server with SQLite backend
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { DatabaseService } from './services/DatabaseService';
import { Player, MatchResult } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = DatabaseService.getInstance();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Player routes
app.get('/api/players', async (req, res) => {
  try {
    const players = await db.getAllPlayers({});
    res.json({ success: true, data: { players, pagination: { currentPage: 1, totalPages: 1, totalCount: players.length } } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch players' });
  }
});

app.get('/api/players/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await db.getPlayerById(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    // ✅ Add await to these calls
    const matchHistory = await db.getPlayerMatchHistory(playerId, 10);
    const partners = await db.getPlayerPartners(playerId);
    const rankings = await db.getRankings(1, 1000);
    const playerRank = rankings.rankings.findIndex(r => r.player_id === playerId) + 1;

    const insights = {
      player,
      rank: playerRank || 999999,
      recentMatches: matchHistory,
      topPartners: partners,
      eloHistory: matchHistory.map(match => ({
        date: match.date,
        elo: match.new_elo,
        change: match.elo_change
      })),
      performanceMetrics: {
        eloGain: player.currentElo - player.initialElo,
        bestWinStreak: player.stats.longestWinStreak,
        recentForm: player.stats.recentFormWinRate,
        averageScoreDifferential: player.stats.averageScoreFor - player.stats.averageScoreAgainst
      }
    };

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error fetching player insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player insights'
    });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const playerData = req.body;
    
    const requiredFields = ['name', 'email', 'age', 'hand', 'specialty', 'racket'];
    const missingFields = requiredFields.filter(field => !playerData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const newPlayer = await db.createPlayer(playerData);
    await db.updateRankings(); // ✅ Add await
    
    res.status(201).json({
      success: true,
      data: newPlayer,
      message: 'Player created successfully'
    });
  } catch (error: any) {
    console.error('Error creating player:', error);
    
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'Player with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create player'
    });
  }
});

app.put('/api/players/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const updates = req.body;

    delete updates.playerId;
    delete updates._id;
    delete updates.id;
    delete updates.createdAt;

    const updatedPlayer = await db.updatePlayer(playerId, updates); // ✅ Add await

    if (!updatedPlayer) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      data: updatedPlayer,
      message: 'Player updated successfully'
    });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update player'
    });
  }
});

app.delete('/api/players/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const success = await db.deletePlayer(playerId); // ✅ Add await

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    await db.updateRankings(); // ✅ Add await

    res.json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete player'
    });
  }
});

app.get('/api/players/matchmaking/candidates', async (req, res) => {
  try {
    const { count = 8 } = req.query;
    const players = await db.getAllPlayers({ // ✅ Add await
      sortBy: 'total_matches',
      sortOrder: 'asc',
      limit: parseInt(count as string)
    });

    res.json({
      success: true,
      data: players
    });
  } catch (error) {
    console.error('Error fetching matchmaking candidates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matchmaking candidates'
    });
  }
});


app.post('/api/players/generate-teams', async (req, res) => {
  try {
    const { selectedPlayerIds, preferences } = req.body;

    let players: Player[];
    
    if (selectedPlayerIds && selectedPlayerIds.length >= 4) {
      // ✅ Fix this part - need to await each getPlayerById call
      const playerPromises = selectedPlayerIds.map((id: string) => db.getPlayerById(id));
      const playersWithNulls = await Promise.all(playerPromises);
      players = playersWithNulls.filter(Boolean) as Player[];
    } else {
      players = await db.getAllPlayers({ // ✅ Add await
        sortBy: 'total_matches',
        sortOrder: 'asc',
        limit: 8
      });
    }

    if (players.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Not enough players available for team generation'
      });
    }

    // Simple team generation algorithm
    const selectedPlayers = players.slice(0, 4);
    selectedPlayers.sort((a, b) => b.currentElo - a.currentElo);
    
    const team1 = [selectedPlayers[0], selectedPlayers[3]];
    const team2 = [selectedPlayers[1], selectedPlayers[2]];
    
    const team1AvgElo = team1.reduce((sum, p) => sum + p.currentElo, 0) / 2;
    const team2AvgElo = team2.reduce((sum, p) => sum + p.currentElo, 0) / 2;
    const balanceScore = Math.max(0, 100 - Math.abs(team1AvgElo - team2AvgElo) / 10);

    const result = {
      team1,
      team2,
      balanceScore: Math.round(balanceScore),
      confidence: Math.round(balanceScore),
      reasoning: [
        'ELO-based team balancing',
        `Team 1 avg: ${Math.round(team1AvgElo)}`,
        `Team 2 avg: ${Math.round(team2AvgElo)}`
      ],
      fairnessAnalysis: {
        fairnessScore: Math.round(balanceScore),
        recommendations: balanceScore > 80 ? ['Excellent match balance!'] : ['Consider reshuffling for better balance'],
        warnings: balanceScore < 60 ? ['Large skill gap detected'] : []
      }
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating teams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate teams'
    });
  }
});


app.post('/api/players/record-match', async (req, res) => {
  try {
    const matchResult: MatchResult = req.body;

    if (!matchResult.team1?.player1Id || !matchResult.team2?.player1Id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid match result: missing required player IDs'
      });
    }

    if (!matchResult.score || typeof matchResult.score.team1 !== 'number' || typeof matchResult.score.team2 !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid match result: missing or invalid score'
      });
    }

    await db.recordMatch(matchResult); // ✅ Add await
    await db.updateRankings(); // ✅ Add await

    res.json({
      success: true,
      message: 'Match result recorded successfully'
    });
  } catch (error) {
    console.error('Error recording match result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record match result'
    });
  }
});


app.get('/api/players/rankings/list', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      skillLevel 
    } = req.query;

    const rankings = await db.getRankings( // ✅ Add await
      parseInt(page as string),
      parseInt(limit as string),
      skillLevel as string
    );

    res.json({
      success: true,
      data: rankings
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rankings'
    });
  }
});


app.get('/api/players/statistics/overview', async (req, res) => {
  try {
    const stats = await db.getOverviewStats(); // ✅ Add await

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview stats'
    });
  }
});

app.post('/api/players/update-rankings', async (req, res) => {
  try {
    await db.updateRankings(); // ✅ Add await

    res.json({
      success: true,
      message: 'Rankings updated successfully'
    });
  } catch (error) {
    console.error('Error updating rankings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rankings'
    });
  }
});


app.post('/api/players/update-rankings', async (req, res) => {
  try {
    db.updateRankings();

    res.json({
      success: true,
      message: 'Rankings updated successfully'
    });
  } catch (error) {
    console.error('Error updating rankings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rankings'
    });
  }
});
// test endpoint to verify database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const players = await db.getAllPlayers({});
    res.json({
      success: true,
      message: `Database connected successfully. Found ${players.length} players.`,
      data: { playerCount: players.length }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
});
// Demo data endpoint
app.post('/api/players/demo-data', async (req, res) => {
  try {
    await db.addDemoPlayers(); // ✅ Add await

    res.json({
      success: true,
      message: 'Demo players added successfully'
    });
  } catch (error) {
    console.error('Error adding demo players:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add demo players'
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  
  // SQLite constraint error
  if (error.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      success: false,
      error: 'Database constraint violation',
      details: error.message
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Initialize database before starting server
async function initializeApp() {
  try {
    await db.initialize();
    console.log('✅ Database initialized successfully');
    startServer(Number(PORT));
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}
// Start server
function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 API endpoints available at http://localhost:${port}/api`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Please stop the existing process first.`);
      process.exit(1); // clean exit instead of crash
    } else {
      throw err;
    }
  });
}


// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

initializeApp();

export default app;