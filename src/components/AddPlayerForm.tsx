import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Player, SkillLevel } from '../types';
import { getRandomAvatar, getRandomColor } from '../utils/gameLogic';
import {
  FormContainer,
  FormGroup,
  Label,
  Input,
  Select,
  PrimaryButton,
  CheckboxContainer,
  Checkbox,
  CheckboxLabel,
  CheckboxDescription
} from '../styles/StyledComponents';

interface AddPlayerFormProps {
  onAddPlayer: (player: Player) => void;
  existingPlayers: Player[];
}

const AddPlayerForm: React.FC<AddPlayerFormProps> = ({ onAddPlayer, existingPlayers }) => {
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.BEGINNER);
  const [matchLowestGames, setMatchLowestGames] = useState(false);

  // Calculate the minimum games played among existing players
  const minGamesPlayed = existingPlayers.length > 0 
    ? Math.min(...existingPlayers.map(p => p.gamesPlayed))
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Determine starting games played and win rate
    const startingGamesPlayed = matchLowestGames ? minGamesPlayed : 0;
    const startingWinRate = startingGamesPlayed > 0 ? 0.5 : 0.5; // Start with neutral win rate

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: name.trim(),
      skillLevel,
      winRate: startingWinRate,
      gamesPlayed: startingGamesPlayed,
      avatar: getRandomAvatar(),
      color: getRandomColor()
    };

    onAddPlayer(newPlayer);
    setName('');
    setMatchLowestGames(false);
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>Add New Player</h3>
        
        <FormGroup>
          <Label htmlFor="playerName">Player Name</Label>
          <Input
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter player name"
            required
            style={{ width: '97.5%' }}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="skillLevel">Skill Level</Label>
          <Select
            id="skillLevel"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
          >
            <option value={SkillLevel.BEGINNER}>🟢 Beginner</option>
            <option value={SkillLevel.INTERMEDIATE}>🟡 Intermediate</option>
            <option value={SkillLevel.PRO}>🔴 Pro</option>
          </Select>
        </FormGroup>

        {existingPlayers.length > 0 && minGamesPlayed > 0 && (
          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="matchLowestGames"
                checked={matchLowestGames}
                onChange={(e) => setMatchLowestGames(e.target.checked)}
              />
              <CheckboxLabel htmlFor="matchLowestGames">
                Start with {minGamesPlayed} games played (same as lowest player)
              </CheckboxLabel>
            </CheckboxContainer>
            <CheckboxDescription>
              This helps balance game rotation by not giving new players priority over existing players
            </CheckboxDescription>
          </FormGroup>
        )}

        <PrimaryButton
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} style={{ marginRight: '0.5rem' }} />
          Add Player
        </PrimaryButton>
      </form>
    </FormContainer>
  );
};

export default AddPlayerForm;
