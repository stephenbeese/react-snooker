/**
 * H2HMatchHistory component - List all previous matches between two players
 * Validates: Requirements 7.3
 */

import { useMemo } from 'react';
import type { Match } from '../../types/snooker';

interface H2HMatchHistoryProps {
  matches: Match[];
  player1Id: number;
  player2Id: number;
  player1Name: string;
  player2Name: string;
}

export const H2HMatchHistory = ({ 
  matches, 
  player1Id, 
  player2Id,
  player1Name,
  player2Name 
}: H2HMatchHistoryProps) => {
  // Sort matches by date (most recent first)
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      if (!a.Date_Time && !b.Date_Time) return 0;
      if (!a.Date_Time) return 1;
      if (!b.Date_Time) return -1;
      
      try {
        return new Date(b.Date_Time).getTime() - new Date(a.Date_Time).getTime();
      } catch {
        return 0;
      }
    });
  }, [matches]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Date unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Date unknown';
    }
  };

  const getWinner = (match: Match): 'player1' | 'player2' | 'draw' => {
    const isPlayer1AsPlayer1 = match.Player1_ID === player1Id;
    const player1Score = isPlayer1AsPlayer1 ? match.Player1_Score : match.Player2_Score;
    const player2Score = isPlayer1AsPlayer1 ? match.Player2_Score : match.Player1_Score;

    if (player1Score > player2Score) return 'player1';
    if (player2Score > player1Score) return 'player2';
    return 'draw';
  };

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Match History</h2>
        <div className="text-center py-8 text-gray-500">
          No previous matches found between these players.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Match History ({matches.length} {matches.length === 1 ? 'match' : 'matches'})
      </h2>

      <div className="space-y-4">
        {sortedMatches.map((match, index) => {
          const winner = getWinner(match);
          const isPlayer1AsPlayer1 = match.Player1_ID === player1Id;
          const player1Score = isPlayer1AsPlayer1 ? match.Player1_Score : match.Player2_Score;
          const player2Score = isPlayer1AsPlayer1 ? match.Player2_Score : match.Player1_Score;

          return (
            <div
              key={`${match.ID}-${index}`}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Date and Event */}
                <div className="flex-shrink-0">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatDate(match.Date_Time)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Event ID: {match.Event_ID}
                  </div>
                </div>

                {/* Score Display */}
                <div className="flex items-center gap-4 flex-1 justify-center">
                  {/* Player 1 */}
                  <div className={`text-right flex-1 ${winner === 'player1' ? 'font-bold' : ''}`}>
                    <div className={`text-lg ${winner === 'player1' ? 'text-blue-600' : 'text-gray-700'}`}>
                      {player1Name}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${winner === 'player1' ? 'text-blue-600' : 'text-gray-700'}`}>
                      {player1Score}
                    </div>
                    <div className="text-gray-400">-</div>
                    <div className={`text-2xl font-bold ${winner === 'player2' ? 'text-green-600' : 'text-gray-700'}`}>
                      {player2Score}
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className={`text-left flex-1 ${winner === 'player2' ? 'font-bold' : ''}`}>
                    <div className={`text-lg ${winner === 'player2' ? 'text-green-600' : 'text-gray-700'}`}>
                      {player2Name}
                    </div>
                  </div>
                </div>

                {/* Winner Badge */}
                <div className="flex-shrink-0 flex justify-end">
                  {winner === 'player1' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {player1Name.split(' ')[0]} Won
                    </span>
                  )}
                  {winner === 'player2' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {player2Name.split(' ')[0]} Won
                    </span>
                  )}
                  {winner === 'draw' && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      Draw
                    </span>
                  )}
                </div>
              </div>

              {/* Additional Match Info */}
              {(match.Round_ID || match.Duration) && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                  {match.Round_ID && (
                    <span>Round: {match.Round_ID}</span>
                  )}
                  {match.Duration && (
                    <span>Duration: {match.Duration}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
