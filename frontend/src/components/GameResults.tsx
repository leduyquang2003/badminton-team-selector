import React, { useState } from 'react';
import { GameResult, Team } from '../types';

interface GameResultsProps {
  team1: Team;
  team2: Team;
  onGameComplete: (result: GameResult) => Promise<void>;
  onPlayAgain: () => void; // ✅ Add missing prop
}

const GameResults: React.FC<GameResultsProps> = ({ team1, team2, onGameComplete, onPlayAgain  }) => {
  const [selectedWinner, setSelectedWinner] = useState<Team | null>(null);
  const [score, setScore] = useState({ winner: 0, loser: 0 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedWinner) {
      alert('Please select a winner.');
      return;
    }

    const loser = selectedWinner.id === team1.id ? team2 : team1;

    const gameResult: GameResult = {
      id: Date.now().toString(),
      date: new Date(),
      team1,
      team2,
      winner: selectedWinner,
      loser,
      winnerScore: score.winner,
      loserScore: score.loser,
      playersInvolved: [...team1.players, ...team2.players],
    };

    setLoading(true);    try {
      // ✅ Use correct endpoint and port
      const res = await fetch('http://localhost:3001/api/players/record-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: `match_${Date.now()}`,
          date: new Date(),
          team1: {
            player1Id: team1.players[0]?.playerId || '',
            player2Id: team1.players[1]?.playerId
          },
          team2: {
            player1Id: team2.players[0]?.playerId || '',
            player2Id: team2.players[1]?.playerId
          },
          score: {
            team1: selectedWinner.id === team1.id ? score.winner : score.loser,
            team2: selectedWinner.id === team1.id ? score.loser : score.winner
          },
          matchType: 'DOUBLES',
          duration: 30
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save game result: ${res.statusText}`);
      }

      console.log('✅ Game result saved successfully');
      onGameComplete(gameResult);
    } catch (error) {
      console.error('❌ Error saving result:', error);
      alert('Failed to save game result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">Record Game Result</h2>

      <div className="mb-4">
        <p className="mb-2">Select Winner:</p>
        {[team1, team2].map((team) => (
          <button
            key={team.id}
            className={`px-4 py-2 mr-2 rounded ${
              selectedWinner?.id === team.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-200'
            }`}
            onClick={() => setSelectedWinner(team)}
          >
            {team.name}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="block mb-1">Winner Score</label>
        <input
          type="number"
          value={score.winner}
          onChange={(e) =>
            setScore((prev) => ({ ...prev, winner: Number(e.target.value) }))
          }
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Loser Score</label>
        <input
          type="number"
          value={score.loser}
          onChange={(e) =>
            setScore((prev) => ({ ...prev, loser: Number(e.target.value) }))
          }
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Saving...' : 'Submit Result'}
        </button>
        
        {/* ✅ Add Play Again button */}
        <button
          onClick={onPlayAgain}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameResults;
