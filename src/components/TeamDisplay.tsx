import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Team } from '../types';
import { calculateTeamStrength } from '../utils/gameLogic';
import {
  TeamCard,
  PlayerInfo,
  PlayerAvatar,
  PlayerName,
  SkillBadge
} from '../styles/StyledComponents';

interface TeamDisplayProps {
  team: Team;
  teamNumber: number;
  onPlayerClick?: (playerId: string) => void;
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ team, teamNumber, onPlayerClick }) => {
  const teamStrength = calculateTeamStrength(team.players);

  return (
    <TeamCard
      initial={{ opacity: 0, x: teamNumber === 1 ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={24} />
          Team {teamNumber}
        </h3>
        
        <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#666' }}>
          <div>Strength: {teamStrength.toFixed(1)}</div>
          <div>Avg Win Rate: {(team.combinedWinRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {team.players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
            onClick={() => onPlayerClick?.(player.id)}
            style={{ cursor: onPlayerClick ? 'pointer' : 'default' }}
          >
            <PlayerInfo>
              <PlayerAvatar $color={player.color} style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>
                {player.avatar}
              </PlayerAvatar>
              
              <div style={{ flex: 1 }}>
                <PlayerName style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {player.name}
                </PlayerName>
                
                <div>
                  <SkillBadge 
                    $color={
                      player.skillLevel === 'Beginner' ? '#4CAF50' :
                      player.skillLevel === 'Intermediate' ? '#FF9800' : '#F44336'
                    }
                  >
                    {player.skillLevel}
                  </SkillBadge>
                </div>
              </div>
              
              <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#666' }}>
                <div style={{ fontWeight: 'bold' }}>
                  {(player.winRate * 100).toFixed(1)}%
                </div>
                <div>Win Rate</div>
              </div>
            </PlayerInfo>
          </motion.div>
        ))}
      </div>

      {team.players.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#999',
          fontSize: '0.9rem'
        }}>
          No players assigned
        </div>
      )}
    </TeamCard>
  );
};

export default TeamDisplay;
