/**
 * PlayerSelector component - Select two players for head-to-head comparison
 * Validates: Requirements 7.1
 */

import { useState, useMemo } from 'react';
import type { Player } from '../../types/snooker';

interface PlayerSelectorProps {
  players: Player[];
  onPlayersSelected: (player1Id: number, player2Id: number) => void;
  loading?: boolean;
}

export const PlayerSelector = ({ players, onPlayersSelected, loading }: PlayerSelectorProps) => {
  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');

  // Filter players based on search term
  const filteredPlayers1 = useMemo(() => {
    if (!searchTerm1) return players;
    const term = searchTerm1.toLowerCase();
    return players.filter(p => 
      p.Name?.toLowerCase().includes(term) || 
      p.Nationality?.toLowerCase().includes(term)
    );
  }, [players, searchTerm1]);

  const filteredPlayers2 = useMemo(() => {
    if (!searchTerm2) return players;
    const term = searchTerm2.toLowerCase();
    return players.filter(p => 
      p.Name?.toLowerCase().includes(term) || 
      p.Nationality?.toLowerCase().includes(term)
    );
  }, [players, searchTerm2]);

  const handleCompare = () => {
    if (player1Id && player2Id && player1Id !== player2Id) {
      onPlayersSelected(player1Id, player2Id);
    }
  };

  const selectedPlayer1 = players.find(p => p.ID === player1Id);
  const selectedPlayer2 = players.find(p => p.ID === player2Id);

  const canCompare = player1Id && player2Id && player1Id !== player2Id;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Players to Compare</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player 1 Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Player 1
          </label>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search player..."
            value={searchTerm1}
            onChange={(e) => setSearchTerm1(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          
          {/* Player Dropdown */}
          <select
            value={player1Id || ''}
            onChange={(e) => setPlayer1Id(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select a player...</option>
            {filteredPlayers1.slice(0, 100).map(player => (
              <option key={player.ID} value={player.ID}>
                {player.Name} ({player.Nationality})
              </option>
            ))}
          </select>
          
          {/* Selected Player Preview */}
          {selectedPlayer1 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {selectedPlayer1.Name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedPlayer1.Name}</div>
                  <div className="text-sm text-gray-600">{selectedPlayer1.Nationality}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Player 2 Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Player 2
          </label>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search player..."
            value={searchTerm2}
            onChange={(e) => setSearchTerm2(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          
          {/* Player Dropdown */}
          <select
            value={player2Id || ''}
            onChange={(e) => setPlayer2Id(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select a player...</option>
            {filteredPlayers2.slice(0, 100).map(player => (
              <option key={player.ID} value={player.ID}>
                {player.Name} ({player.Nationality})
              </option>
            ))}
          </select>
          
          {/* Selected Player Preview */}
          {selectedPlayer2 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  {selectedPlayer2.Name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedPlayer2.Name}</div>
                  <div className="text-sm text-gray-600">{selectedPlayer2.Nationality}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compare Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleCompare}
          disabled={!canCompare || loading}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
            canCompare && !loading
              ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {loading ? 'Loading...' : 'Compare Players'}
        </button>
      </div>

      {/* Warning if same player selected */}
      {player1Id && player2Id && player1Id === player2Id && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Please select two different players to compare.
          </p>
        </div>
      )}
    </div>
  );
};
