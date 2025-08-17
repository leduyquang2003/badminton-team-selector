import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  Calendar,
  Award,
  Activity,
  Zap
} from 'lucide-react';
import { Player, SkillLevel } from '../types';
import { ActivePlayerService as PlayerService } from '../services/ApiService';

interface PlayerProfileModalProps {
  player: Player;
  onClose: () => void;
}

interface PlayerInsights {
  player: Player;
  rank: number;
  recentMatches: any[];
  topPartners: any[];
  eloHistory: any[];
  performanceMetrics: any;
}

const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ player, onClose }) => {
  const [insights, setInsights] = useState<PlayerInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'partners' | 'equipment'>('overview');

  useEffect(() => {
    loadPlayerInsights();
  }, [player.playerId]);

  const loadPlayerInsights = async () => {
    try {
      setLoading(true);
      const data = await PlayerService.getPlayerInsights(player.playerId);
      setInsights(data);
    } catch (error) {
      console.error('Error loading player insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevelColor = (skillLevel: SkillLevel) => {
    switch (skillLevel) {
      case SkillLevel.BEGINNER: return '#FFC107';
      case SkillLevel.INTERMEDIATE: return '#4ECDC4';
      case SkillLevel.ADVANCED: return '#667eea';
      case SkillLevel.PRO: return '#FF6B6B';
      default: return '#666';
    }
  };

  const getEloChangeColor = (change: number) => {
    if (change > 0) return '#4CAF50';
    if (change < 0) return '#FF6B6B';
    return '#666';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const TabButton: React.FC<{ 
    id: string; 
    label: string; 
    icon: React.ReactNode; 
    active: boolean; 
    onClick: () => void; 
  }> = ({ id, label, icon, active, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        border: 'none',
        background: active ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
        color: active ? 'white' : '#333',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: active ? '600' : '500',
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
      {label}
    </motion.button>
  );

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    color?: string;
    trend?: 'up' | 'down' | 'neutral';
  }> = ({ title, value, subtitle, color = '#667eea', trend }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '1.5rem',
      borderRadius: '12px',
      border: `2px solid ${color}`,
      textAlign: 'center',
      position: 'relative'
    }}>
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '1.8rem', 
        fontWeight: 'bold', 
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        {value}
        {trend === 'up' && <TrendingUp size={20} color="#4CAF50" />}
        {trend === 'down' && <TrendingDown size={20} color="#FF6B6B" />}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.25rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: player.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                {player.avatar}
              </div>
              <div>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.8rem' }}>
                  {player.name}
                </h2>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <span style={{
                    background: getSkillLevelColor(player.skillLevel),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {player.skillLevel}
                  </span>
                  {insights && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>
                      Rank #{insights.rank}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <TabButton
              id="overview"
              label="Overview"
              icon={<Activity size={16} />}
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              id="matches"
              label="Recent Matches"
              icon={<Trophy size={16} />}
              active={activeTab === 'matches'}
              onClick={() => setActiveTab('matches')}
            />
            <TabButton
              id="partners"
              label="Partners"
              icon={<Users size={16} />}
              active={activeTab === 'partners'}
              onClick={() => setActiveTab('partners')}
            />
            <TabButton
              id="equipment"
              label="Equipment"
              icon={<Target size={16} />}
              active={activeTab === 'equipment'}
              onClick={() => setActiveTab('equipment')}
            />
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <StatCard
                    title="Current ELO"
                    value={player.currentElo}
                    subtitle={`Peak: ${player.peakElo}`}
                    color={getSkillLevelColor(player.skillLevel)}
                    trend={player.currentElo > player.initialElo ? 'up' : player.currentElo < player.initialElo ? 'down' : 'neutral'}
                  />
                  <StatCard
                    title="Win Rate"
                    value={`${Math.round(player.stats.winRate * 100)}%`}
                    subtitle={`${player.stats.wins}W - ${player.stats.losses}L`}
                    color="#4CAF50"
                  />
                  <StatCard
                    title="Total Matches"
                    value={player.stats.totalMatches}
                    subtitle="Games played"
                    color="#FF9800"
                  />
                  <StatCard
                    title="Win Streak"
                    value={player.stats.currentWinStreak}
                    subtitle={`Best: ${player.stats.longestWinStreak}`}
                    color="#9C27B0"
                  />
                </div>

                {/* Performance Metrics */}
                {insights && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Performance Metrics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>ELO Progress</div>
                        <div style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: 'bold',
                          color: getEloChangeColor(insights.performanceMetrics.eloGain)
                        }}>
                          {insights.performanceMetrics.eloGain > 0 ? '+' : ''}{insights.performanceMetrics.eloGain}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Recent Form</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>
                          {Math.round(player.stats.recentFormWinRate * 100)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Avg Score Diff</div>
                        <div style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: 'bold',
                          color: insights.performanceMetrics.averageScoreDifferential > 0 ? '#4CAF50' : '#FF6B6B'
                        }}>
                          {insights.performanceMetrics.averageScoreDifferential > 0 ? '+' : ''}
                          {insights.performanceMetrics.averageScoreDifferential.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Player Info */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '1.5rem',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Player Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Age</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{player.age}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Hand</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                        {player.hand.charAt(0) + player.hand.slice(1).toLowerCase()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Specialty</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                        {player.specialty.replace('_', ' ')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>Last Active</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                        {formatDate(player.lastActiveAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'matches' && insights && (
              <motion.div
                key="matches"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '1.5rem',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Recent Match History</h4>
                  {insights.recentMatches.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                      No recent matches found
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {insights.recentMatches.slice(0, 10).map((match, index) => {
                        const isPlayerInTeam1 = match.team1.player1Id === player.playerId || match.team1.player2Id === player.playerId;
                        const playerScore = isPlayerInTeam1 ? match.score.team1 : match.score.team2;
                        const opponentScore = isPlayerInTeam1 ? match.score.team2 : match.score.team1;
                        const won = playerScore > opponentScore;
                        
                        return (
                          <div key={match.matchId} style={{
                            padding: '1rem',
                            background: won ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            borderRadius: '8px',
                            border: `1px solid ${won ? '#4CAF50' : '#f44336'}`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ 
                                  fontSize: '1rem', 
                                  fontWeight: 'bold',
                                  color: won ? '#4CAF50' : '#f44336'
                                }}>
                                  {won ? '🏆 Victory' : '💔 Defeat'}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                  Score: {playerScore} - {opponentScore}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {formatDate(match.date)}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                  {match.matchType}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'partners' && (
              <motion.div
                key="partners"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '1.5rem',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Frequent Partners</h4>
                  {player.frequentPartners.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                      No partnership data available
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {player.frequentPartners
                        .sort((a, b) => b.matchesPlayed - a.matchesPlayed)
                        .map((partner) => (
                        <div key={partner.playerId} style={{
                          padding: '1rem',
                          background: 'rgba(103, 126, 234, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid #667eea'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>
                                {partner.playerName}
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {partner.matchesPlayed} matches together
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ 
                                fontSize: '1.2rem', 
                                fontWeight: 'bold',
                                color: partner.winRate > 0.6 ? '#4CAF50' : partner.winRate > 0.4 ? '#FF9800' : '#f44336'
                              }}>
                                {Math.round(partner.winRate * 100)}%
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                Win Rate
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'equipment' && (
              <motion.div
                key="equipment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '1.5rem',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Equipment Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Racket Brand</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                        {player.racket.brand}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Model</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                        {player.racket.model}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Weight</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                        {player.racket.weight}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>String Tension</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                        {player.racket.tension}
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>String Type</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                        {player.racket.string}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlayerProfileModal;