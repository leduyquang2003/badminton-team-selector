import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Zap, Users, UserCheck, Trash2, Menu, X } from 'lucide-react';
import { Player, Team, GameResult, AppState, SkillLevel } from './types';
import { generateBalancedTeams, calculateTeamStrength } from './utils/gameLogic';
import AddPlayerForm from './components/AddPlayerForm';
import PlayerCardComponent from './components/PlayerCard';
import TeamDisplay from './components/TeamDisplay';
import GameResults from './components/GameResults';
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
  const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('badmintonTeamSelector');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setAppState(prevState => ({
          ...prevState,
          players: parsedData.players || [],
          gameHistory: parsedData.gameHistory || []
        }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever players or gameHistory changes
  useEffect(() => {
    const dataToSave = {
      players: appState.players,
      gameHistory: appState.gameHistory
    };
    localStorage.setItem('badmintonTeamSelector', JSON.stringify(dataToSave));
  }, [appState.players, appState.gameHistory]);

  const addDemoPlayers = () => {
    const demoPlayers: Player[] = [
      {
        id: 'demo1',
        name: 'Alice Chen',
        skillLevel: SkillLevel.INTERMEDIATE,
        winRate: 0.65,
        gamesPlayed: 0, // New player - should be prioritized
        avatar: '🏸',
        color: '#FF6B6B'
      },
      {
        id: 'demo2',
        name: 'Bob Smith',
        skillLevel: SkillLevel.BEGINNER,
        winRate: 0.45,
        gamesPlayed: 3,
        avatar: '⭐',
        color: '#4ECDC4'
      },
      {
        id: 'demo3',
        name: 'Carol Wong',
        skillLevel: SkillLevel.PRO,
        winRate: 0.78,
        gamesPlayed: 0, // New player - should be prioritized
        avatar: '🔥',
        color: '#45B7D1'
      },
      {
        id: 'demo4',
        name: 'David Kumar',
        skillLevel: SkillLevel.INTERMEDIATE,
        winRate: 0.52,
        gamesPlayed: 5,
        avatar: '💪',
        color: '#96CEB4'
      },
      {
        id: 'demo5',
        name: 'Eva Martinez',
        skillLevel: SkillLevel.BEGINNER,
        winRate: 0.38,
        gamesPlayed: 0, // New player - should be prioritized
        avatar: '🎯',
        color: '#FECA57'
      },
      {
        id: 'demo6',
        name: 'Frank Liu',
        skillLevel: SkillLevel.PRO,
        winRate: 0.82,
        gamesPlayed: 7,
        avatar: '🚀',
        color: '#FF9FF3'
      },
      {
        id: 'demo7',
        name: 'Grace Kim',
        skillLevel: SkillLevel.INTERMEDIATE,
        winRate: 0.58,
        gamesPlayed: 0, // New player - should be prioritized
        avatar: '🌟',
        color: '#54A0FF'
      },
      {
        id: 'demo8',
        name: 'Henry Park',
        skillLevel: SkillLevel.BEGINNER,
        winRate: 0.42,
        gamesPlayed: 2,
        avatar: '⚡',
        color: '#5F27CD'
      }
    ];

    setAppState(prevState => ({
      ...prevState,
      players: [...prevState.players, ...demoPlayers.filter(demo => 
        !prevState.players.some(existing => existing.id === demo.id)
      )]
    }));
  };

  const addPlayer = (newPlayer: Player) => {
    setAppState(prevState => ({
      ...prevState,
      players: [...prevState.players, newPlayer]
    }));
  };

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const generateTeams = async () => {
    // Auto-select players if none are manually selected
    let playersToUse: Player[] = selectedPlayers;
    
    if (selectedPlayers.length === 0 && appState.players.length >= 4) {
      // Auto-select players based on games played (prioritize those who haven't played)
      playersToUse = appState.players
        .sort((a, b) => {
          const gamesDiff = a.gamesPlayed - b.gamesPlayed;
          if (gamesDiff !== 0) return gamesDiff;
          return Math.random() - 0.5; // Randomize if same games played
        })
        .slice(0, 4);
    } else if (selectedPlayers.length < 4) {
      alert('Please select at least 4 players to generate teams, or let the app auto-select players');
      return;
    }

    setIsGeneratingTeams(true);
    
    // Add some delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const [team1Players, team2Players] = generateBalancedTeams(playersToUse, appState.players);
      
      const team1: Team = {
        id: 'team1',
        players: team1Players,
        name: 'Team 1',
        averageSkillLevel: calculateTeamStrength(team1Players),
        combinedWinRate: team1Players.reduce((sum, p) => sum + p.winRate, 0) / team1Players.length
      };

      const team2: Team = {
        id: 'team2',
        players: team2Players,
        name: 'Team 2',
        averageSkillLevel: calculateTeamStrength(team2Players),
        combinedWinRate: team2Players.reduce((sum, p) => sum + p.winRate, 0) / team2Players.length
      };

      setAppState(prevState => ({
        ...prevState,
        teams: [team1, team2],
        currentScreen: 'teams'
      }));
    } catch (error) {
      alert('Error generating teams: ' + (error as Error).message);
    } finally {
      setIsGeneratingTeams(false);
    }
  };

  const updatePlayerStats = (gameResult: GameResult) => {
    setAppState(prevState => {
      const updatedPlayers = prevState.players.map(player => {
        const isInGame = gameResult.playersInvolved.some(p => p.id === player.id);
        if (!isInGame) return player;

        const isWinner = gameResult.winner.players.some(p => p.id === player.id);
        const newGamesPlayed = player.gamesPlayed + 1;
        const currentWins = Math.round(player.winRate * player.gamesPlayed);
        const newWins = currentWins + (isWinner ? 1 : 0);
        const newWinRate = newWins / newGamesPlayed;

        return {
          ...player,
          gamesPlayed: newGamesPlayed,
          winRate: newWinRate
        };
      });

      return {
        ...prevState,
        players: updatedPlayers,
        gameHistory: [...prevState.gameHistory, gameResult]
      };
    });
  };

  const handleGameComplete = (result: GameResult) => {
    updatePlayerStats(result);
    setAppState(prevState => ({
      ...prevState,
      currentScreen: 'results'
    }));
  };

  const resetToLobby = () => {
    setAppState(prevState => ({
      ...prevState,
      currentScreen: 'lobby',
      teams: []
    }));
    setSelectedPlayers([]);
  };

  const clearAllData = () => {
    const confirmClear = window.confirm(
      'Are you sure you want to clear all players and game history? This action cannot be undone.'
    );
    
    if (confirmClear) {
      setAppState({
        players: [],
        teams: [],
        gameHistory: [],
        currentScreen: 'lobby'
      });
      setSelectedPlayers([]);
      localStorage.removeItem('badmintonTeamSelector');
    }
  };

  const navigateToScreen = (screen: AppState['currentScreen']) => {
    setAppState(prevState => ({
      ...prevState,
      currentScreen: screen
    }));
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
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
          $active={appState.currentScreen === 'history'}
          onClick={() => navigateToScreen('history')}
        >
          📊 Game History ({appState.gameHistory.length})
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
          $active={appState.currentScreen === 'history'}
          onClick={() => navigateToScreen('history')}
        >
          📊 Game History ({appState.gameHistory.length})
        </MobileNavButton>

        {appState.players.length > 0 && (
          <MobileNavButton 
            $active={false}
            onClick={clearAllData}
            style={{ 
              backgroundColor: '#ff6b6b', 
              borderColor: '#ff6b6b',
              color: 'white',
              marginTop: '2rem'
            }}
          >
            <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
            Clear All Data
          </MobileNavButton>
        )}
      </MobileNavContainer>
    </>
  );

  const renderLobby = () => (
    <>
      <AddPlayerForm onAddPlayer={addPlayer} existingPlayers={appState.players} />
      
      {appState.players.length === 0 ? (
        <EmptyState>
          <h3 style={{ color: '#fff' }}>🏸 Welcome to Badminton Team Selector!</h3>
          <p style={{ color: '#fff' }}>Add some players to get started with balanced team generation.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <SecondaryButton
              onClick={addDemoPlayers}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ Add Demo Players
            </SecondaryButton>
          </div>
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
                  <strong>Smart Auto-Selection Mode:</strong> Teams will be generated automatically, prioritizing players with fewer games played
                </p>
              </div>
            )}

            <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '1rem' }}>
              Click players to manually select them, or use auto-selection for balanced matchmaking based on game history.
            </div>
          </div>

          <PlayersGrid>
            {appState.players
              .sort((a, b) => a.gamesPlayed - b.gamesPlayed) // Show players with fewer games first
              .map(player => (
              <PlayerCardComponent
                key={player.id}
                player={player}
                isSelected={selectedPlayers.some(p => p.id === player.id)}
                onSelect={togglePlayerSelection}
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
          Teams Generated!
        </h2>
        
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

  const renderHistory = () => (
    <Card>
      <h3 style={{ marginBottom: '2rem', color: '#333', zIndex: 1 }}>Game History</h3>

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
                    <div>{game.playersInvolved.length} players</div>
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

  if (isGeneratingTeams) {
    return (
      <AppContainer>
        <TeamGenerationContainer>
          <GeneratingText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Generating Balanced Teams...
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
            Analyzing skill levels and win rates for optimal balance...
          </motion.p>
        </TeamGenerationContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <Title>
          🏸 Badminton Team Selector
        </Title>
        
        {/* Desktop Navigation and Clear Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {renderNavigation()}
          {appState.players.length > 0 && (
            <SecondaryButton
              onClick={clearAllData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                backgroundColor: '#ff6b6b', 
                color: 'white',
                padding: '0.5rem 0.8rem',
                fontSize: '0.8rem'
              }}
            >
              <Trash2 size={16} style={{ marginRight: '0.3rem' }} />
              Clear All
            </SecondaryButton>
          )}
        </div>

        {/* Mobile Hamburger Button */}
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
