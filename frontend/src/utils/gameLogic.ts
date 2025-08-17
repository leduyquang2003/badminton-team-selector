import { Player, SkillLevel } from '../types';

const SKILL_LEVEL_COLORS = {
  [SkillLevel.BEGINNER]: '#4CAF50',
  [SkillLevel.INTERMEDIATE]: '#FF9800',
  [SkillLevel.ADVANCED]: '#667eea', // ✅ Add ADVANCED
  [SkillLevel.PRO]: '#F44336'
};

const SKILL_LEVEL_THRESHOLDS = {
  [SkillLevel.BEGINNER]: 0.4,
  [SkillLevel.INTERMEDIATE]: 0.45,
  [SkillLevel.ADVANCED]: 0.48, // ✅ Add ADVANCED  
  [SkillLevel.PRO]: 0.5
};

const MIN_GAMES_FOR_DEMOTION = 10;

export const getSkillLevelColor = (skillLevel: SkillLevel): string => {
  return SKILL_LEVEL_COLORS[skillLevel];
};

export const shouldPlayerLevelDown = (player: Player): boolean => {
  if (player.gamesPlayed < MIN_GAMES_FOR_DEMOTION) return false;
  
  const threshold = SKILL_LEVEL_THRESHOLDS[player.skillLevel];
  return player.winRate < threshold;
};

export const selectPlayersForGame = (allPlayers: Player[], numPlayers: number = 4): Player[] => {
  if (allPlayers.length < numPlayers) {
    throw new Error(`Need at least ${numPlayers} players to generate teams`);
  }

  const sortedByGamesPlayed = [...allPlayers].sort((a, b) => {
    const gamesDiff = a.gamesPlayed - b.gamesPlayed;
    if (gamesDiff !== 0) return gamesDiff;
    return Math.random() - 0.5;
  });

  return sortedByGamesPlayed.slice(0, numPlayers);
};

export const generateBalancedTeams = (selectedPlayers?: Player[], allPlayers?: Player[]): [Player[], Player[]] => {
  let playersToUse: Player[];

  if (selectedPlayers && selectedPlayers.length >= 4) {
    playersToUse = selectedPlayers;
  } else if (allPlayers && allPlayers.length >= 4) {
    playersToUse = selectPlayersForGame(allPlayers, 4);
  } else {
    throw new Error('Need at least 4 players to generate teams');
  }

  // ✅ Fix skill values to include ADVANCED
  const skillValues = {
    [SkillLevel.BEGINNER]: 1,
    [SkillLevel.INTERMEDIATE]: 2,
    [SkillLevel.ADVANCED]: 2.5, // ✅ Add ADVANCED
    [SkillLevel.PRO]: 3
  };

  const playersWithStrength = playersToUse.map(player => {
    const skillScore = skillValues[player.skillLevel];
    const winRateScore = player.winRate * 3;
    const strengthScore = (skillScore * 0.6) + (winRateScore * 0.4);
    
    return {
      ...player,
      strengthScore
    };
  });

  playersWithStrength.sort((a, b) => b.strengthScore - a.strengthScore);

  const team1: Player[] = [];
  const team2: Player[] = [];

  let bestCombination: [Player[], Player[]] | null = null;
  let smallestDifference = Infinity;

  const generateCombinations = (players: typeof playersWithStrength) => {
    const combinations: [Player[], Player[]][] = [];
    const totalPlayers = players.length;
    const teamSize = Math.floor(totalPlayers / 2);

    if (totalPlayers === 4) {
      const strategies = [
        [0, 1],
        [0, 2],
        [0, 3],
      ];

      strategies.forEach(([idx1, idx2]) => {
        const team1 = [players[idx1], players[idx2]];
        const team2 = players.filter((_, i) => i !== idx1 && i !== idx2);
        combinations.push([team1, team2]);
      });
    }

    return combinations;
  };

  const combinations = generateCombinations(playersWithStrength);

  combinations.forEach(([t1, t2]) => {
    const team1Strength = calculateTeamStrength(t1);
    const team2Strength = calculateTeamStrength(t2);
    const difference = Math.abs(team1Strength - team2Strength);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestCombination = [t1, t2];
    }
  });

  if (bestCombination) {
    return bestCombination;
  }

  playersWithStrength.forEach((player, index) => {
    if (index % 2 === 0) {
      team1.push(player);
    } else {
      team2.push(player);
    }
  });

  return [team1, team2];
};

export const calculateTeamStrength = (players: Player[]): number => {
  if (players.length === 0) return 0;
  
  // ✅ Fix skill values to include ADVANCED
  const skillValues = {
    [SkillLevel.BEGINNER]: 1,
    [SkillLevel.INTERMEDIATE]: 2,
    [SkillLevel.ADVANCED]: 2.5, // ✅ Add ADVANCED
    [SkillLevel.PRO]: 3
  };

  const avgSkill = players.reduce((sum, p) => sum + skillValues[p.skillLevel], 0) / players.length;
  const avgWinRate = players.reduce((sum, p) => sum + p.winRate, 0) / players.length;
  
  return (avgSkill * 0.6) + (avgWinRate * 3 * 0.4);
};

export const getRandomAvatar = (): string => {
  const avatars = ['🏸', '🎯', '⭐', '🔥', '💪', '🎨', '🚀', '🌟', '⚡', '🎭'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

export const getRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};