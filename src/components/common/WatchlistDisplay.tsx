/**
 * Watchlist Display Component
 * Shows the current watchlist with player information
 */

import React from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { WatchlistButton } from './WatchlistButton';

interface WatchlistDisplayProps {
  className?: string;
  showHeader?: boolean;
  maxItems?: number;
}

export const WatchlistDisplay: React.FC<WatchlistDisplayProps> = ({
  className = '',
  showHeader = true,
  maxItems,
}) => {
  const { watchlist, watchlistCount, loading, error, clearWatchlist } = useWatchlist();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center text-gray-600">
          <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full mr-3"></div>
          Loading watchlist...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4" role="alert">
          Error loading watchlist: {error}
        </div>
      </div>
    );
  }

  const displayedWatchlist = maxItems ? watchlist.slice(0, maxItems) : watchlist;
  const hasMore = maxItems && watchlist.length > maxItems;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            My Watchlist ({watchlistCount})
          </h3>
          {watchlistCount > 0 && (
            <button
              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
              onClick={clearWatchlist}
              title="Clear entire watchlist"
              aria-label="Clear entire watchlist"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      <div className="p-4">
        {watchlistCount === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Your watchlist is empty.</p>
            <p className="text-sm">Add players to keep track of their matches and results.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedWatchlist.map((playerId) => (
              <div key={playerId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="text-gray-700 font-medium">Player #{playerId}</span>
                  {/* In a real app, you would fetch and display player name, ranking, etc. */}
                </div>
                <WatchlistButton
                  playerId={playerId}
                  className="text-sm"
                />
              </div>
            ))}
            
            {hasMore && (
              <div className="text-center py-2 text-gray-500 text-sm">
                ... and {watchlist.length - maxItems!} more players
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};