import React, { useState, useEffect } from 'react';
import { ActivePlayerService as PlayerService } from '../services/ApiService';

const LeaderboardView: React.FC = () => {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const data = await PlayerService.getPlayerRankings(1, 50);
      setRankings(data.rankings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {rankings.map((player, index) => (
          <div key={player.playerId} className="flex justify-between items-center p-3 bg-white rounded shadow">
            <div>
              <span className="font-bold">#{index + 1}</span>
              <span className="ml-2">{player.playerName}</span>
            </div>
            <div className="text-right">
              <div>ELO: {player.currentElo}</div>
              <div className="text-sm text-gray-600">
                Win Rate: {Math.round(player.winRate * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardView;