import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Player } from '../types';
import { getSkillLevelColor, shouldPlayerLevelDown } from '../utils/gameLogic';
import {
  PlayerCard,
  PlayerInfo,
  PlayerAvatar,
  PlayerDetails,
  PlayerName,
  SkillBadge,
  WinRateDisplay
} from '../styles/StyledComponents';

interface PlayerCardComponentProps {
  player: Player;
  isSelected?: boolean;
  onSelect?: (player: Player) => void;
  onViewProfile?: (player: Player) => void;
  showDemotionWarning?: boolean;
  showElo?: boolean;
}

const PlayerCardComponent: React.FC<PlayerCardComponentProps> = ({
  player,
  isSelected = false,
  onSelect,
  onViewProfile,
  showDemotionWarning = true,
  showElo = false
}) => {
  const skillColor = getSkillLevelColor(player.skillLevel);
  const needsDemotion = shouldPlayerLevelDown(player);

  const handleClick = () => {
    if (onSelect) onSelect(player);
  };

  const handleViewProfile = async () => {
    if (onViewProfile) onViewProfile(player);

    // 🔹 Example API call sending minimal data (only playerId)
    try {
      const res = await fetch('http://localhost:3000/api/player/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id })
      });

      if (!res.ok) {
        throw new Error(`Failed to record player view: ${res.statusText}`);
      }
      console.log(`✅ View recorded for player ${player.name}`);
    } catch (err) {
      console.error('❌ Error recording player view:', err);
    }
  };

  return (
    <PlayerCard
      $skillColor={skillColor}
      $isSelected={isSelected}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PlayerInfo>
        <PlayerAvatar
          $color={player.color}
          onClick={handleViewProfile}
          style={{ cursor: onViewProfile ? 'pointer' : 'default' }}
        >
          {player.avatar}
        </PlayerAvatar>

        <PlayerDetails>
          <PlayerName>
            {player.name}
            {needsDemotion && showDemotionWarning && (
              <span title="May need to level down">
                <AlertCircle
                  size={20}
                  color="#FF6B6B"
                  style={{ marginLeft: '0.5rem' }}
                />
              </span>
            )}
          </PlayerName>

          <div>
            <SkillBadge $color={skillColor}>{player.skillLevel}</SkillBadge>

            <span
              style={{
                fontSize: '0.9rem',
                color: player.gamesPlayed === 0 ? '#4CAF50' : '#666',
                fontWeight: player.gamesPlayed === 0 ? 'bold' : 'normal'
              }}
            >
              Games: {player.gamesPlayed}
              {player.gamesPlayed === 0 && ' 🆕'}
            </span>
            {showElo && (
              <span
                style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#555'
                }}
              >
                Elo: {player.currentElo}
              </span>
            )}
          </div>
        </PlayerDetails>

        <WinRateDisplay>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {(player.winRate * 100).toFixed(1)}%
          </div>
          <div>Win Rate</div>
        </WinRateDisplay>
      </PlayerInfo>

      {needsDemotion && showDemotionWarning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#FFF3E0',
            borderRadius: '10px',
            borderLeft: '4px solid #FF9800',
            fontSize: '0.9rem',
            color: '#E65100'
          }}
        >
          <strong>Consider leveling down:</strong> Win rate below threshold for{' '}
          {player.skillLevel} level
        </motion.div>
      )}
    </PlayerCard>
  );
};

export default PlayerCardComponent;
