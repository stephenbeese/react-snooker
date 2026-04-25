/**
 * Custom React hook for managing watchlist state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  loadWatchlist,
  addToWatchlist as addToWatchlistUtil,
  removeFromWatchlist as removeFromWatchlistUtil,
  clearWatchlist,
} from '../utils/watchlistUtils';

interface UseWatchlistReturn {
  watchlist: number[];
  isInWatchlist: (playerId: number) => boolean;
  addToWatchlist: (playerId: number) => void;
  removeFromWatchlist: (playerId: number) => void;
  clearWatchlist: () => void;
  watchlistCount: number;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing watchlist state
 * Provides reactive state management for the player watchlist with localStorage persistence
 */
export const useWatchlist = (): UseWatchlistReturn => {
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial watchlist from localStorage
  useEffect(() => {
    try {
      const initialWatchlist = loadWatchlist();
      setWatchlist(initialWatchlist);
      setError(null);
    } catch (err) {
      setError('Failed to load watchlist');
      console.error('Error loading watchlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if a player is in the watchlist
  const checkIsInWatchlist = useCallback((playerId: number): boolean => {
    return watchlist.includes(playerId);
  }, [watchlist]);

  // Add player to watchlist
  const addToWatchlist = useCallback((playerId: number): void => {
    try {
      const updatedWatchlist = addToWatchlistUtil(playerId);
      setWatchlist(updatedWatchlist);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add player to watchlist';
      setError(errorMessage);
      console.error('Error adding to watchlist:', err);
    }
  }, []);

  // Remove player from watchlist
  const removeFromWatchlist = useCallback((playerId: number): void => {
    try {
      const updatedWatchlist = removeFromWatchlistUtil(playerId);
      setWatchlist(updatedWatchlist);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove player from watchlist';
      setError(errorMessage);
      console.error('Error removing from watchlist:', err);
    }
  }, []);

  // Clear entire watchlist
  const clearWatchlistHandler = useCallback((): void => {
    try {
      clearWatchlist();
      setWatchlist([]);
      setError(null);
    } catch (err) {
      setError('Failed to clear watchlist');
      console.error('Error clearing watchlist:', err);
    }
  }, []);

  return {
    watchlist,
    isInWatchlist: checkIsInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    clearWatchlist: clearWatchlistHandler,
    watchlistCount: watchlist.length,
    loading,
    error,
  };
};