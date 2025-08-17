import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Zap, Users, UserCheck, Trash2, Menu, X, Trophy, TrendingUp } from 'lucide-react';
import { Player, Team, GameResult, AppState } from './types';
import { ActivePlayerService as PlayerService } from './services/ApiService';
import AddPlayerForm from './components/AddPlayerForm';
import PlayerCardComponent from './components/PlayerCard';
import TeamDisplay from './components/TeamDisplay';
import GameResults from './components/GameResults';
import PlayerProfileModal from './components/PlayerProfileModal';
import LeaderboardView from './components/LeaderboardView';
import {
  AppContainer,
  Header,
  Title,
  MainContent,
  PlayersGrid,
  TeamsContainer,
  PrimaryButton,
  SecondaryButton,
  NavContainer,
  NavButton,
  MobileNavContainer,
  MobileMenuOverlay,
  HamburgerButton,
  MobileNavButton,
  EmptyState,
  TeamGenerationContainer,
  GeneratingText,
  ShuffleAnimation,
  Card
} from './styles/StyledComponents';

function App() {
  const [appState, setAppState] = useState<AppState>({
    players: [],
    teams: [],
    gameHistory: [],
    currentScreen: 'lobby'
  });

  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<Player | null>(null);
  const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamGenerationResult, setTeamGenerationResult] = useState<any>(null);

  // Load players on component mount
  useEffect(() => {
    const initializeApp = async () => {
      await testBackendConnection();
      await loadPlayers();
    };
    
    initializeApp();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const players = await PlayerService.getAllPlayers({
        sortBy: 'totalMatches',
        sortOrder: 'asc',
        limit: 50
      });
      
      setAppState(prevState => ({
        ...prevState,
        players
      }));
    } catch (error) {
      console.error('Error loading players:', error);
      setError('Failed to load players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async (newPlayerData: Omit<Player, '_id' | 'playerId' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>) => {
    try {
      setLoading(true);
      const newPlayer = await PlayerService.createPlayer(newPlayerData);
      
      setAppState(prevState => ({
        ...prevState,
        players: [...prevState.players, newPlayer]
      }));
    } catch (error) {
      console.error('Error adding player:', error);
      setError('Failed to add player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      const isConnected = await PlayerService.testConnection();
      if (!isConnected) {
        setError('❌ Cannot connect to backend server. Please make sure your backend is running on port 3001.');
      } else {
        console.log('✅ Backend connection successful');
      }
    } catch (error) {
      setError('❌ Backend server is not running. Please start your backend server first.');
    }
  };
  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.playerId === player.playerId);
      if (isSelected) {
        return prev.filter(p => p.playerId !== player.playerId);
      } else {
        return [...prev, player];
      }
    });
  };

  const generateTeams = async () => {
    try {
      setIsGeneratingTeams(true);
      
      // Add some delay for animation effect
      await new Promise(resolve => setTimeout(resolve, 2000));

      const selectedPlayerIds = selectedPlayers.length >= 4 
        ? selectedPlayers.map(p => p.playerId)
        : undefined;

      const result = await PlayerService.generateOptimalTeams(selectedPlayerIds, {
        prioritizeNewPlayers: true,
        maxEloDifference: 200,
        avoidRecentOpponents: true,
        balanceThreshold: 70
      });

      setTeamGenerationResult(result);

      const team1: Team = {
        id: 'team1',
        players: result.team1,
        name: 'Team 1',
        averageSkillLevel: result.team1.reduce((sum: number, p: Player) => sum + p.currentElo, 0) / result.team1.length,
        combinedWinRate: result.team1.reduce((sum: number, p: Player) => sum + p.stats.winRate, 0) / result.team1.length
      };

      const team2: Team = {
        id: 'team2',
        players: result.team2,
        name: 'Team 2',
        averageSkillLevel: result.team2.reduce((sum: number, p: Player) => sum + p.currentElo, 0) / result.team2.length,
        combinedWinRate: result.team2.reduce((sum: number, p: Player) => sum + p.stats.winRate, 0) / result.team2.length
      };

      setAppState(prevState => ({
        ...prevState,
        teams: [team1, team2],
        currentScreen: 'teams'
      }));
    } catch (error) {
      console.error('Error generating teams:', error);
      setError('Failed to generate teams. Please try again.');
    } finally {
      setIsGeneratingTeams(false);
    }
  };

  const handleGameComplete = async (result: GameResult) => {
    try {
      setLoading(true);
      
      const matchResult = {
        matchId: `match_${Date.now()}`,
        date: new Date(),
        team1: {
          player1Id: result.winner.players[0]?.playerId || '',
          player2Id: result.winner.players[1]?.playerId
        },
        team2: {
          player1Id: result.loser.players[0]?.playerId || '',
          player2Id: result.loser.players[1]?.playerId
        },
        score: {
          team1: result.winner.id === 'team1' ? result.winnerScore : result.loserScore,
          team2: result.winner.id === 'team1' ? result.loserScore : result.winnerScore
        },
        matchType: 'DOUBLES' as const,
        duration: 30 // Default 30 minutes, could be user input
      };

      await PlayerService.recordMatchResult(matchResult);
      
      // Reload players to get updated stats
      await loadPlayers();
      
      setAppState(prevState => ({
        ...prevState,
        currentScreen: 'results',
        gameHistory: [...prevState.gameHistory, result]
      }));
    } catch (error) {
      console.error('Error recording game result:', error);
      setError('Failed to record game result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetToLobby = () => {
    setAppState(prevState => ({
      ...prevState,
      currentScreen: 'lobby',
      teams: []
    }));
    setSelectedPlayers([]);
    setTeamGenerationResult(null);
  };

  const navigateToScreen = (screen: AppState['currentScreen']) => {
    setAppState(prevState => ({
      ...prevState,
      currentScreen: screen
    }));
    setIsMobileMenuOpen(false);
  };

  const openPlayerProfile = (player: Player) => {
    setSelectedPlayerProfile(player);
    navigateToScreen('profile');
  };

  const closePlayerProfile = () => {
    setSelectedPlayerProfile(null);
    navigateToScreen('lobby');
  };

  const renderNavigation = () => (
    <>
      {/* Desktop Navigation */}
      <NavContainer>
        <NavButton 
          $active={appState.currentScreen === 'lobby'}
          onClick={() => navigateToScreen('lobby')}
        >
          <Users size={16} style={{ marginRight: '0.5rem' }} />
          Lobby
        </NavButton>
        
        {appState.teams.length > 0 && (
          <NavButton 
            $active={appState.currentScreen === 'teams'}
            onClick={() => navigateToScreen('teams')}
          >
            <UserCheck size={16} style={{ marginRight: '0.5rem' }} />
            Current Teams
          </NavButton>
        )}
        
        <NavButton 
          $active={appState.currentScreen === 'leaderboard'}
          onClick={() => navigateToScreen('leaderboard')}
        >
          <Trophy size={16} style={{ marginRight: '0.5rem' }} />
          Leaderboard
        </NavButton>
        
        <NavButton 
          $active={appState.currentScreen === 'history'}
          onClick={() => navigateToScreen('history')}
        >
          <TrendingUp size={16} style={{ marginRight: '0.5rem' }} />
          History
        </NavButton>
      </NavContainer>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay 
        $isOpen={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Navigation Menu */}
      <MobileNavContainer $isOpen={isMobileMenuOpen}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ color: '#667eea', margin: 0 }}>Menu</h3>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '5px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <MobileNavButton 
          $active={appState.currentScreen === 'lobby'}
          onClick={() => navigateToScreen('lobby')}
        >
          <Users size={16} style={{ marginRight: '0.5rem' }} />
          Lobby
        </MobileNavButton>
        
        {appState.teams.length > 0 && (
          <MobileNavButton 
            $active={appState.currentScreen === 'teams'}
            onClick={() => navigateToScreen('teams')}
          >
            <UserCheck size={16} style={{ marginRight: '0.5rem' }} />
            Current Teams
          </MobileNavButton>
        )}
        
        <MobileNavButton 
          $active={appState.currentScreen === 'leaderboard'}
          onClick={() => navigateToScreen('leaderboard')}
        >
          <Trophy size={16} style={{ marginRight: '0.5rem' }} />
          Leaderboard
        </MobileNavButton>
        
        <MobileNavButton 
          $active={appState.currentScreen === 'history'}
          onClick={() => navigateToScreen('history')}
        >
          <TrendingUp size={16} style={{ marginRight: '0.5rem' }} />
          History
        </MobileNavButton>
      </MobileNavContainer>
    </>
  );

  const renderLobby = () => (
    <>
      <AddPlayerForm onAddPlayer={addPlayer} existingPlayers={appState.players} />
      
      {loading ? (
        <EmptyState>
          <div style={{ color: '#fff' }}>Loading players...</div>
        </EmptyState>
      ) : appState.players.length === 0 ? (
        <EmptyState>
          <h3 style={{ color: '#fff' }}>🏸 Welcome to Badminton Team Selector!</h3>
          <p style={{ color: '#fff' }}>Add some players to get started with ELO-based balanced team generation.</p>
        </EmptyState>
      ) : (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#333', margin: 0 }}>
                Players Pool ({appState.players.length} total)
              </h3>
              
              {appState.players.length >= 4 && (
                <PrimaryButton
                  onClick={generateTeams}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGeneratingTeams}
                >
                  <Shuffle size={20} style={{ marginRight: '0.5rem' }} />
                  {isGeneratingTeams ? 'Generating...' : 'Generate Teams'}
                </PrimaryButton>
              )}
            </div>

            {selectedPlayers.length > 0 ? (
              <div style={{ 
                background: 'rgba(78, 205, 196, 0.1)', 
                padding: '1rem', 
                borderRadius: '10px',
                marginBottom: '1rem',
                border: '2px solid #4ECDC4'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, color: '#333', fontSize: '0.9rem' }}>
                    <strong>{selectedPlayers.length} players manually selected</strong> - Teams will be generated from your selection
                  </p>
                  <SecondaryButton
                    onClick={() => setSelectedPlayers([])}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    Clear Selection
                  </SecondaryButton>
                </div>
              </div>
            ) : (
              <div style={{ 
                background: 'rgba(255, 193, 7, 0.1)', 
                padding: '1rem', 
                borderRadius: '10px',
                marginBottom: '1rem',
                border: '2px solid #FFC107'
              }}>
                <p style={{ margin: 0, color: '#333', fontSize: '0.9rem' }}>
                  <strong>Smart Auto-Selection Mode:</strong> Advanced ELO-based matchmaking will prioritize players with fewer games and balanced skill distribution
                </p>
              </div>
            )}

            <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '1rem' }}>
              Click players to manually select them, or use auto-selection for optimal ELO-balanced matchmaking.
            </div>
          </div>

          <PlayersGrid>
            {appState.players
              .sort((a, b) => a.stats.totalMatches - b.stats.totalMatches)
              .map(player => (
              <PlayerCardComponent
                key={player.playerId}
                player={player}
                isSelected={selectedPlayers.some(p => p.playerId === player.playerId)}
                onSelect={togglePlayerSelection}
                onViewProfile={() => openPlayerProfile(player)}
                showElo={true}
              />
            ))}
          </PlayersGrid>
        </>
      )}
    </>
  );

  const renderTeams = () => (
    <>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>
          <Zap size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Optimal Teams Generated!
        </h2>
        
        {teamGenerationResult && (
          <div style={{ 
            background: 'rgba(76, 175, 80, 0.1)', 
            padding: '1rem', 
            borderRadius: '10px',
            marginBottom: '1rem',
            border: '1px solid #4CAF50'
          }}>
            <div style={{ color: '#333', fontSize: '0.9rem' }}>
              <div><strong>Balance Score:</strong> {teamGenerationResult.balanceScore}/100</div>
              <div><strong>Confidence:</strong> {teamGenerationResult.confidence}/100</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                <strong>Reasoning:</strong> {teamGenerationResult.reasoning.join(', ')}
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <SecondaryButton
            onClick={resetToLobby}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shuffle size={16} style={{ marginRight: '0.5rem' }} />
            Regenerate
          </SecondaryButton>
          
          <PrimaryButton
            onClick={() => setAppState(prev => ({ ...prev, currentScreen: 'results' }))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🏆 Record Game Result
          </PrimaryButton>
        </div>
      </div>

      <TeamsContainer>
        {appState.teams.map((team, index) => (
          <TeamDisplay
            key={team.id}
            team={team}
            teamNumber={index + 1}
            showEloInfo={true}
          />
        ))}
      </TeamsContainer>
    </>
  );

  const renderResults = () => {
    if (appState.teams.length !== 2) {
      return (
        <EmptyState>
          <h3>No active game</h3>
          <p>Generate teams first to record game results.</p>
        </EmptyState>
      );
    }

    return (
      <GameResults
        team1={appState.teams[0]}
        team2={appState.teams[1]}
        onGameComplete={handleGameComplete}
        onPlayAgain={resetToLobby}
      />
    );
  };

  const renderLeaderboard = () => (
    <LeaderboardView />
  );

  const renderPlayerProfile = () => {
    if (!appState.selectedPlayerProfile) {
      return (
        <EmptyState>
          <h3>No player selected</h3>
          <p>Select a player to view their profile.</p>
        </EmptyState>
      );
    }

    return (
      <PlayerProfileModal
        player={appState.selectedPlayerProfile}
        onClose={() => navigateToScreen('lobby')}
      />
    );
  };

  const renderHistory = () => (
    <Card>
      <h3 style={{ marginBottom: '2rem', color: '#333' }}>Game History</h3>

      {appState.gameHistory.length === 0 ? (
        <EmptyState>
          <h3>No games played yet</h3>
          <p>Start playing some games to see the history here!</p>
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appState.gameHistory.slice().reverse().map((game, index) => {
            const winnerNames = game.winner.players.map(p => p.name).join(' & ');
            const loserTeam = game.winner.id === game.team1.id ? game.team2 : game.team1;
            const loserNames = loserTeam.players.map(p => p.name).join(' & ');
            
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid #eee'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#4CAF50' }}>🏆 Winners: {winnerNames}</strong>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>
                      vs. {loserNames}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      {new Date(game.date).toLocaleDateString()} at {new Date(game.date).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666',
                    textAlign: 'right'
                  }}>
                    <div>Score: {game.winnerScore} - {game.loserScore}</div>
                    <div style={{ fontSize: '0.7rem', color: '#999' }}>
                      Game #{appState.gameHistory.length - index}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );

  if (error) {
    return (
      <AppContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#ff6b6b',
          textAlign: 'center'
        }}>
          <div>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => {
              setError(null);
              loadPlayers();
            }}>
              Retry
            </button>
          </div>
        </div>
      </AppContainer>
    );
  }

  if (isGeneratingTeams) {
    return (
      <AppContainer>
        <TeamGenerationContainer>
          <GeneratingText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Generating ELO-Balanced Teams...
          </GeneratingText>
          
          <ShuffleAnimation>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🏸
            </motion.div>
          </ShuffleAnimation>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ color: '#666', fontSize: '1.1rem' }}
          >
            Analyzing ELO ratings, match history, and partnerships for optimal balance...
          </motion.p>
        </TeamGenerationContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <Title>
          🏸 Badminton Team Selector Pro 1.0
        </Title>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {renderNavigation()}
        </div>

        <HamburgerButton onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </HamburgerButton>
      </Header>

      <MainContent>
        <AnimatePresence mode="wait">
          {appState.currentScreen === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderLobby()}
            </motion.div>
          )}

          {appState.currentScreen === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTeams()}
            </motion.div>
          )}

          {appState.currentScreen === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderResults()}
            </motion.div>
          )}

          {appState.currentScreen === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderLeaderboard()}
            </motion.div>
          )}

          {appState.currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPlayerProfile()}
            </motion.div>
          )}

          {appState.currentScreen === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderHistory()}
            </motion.div>
          )}
        </AnimatePresence>
      </MainContent>
    </AppContainer>
  );
}

export default App;