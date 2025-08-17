
import { Player, MatchResult, Hand, Specialty, SkillLevel } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🔗 API Request: ${options.method || 'GET'} ${url}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      console.log(`✅ API Response:`, data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }

  static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class PlayerService {
  static async getAllPlayers(filters: {
    skillLevel?: string;
    minElo?: number;
    maxElo?: number;
    specialty?: string;
    limit?: number;
    sortBy?: 'elo' | 'winRate' | 'totalMatches' | 'lastActive';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    search?: string;
  } = {}): Promise<Player[]> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/players${queryString ? `?${queryString}` : ''}`;
      
      const response = await ApiService.get<{
        players: Player[];
        pagination: any;
      }>(endpoint);
      
      console.log(`📊 Loaded ${response.players.length} players from database`);
      return response.players;
    } catch (error) {
      console.error('❌ Failed to load players from database:', error);
      throw new Error('Failed to connect to database. Make sure your backend server is running on port 3001.');
    }
  }

  static async getPlayerInsights(playerId: string): Promise<{
    player: Player;
    rank: number;
    recentMatches: any[];
    topPartners: any[];
    eloHistory: any[];
    performanceMetrics: any;
  }> {
    return ApiService.get(`/players/${playerId}`);
  }

  static async createPlayer(
    playerData: Omit<Player, '_id' | 'playerId' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>
  ): Promise<Player> {
    try {
      console.log('🔄 Creating player:', playerData.name);
      const result = await ApiService.post<Player>('/players', playerData);
      console.log('✅ Player created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to create player:', error);
      throw error;
    }
  }

  static async updatePlayer(playerId: string, updates: Partial<Player>): Promise<Player> {
    return ApiService.put(`/players/${playerId}`, updates);
  }

  static async deletePlayer(playerId: string): Promise<void> {
    return ApiService.delete(`/players/${playerId}`);
  }

  static async getPlayersForMatchmaking(count: number = 8): Promise<Player[]> {
    return ApiService.get(`/players/matchmaking/candidates?count=${count}`);
  }

  static async generateOptimalTeams(
    selectedPlayerIds?: string[],
    preferences?: any
  ): Promise<{
    team1: Player[];
    team2: Player[];
    balanceScore: number;
    confidence: number;
    reasoning: string[];
    fairnessAnalysis: any;
  }> {
    return ApiService.post('/players/generate-teams', {
      selectedPlayerIds,
      preferences
    });
  }

  static async recordMatchResult(matchResult: MatchResult): Promise<void> {
    return ApiService.post('/players/record-match', matchResult);
  }

  static async getPlayerRankings(
    page: number = 1,
    limit: number = 50,
    skillLevel?: string
  ): Promise<{
    rankings: any[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (skillLevel) {
      params.append('skillLevel', skillLevel);
    }

    return ApiService.get(`/players/rankings/list?${params.toString()}`);
  }

  static async getOverviewStats(): Promise<{
    overview: {
      totalPlayers: number;
      averageElo: number;
      totalMatches: number;
      newPlayersCount: number;
    };
    skillDistribution: Record<string, number>;
    mostActive: Array<{ name: string; lastActive: Date; totalMatches: number }>;
    topPerformers: Array<{ name: string; elo: number; winRate: number }>;
  }> {
    return ApiService.get('/players/statistics/overview');
  }

  // Test connection method
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      console.log('🔍 Backend health check:', data);
      return data.status === 'OK';
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  }
}

// Export the real service (no mock)
export const ActivePlayerService = PlayerService;