/**
 * H2HStats component - Display head-to-head statistics
 * Validates: Requirements 7.2
 */

import type { H2HStats as H2HStatsType } from '../../utils/h2hUtils';

interface H2HStatsProps {
  stats: H2HStatsType;
}

export const H2HStats = ({ stats }: H2HStatsProps) => {
  const { 
    player1Name, 
    player1Wins, 
    player1WinPercentage,
    player2Name, 
    player2Wins, 
    player2WinPercentage,
    totalMatches,
    draws 
  } = stats;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Head-to-Head Statistics
      </h2>

      {/* Total Matches */}
      <div className="text-center mb-8">
        <div className="text-5xl font-bold text-gray-900 mb-2">{totalMatches}</div>
        <div className="text-lg text-gray-600">Total Matches Played</div>
      </div>

      {/* Player Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Player 1 Stats */}
        <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="text-xl font-semibold text-gray-900 mb-4">{player1Name}</div>
          <div className="space-y-3">
            <div>
              <div className="text-4xl font-bold text-blue-600">{player1Wins}</div>
              <div className="text-sm text-gray-600">Wins</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500">{player1WinPercentage}%</div>
              <div className="text-sm text-gray-600">Win Percentage</div>
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="text-4xl font-bold text-gray-400">VS</div>
        </div>

        {/* Player 2 Stats */}
        <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="text-xl font-semibold text-gray-900 mb-4">{player2Name}</div>
          <div className="space-y-3">
            <div>
              <div className="text-4xl font-bold text-green-600">{player2Wins}</div>
              <div className="text-sm text-gray-600">Wins</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">{player2WinPercentage}%</div>
              <div className="text-sm text-gray-600">Win Percentage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Draws (if any) */}
      {draws > 0 && (
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-lg font-semibold text-gray-700">
            {draws} {draws === 1 ? 'Draw' : 'Draws'}
          </span>
        </div>
      )}

      {/* Visual Win Comparison Bar */}
      <div className="mt-6">
        <div className="text-sm text-gray-600 mb-2 text-center">Win Distribution</div>
        <div className="flex h-8 rounded-lg overflow-hidden">
          <div 
            className="bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
            style={{ width: `${player1WinPercentage}%` }}
          >
            {player1WinPercentage > 10 && `${player1WinPercentage}%`}
          </div>
          <div 
            className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
            style={{ width: `${player2WinPercentage}%` }}
          >
            {player2WinPercentage > 10 && `${player2WinPercentage}%`}
          </div>
          {draws > 0 && (
            <div 
              className="bg-gray-400 flex items-center justify-center text-white text-sm font-semibold"
              style={{ width: `${Math.round((draws / totalMatches) * 100)}%` }}
            >
              {Math.round((draws / totalMatches) * 100) > 10 && `${Math.round((draws / totalMatches) * 100)}%`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
