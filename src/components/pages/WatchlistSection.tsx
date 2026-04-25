/**
 * WatchlistSection component - Displays watchlist for home page
 * Shows watchlist players with their recent matches and upcoming fixtures
 */

import React from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useAllPlayers, useRecentResults, useUpcomingMatches } from '../../hooks/useSnookerApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { PlayerCard } from '../common/PlayerCard';
import { MatchResult } from '../common/MatchResult';
import type { Player, Match } from '../../types';

interface WatchlistSectionProps {
  className?: string;
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({ className = '' }) => {
  const { watchlist, watchlistCount, loading: watchlistLoading, error: watchlistError } = useWatchlist();
  const { data: allPlayers, loading: playersLoading, error: playersError } = useAllPlayers();
  const { data: recentResults, loading: resultsLoading, error: resultsError } = useRecentResults(7); // Last 7 days
  const { data: upcomingMatches, loading: upcomingLoading, error: upcomingError } = useUpcomingMatches();

  // Filter players in watchlist
  const watchlistPlayers = React.useMemo(() => {
    if (!allPlayers || !watchlist.length) return [];
    return allPlayers.filter(player => watchlist.includes(player.ID));
  }, [allPlayers, watchlist]);

  // Filter recent results for watchlist players
  const watchlistRecentResults = React.useMemo(() => {
    if (!recentResults || !watchlist.length) return [];
    return recentResults.filter(match => 
      watchlist.includes(match.Player1_ID) || watchlist.includes(match.Player2_ID)
    ).slice(0, 5); // Show max 5 recent results
  }, [recentResults, watchlist]);

  // Filter upcoming matches for watchlist players
  const watchlistUpcomingMatches = React.useMemo(() => {
    if (!upcomingMatches || !watchlist.length) return [];
    return upcomingMatches.filter(match => 
      watchlist.includes(match.Player1_ID) || watchlist.includes(match.Player2_ID)
    ).slice(0, 5); // Show max 5 upcoming matches
  }, [upcomingMatches, watchlist]);

  if (watchlistLoading || playersLoading) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Watchlist</h2>
          <LoadingSpinner message="Loading watchlist..." />
        </div>
      </section>
    );
  }

  if (watchlistError || playersError) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Watchlist</h2>
          <ErrorMessage 
            message={watchlistError || playersError?.message || 'Failed to load watchlist'} 
          />
        </div>
      </section>
    );
  }

  if (watchlistCount === 0) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Watchlist</h2>
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Your watchlist is empty.</p>
            <p className="text-sm">Add players to keep track of their matches and results.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            My Watchlist ({watchlistCount})
          </h2>
          <a 
            href="/players" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
          >
            View All Players →
          </a>
        </div>

        {/* Watchlist Players */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Players</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlistPlayers.slice(0, 6).map((player) => (
              <PlayerCard key={player.ID} player={player} />
            ))}
          </div>
          {watchlistPlayers.length > 6 && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              ... and {watchlistPlayers.length - 6} more players
            </p>
          )}
        </div>

        {/* Recent Results */}
        {watchlistRecentResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Results</h3>
            <div className="space-y-3">
              {watchlistRecentResults.map((match) => (
                <MatchResult key={match.ID} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Matches */}
        {watchlistUpcomingMatches.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming Matches</h3>
            <div className="space-y-3">
              {watchlistUpcomingMatches.map((match) => (
                <MatchResult key={match.ID} match={match} />
              ))}
            </div>
          </div>
        )}

        {watchlistRecentResults.length === 0 && watchlistUpcomingMatches.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p>No recent results or upcoming matches for your watchlist players.</p>
          </div>
        )}
      </div>
    </section>
  );
};