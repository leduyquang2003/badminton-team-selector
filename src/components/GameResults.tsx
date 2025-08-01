import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw } from 'lucide-react';
import { Team, GameResult } from '../types';
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  TeamCard
} from '../styles/StyledComponents';

interface GameResultsProps {
  team1: Team;
  team2: Team;
  onGameComplete: (result: GameResult) => void;
  onPlayAgain: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({
  team1,
  team2,
  onGameComplete,
  onPlayAgain
}) => {
  const [selectedWinner, setSelectedWinner] = useState<Team | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitResult = () => {
    if (!selectedWinner) return;

    const gameResult: GameResult = {
      id: Date.now().toString(),
      team1,
      team2,
      winner: selectedWinner,
      date: new Date(),
      playersInvolved: [...team1.players, ...team2.players]
    };

    onGameComplete(gameResult);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          >
            🎉
          </motion.div>
          
          <h2 style={{ color: '#4ECDC4', marginBottom: '1rem' }}>
            Game Result Recorded!
          </h2>
          
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Player stats have been updated. Ready for the next game?
          </p>
          
          <PrimaryButton
            onClick={onPlayAgain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} style={{ marginRight: '0.5rem' }} />
            Play Another Game
          </PrimaryButton>
        </div>
      </Card>
    );
  }

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
        <Trophy size={28} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Who Won the Game?
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <TeamCard
          onClick={() => setSelectedWinner(team1)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            cursor: 'pointer',
            border: selectedWinner?.id === team1.id ? '3px solid #4ECDC4' : '3px solid transparent',
            background: selectedWinner?.id === team1.id ? 
              'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05))' :
              'rgba(255, 255, 255, 0.95)'
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            Team 1: {team1.players.map(p => p.name).join(' & ')}
          </h3>
          {team1.players.map(player => (
            <div key={player.id} style={{ 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{player.avatar}</span>
              <span style={{ fontWeight: 'bold' }}>{player.name}</span>
              <span style={{ 
                background: player.skillLevel === 'Beginner' ? '#4CAF50' :
                           player.skillLevel === 'Intermediate' ? '#FF9800' : '#F44336',
                color: 'white',
                padding: '0.1rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.7rem'
              }}>
                {player.skillLevel}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>
                ({(player.winRate * 100).toFixed(0)}% WR)
              </span>
            </div>
          ))}
        </TeamCard>

        <TeamCard
          onClick={() => setSelectedWinner(team2)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            cursor: 'pointer',
            border: selectedWinner?.id === team2.id ? '3px solid #4ECDC4' : '3px solid transparent',
            background: selectedWinner?.id === team2.id ? 
              'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05))' :
              'rgba(255, 255, 255, 0.95)'
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            Team 2: {team2.players.map(p => p.name).join(' & ')}
          </h3>
          {team2.players.map(player => (
            <div key={player.id} style={{ 
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>{player.avatar}</span>
              <span style={{ fontWeight: 'bold' }}>{player.name}</span>
              <span style={{ 
                background: player.skillLevel === 'Beginner' ? '#4CAF50' :
                           player.skillLevel === 'Intermediate' ? '#FF9800' : '#F44336',
                color: 'white',
                padding: '0.1rem 0.5rem',
                borderRadius: '10px',
                fontSize: '0.7rem'
              }}>
                {player.skillLevel}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#666' }}>
                ({(player.winRate * 100).toFixed(0)}% WR)
              </span>
            </div>
          ))}
        </TeamCard>
      </div>

      <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <SecondaryButton
          onClick={onPlayAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </SecondaryButton>
        
        <PrimaryButton
          onClick={handleSubmitResult}
          disabled={!selectedWinner}
          whileHover={{ scale: selectedWinner ? 1.05 : 1 }}
          whileTap={{ scale: selectedWinner ? 0.95 : 1 }}
        >
          <Trophy size={20} style={{ marginRight: '0.5rem' }} />
          Record Result
        </PrimaryButton>
      </div>
    </Card>
  );
};

export default GameResults;
