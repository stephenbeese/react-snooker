/**
 * Watchlist Button Component
 * A reusable button component for adding/removing players from the watchlist
 */

import React from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';

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

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
          isWatched 
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300' 
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
        } ${className}`}
        onClick={handleClick}
        title={`${buttonText}${playerName ? ` - ${playerName}` : ''}`}
        aria-label={`${buttonText}${playerName ? ` for ${playerName}` : ''}`}
      >
        <span className="text-lg">{isWatched ? '★' : '☆'}</span>
        {buttonText}
      </button>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};