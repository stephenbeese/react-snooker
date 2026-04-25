/**
 * Watchlist Display Component
 * Shows the current watchlist with player information
 */

import React from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { WatchlistButton } from './WatchlistButton';
import './WatchlistDisplay.module.css';

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
      <div className={`watchlist-display loading ${className}`}>
        <div className="loading-spinner">Loading watchlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`watchlist-display error ${className}`}>
        <div className="error-message" role="alert">
          Error loading watchlist: {error}
        </div>
      </div>
    );
  }

  const displayedWatchlist = maxItems ? watchlist.slice(0, maxItems) : watchlist;
  const hasMore = maxItems && watchlist.length > maxItems;

  return (
    <div className={`watchlist-display ${className}`}>
      {showHeader && (
        <div className="watchlist-header">
          <h3>My Watchlist ({watchlistCount})</h3>
          {watchlistCount > 0 && (
            <button
              className="clear-watchlist-button"
              onClick={clearWatchlist}
              title="Clear entire watchlist"
              aria-label="Clear entire watchlist"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {watchlistCount === 0 ? (
        <div className="empty-watchlist">
          <p>Your watchlist is empty.</p>
          <p>Add players to keep track of their matches and results.</p>
        </div>
      ) : (
        <div className="watchlist-items">
          {displayedWatchlist.map((playerId) => (
            <div key={playerId} className="watchlist-item">
              <div className="player-info">
                <span className="player-id">Player #{playerId}</span>
                {/* In a real app, you would fetch and display player name, ranking, etc. */}
              </div>
              <WatchlistButton
                playerId={playerId}
                className="watchlist-item-button"
              />
            </div>
          ))}
          
          {hasMore && (
            <div className="watchlist-more">
              <p>... and {watchlist.length - maxItems!} more players</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};