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
  showDemotionWarning?: boolean;
}

const PlayerCardComponent: React.FC<PlayerCardComponentProps> = ({
  player,
  isSelected = false,
  onSelect,
  showDemotionWarning = true
}) => {
  const skillColor = getSkillLevelColor(player.skillLevel);
  const needsDemotion = shouldPlayerLevelDown(player);

  const handleClick = () => {
    if (onSelect) {
      onSelect(player);
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
        <PlayerAvatar $color={player.color}>
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
            <SkillBadge $color={skillColor}>
              {player.skillLevel}
            </SkillBadge>
            
            <span style={{ 
              fontSize: '0.9rem', 
              color: player.gamesPlayed === 0 ? '#4CAF50' : '#666',
              fontWeight: player.gamesPlayed === 0 ? 'bold' : 'normal'
            }}>
              Games: {player.gamesPlayed}
              {player.gamesPlayed === 0 && ' 🆕'}
            </span>
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
          <strong>Consider leveling down:</strong> Win rate below threshold for {player.skillLevel} level
        </motion.div>
      )}
    </PlayerCard>
  );
};

export default PlayerCardComponent;
