/**
 * H2HChart component - Bar chart comparing head-to-head stats
 * Validates: Requirements 7.5
 */

import { useMemo } from 'react';
import type { H2HByEventType } from '../../utils/h2hUtils';

interface H2HChartProps {
  eventTypeBreakdown: H2HByEventType[];
  player1Name: string;
  player2Name: string;
}

export const H2HChart = ({ eventTypeBreakdown, player1Name, player2Name }: H2HChartProps) => {
  // Calculate max wins for scaling
  const maxWins = useMemo(() => {
    return Math.max(
      ...eventTypeBreakdown.map(et => Math.max(et.player1Wins, et.player2Wins)),
      1 // Minimum of 1 to avoid division by zero
    );
  }, [eventTypeBreakdown]);

  if (eventTypeBreakdown.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance by Event Type</h2>
        <div className="text-center py-8 text-gray-500">
          No event type data available.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance by Event Type</h2>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-700">{player1Name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700">{player2Name}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-6">
        {eventTypeBreakdown.map((eventType, index) => {
          const player1Percentage = (eventType.player1Wins / maxWins) * 100;
          const player2Percentage = (eventType.player2Wins / maxWins) * 100;
          const totalMatches = eventType.totalMatches;

          return (
            <div key={index} className="space-y-2">
              {/* Event Type Label */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">
                  {eventType.eventType}
                </span>
                <span className="text-xs text-gray-500">
                  {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
                </span>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-1">
                {/* Player 1 Bar */}
                <div className="flex items-center gap-2">
                  <div className="w-24 text-right text-xs text-gray-600">
                    {player1Name.split(' ')[0]}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                      style={{ width: `${player1Percentage}%` }}
                    >
                      {eventType.player1Wins > 0 && (
                        <span className="text-xs font-semibold text-white">
                          {eventType.player1Wins}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Player 2 Bar */}
                <div className="flex items-center gap-2">
                  <div className="w-24 text-right text-xs text-gray-600">
                    {player2Name.split(' ')[0]}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                      style={{ width: `${player2Percentage}%` }}
                    >
                      {eventType.player2Wins > 0 && (
                        <span className="text-xs font-semibold text-white">
                          {eventType.player2Wins}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Win Percentages */}
              <div className="flex justify-between text-xs text-gray-500 pl-26">
                <span>
                  {eventType.player1Wins > 0 
                    ? `${Math.round((eventType.player1Wins / totalMatches) * 100)}% win rate`
                    : ''}
                </span>
                <span>
                  {eventType.player2Wins > 0 
                    ? `${Math.round((eventType.player2Wins / totalMatches) * 100)}% win rate`
                    : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
