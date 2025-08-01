export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  PRO = 'Pro'
}

export interface Player {
  id: string;
  name: string;
  skillLevel: SkillLevel;
  winRate: number;
  gamesPlayed: number;
  avatar: string;
  color: string;
}

export interface Team {
  id: string;
  players: Player[];
  name: string;
  averageSkillLevel: number;
  combinedWinRate: number;
}

export interface GameResult {
  id: string;
  team1: Team;
  team2: Team;
  winner: Team;
  date: Date;
  playersInvolved: Player[];
}

export interface AppState {
  players: Player[];
  teams: Team[];
  gameHistory: GameResult[];
  currentScreen: 'lobby' | 'teams' | 'results' | 'history';
}
