/**
 * EventStats component - Shows event statistics and analytics
 */

import { useMemo } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import type { Event, Match } from '../../types';

interface EventStatsProps {
  event: Event;
  matches: Match[];
  loading: boolean;
  error: Error | null;
}

interface PlayerStats {
  playerId: number;
  playerName: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  framesWon: number;
  framesLost: number;
  winPercentage: number;
  frameWinPercentage: number;
}

export const EventStats = ({ event, matches, loading, error }: EventStatsProps) => {
  // Calculate comprehensive event statistics
  const eventStats = useMemo(() => {
    if (!matches || matches.length === 0) {
      return {
        totalMatches: 0,
        completedMatches: 0,
        upcomingMatches: 0,
        totalFrames: 0,
        averageMatchDuration: 0,
        playerStats: [],
        topPerformers: [],
        matchesByRound: {},
        participantCount: 0
      };
    }

    const completedMatches = matches.filter(match => match.Status === 'R');
    const upcomingMatches = matches.filter(match => match.Status === 'U');
    
    // Calculate total frames from completed matches
    const totalFrames = completedMatches.reduce((total, match) => {
      return total + match.Player1_Score + match.Player2_Score;
    }, 0);

    // Calculate average match duration (if available)
    const matchesWithDuration = completedMatches.filter(match => match.Duration);
    const averageMatchDuration = matchesWithDuration.length > 0
      ? matchesWithDuration.reduce((total, match) => {
          // Assuming duration is in minutes or a parseable format
          const duration = parseInt(match.Duration || '0');
          return total + duration;
        }, 0) / matchesWithDuration.length
      : 0;

    // Calculate player statistics
    const playerStatsMap = new Map<number, PlayerStats>();
    
    completedMatches.forEach(match => {
      // Player 1 stats
      if (!playerStatsMap.has(match.Player1_ID)) {
        playerStatsMap.set(match.Player1_ID, {
          playerId: match.Player1_ID,
          playerName: match.Player1_Name,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          framesWon: 0,
          framesLost: 0,
          winPercentage: 0,
          frameWinPercentage: 0
        });
      }
      
      const player1Stats = playerStatsMap.get(match.Player1_ID)!;
      player1Stats.matchesPlayed++;
      player1Stats.framesWon += match.Player1_Score;
      player1Stats.framesLost += match.Player2_Score;
      
      if (match.Player1_Score > match.Player2_Score) {
        player1Stats.matchesWon++;
      } else {
        player1Stats.matchesLost++;
      }

      // Player 2 stats
      if (!playerStatsMap.has(match.Player2_ID)) {
        playerStatsMap.set(match.Player2_ID, {
          playerId: match.Player2_ID,
          playerName: match.Player2_Name,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          framesWon: 0,
          framesLost: 0,
          winPercentage: 0,
          frameWinPercentage: 0
        });
      }
      
      const player2Stats = playerStatsMap.get(match.Player2_ID)!;
      player2Stats.matchesPlayed++;
      player2Stats.framesWon += match.Player2_Score;
      player2Stats.framesLost += match.Player1_Score;
      
      if (match.Player2_Score > match.Player1_Score) {
        player2Stats.matchesWon++;
      } else {
        player2Stats.matchesLost++;
      }
    });

    // Calculate percentages for each player
    const playerStats = Array.from(playerStatsMap.values()).map(stats => ({
      ...stats,
      winPercentage: stats.matchesPlayed > 0 
        ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) 
        : 0,
      frameWinPercentage: (stats.framesWon + stats.framesLost) > 0
        ? Math.round((stats.framesWon / (stats.framesWon + stats.framesLost)) * 100)
        : 0
    }));

    // Get top performers (by win percentage, minimum 2 matches)
    const topPerformers = playerStats
      .filter(stats => stats.matchesPlayed >= 2)
      .sort((a, b) => b.winPercentage - a.winPercentage)
      .slice(0, 5);

    // Group matches by round
    const matchesByRound: Record<string, number> = {};
    matches.forEach(match => {
      const roundKey = match.Round_ID ? `Round ${match.Round_ID}` : 'Other';
      matchesByRound[roundKey] = (matchesByRound[roundKey] || 0) + 1;
    });

    // Count unique participants
    const participantIds = new Set<number>();
    matches.forEach(match => {
      participantIds.add(match.Player1_ID);
      participantIds.add(match.Player2_ID);
    });

    return {
      totalMatches: matches.length,
      completedMatches: completedMatches.length,
      upcomingMatches: upcomingMatches.length,
      totalFrames,
      averageMatchDuration,
      playerStats: playerStats.sort((a, b) => b.matchesPlayed - a.matchesPlayed),
      topPerformers,
      matchesByRound,
      participantCount: participantIds.size
    };
  }, [matches]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Unable to load event statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Overview Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{eventStats.participantCount}</div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{eventStats.totalMatches}</div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{eventStats.totalFrames}</div>
            <div className="text-sm text-gray-600">Total Frames</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {eventStats.averageMatchDuration > 0 
                ? `${Math.round(eventStats.averageMatchDuration)}m`
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-600">Avg Duration</div>
          </div>
        </div>
      </div>

      {/* Match Progress */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Progress</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Progress</span>
            <span className="text-sm text-gray-600">
              {eventStats.completedMatches} of {eventStats.totalMatches} matches
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: eventStats.totalMatches > 0 
                  ? `${(eventStats.completedMatches / eventStats.totalMatches) * 100}%`
                  : '0%'
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>{eventStats.completedMatches} completed</span>
            <span>{eventStats.upcomingMatches} remaining</span>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {eventStats.topPerformers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Win %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frame %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventStats.topPerformers.map((player, index) => (
                    <tr key={player.playerId} className={index === 0 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && (
                            <span className="mr-2 text-yellow-500">👑</span>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {player.playerName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {player.matchesWon}-{player.matchesLost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {player.winPercentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {player.frameWinPercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Matches by Round */}
      {Object.keys(eventStats.matchesByRound).length > 1 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Matches by Round</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(eventStats.matchesByRound).map(([round, count]) => (
              <div key={round} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{round}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Statistics Table */}
      {eventStats.playerStats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Player Statistics ({eventStats.playerStats.length} players)
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matches Played
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Record (W-L)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Win %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frames (W-L)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frame %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventStats.playerStats.map((player) => (
                    <tr key={player.playerId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {player.playerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {player.matchesPlayed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {player.matchesWon}-{player.matchesLost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={player.winPercentage >= 50 ? 'text-green-600' : 'text-red-600'}>
                          {player.winPercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {player.framesWon}-{player.framesLost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {player.frameWinPercentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};