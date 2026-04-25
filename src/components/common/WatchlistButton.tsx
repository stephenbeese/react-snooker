/**
 * Watchlist Button Component
 * A reusable button component for adding/removing players from the watchlist
 */

import React from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import './WatchlistButton.module.css';

interface WatchlistButtonProps {
  playerId: number;
  playerName?: string;
  className?: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  playerId,
  playerName,
  className = '',
}) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, error } = useWatchlist();

  const isWatched = isInWatchlist(playerId);

  const handleClick = () => {
    if (isWatched) {
      removeFromWatchlist(playerId);
    } else {
      addToWatchlist(playerId);
    }
  };

  const buttonText = isWatched ? 'Remove from Watchlist' : 'Add to Watchlist';
  const buttonClass = `watchlist-button ${isWatched ? 'watched' : 'unwatched'} ${className}`;

  return (
    <div className="watchlist-button-container">
      <button
        className={buttonClass}
        onClick={handleClick}
        title={`${buttonText}${playerName ? ` - ${playerName}` : ''}`}
        aria-label={`${buttonText}${playerName ? ` for ${playerName}` : ''}`}
      >
        {isWatched ? '★' : '☆'} {buttonText}
      </button>
      {error && (
        <div className="watchlist-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};