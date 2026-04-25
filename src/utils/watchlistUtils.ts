/**
 * Watchlist utility functions for managing player watchlist with localStorage persistence
 */

const WATCHLIST_STORAGE_KEY = 'snooker_watchlist';

/**
 * Load watchlist from localStorage
 * @returns Array of player IDs in the watchlist
 */
export const loadWatchlist = (): number[] => {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    // Ensure we return an array of numbers
    if (Array.isArray(parsed)) {
      return parsed.filter(id => typeof id === 'number' && !isNaN(id));
    }
    return [];
  } catch (error) {
    console.warn('Failed to load watchlist from localStorage:', error);
    return [];
  }
};

/**
 * Save watchlist to localStorage
 * @param playerIds Array of player IDs to save
 */
export const saveWatchlist = (playerIds: number[]): void => {
  try {
    // Ensure we only save valid numbers
    const validIds = playerIds.filter(id => typeof id === 'number' && !isNaN(id));
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(validIds));
  } catch (error) {
    console.error('Failed to save watchlist to localStorage:', error);
  }
};

/**
 * Add a player to the watchlist
 * @param playerId Player ID to add
 * @returns Updated watchlist
 */
export const addToWatchlist = (playerId: number): number[] => {
  if (typeof playerId !== 'number' || isNaN(playerId)) {
    throw new Error('Invalid player ID: must be a valid number');
  }
  
  const currentWatchlist = loadWatchlist();
  
  // Don't add if already in watchlist
  if (currentWatchlist.includes(playerId)) {
    return currentWatchlist;
  }
  
  const updatedWatchlist = [...currentWatchlist, playerId];
  saveWatchlist(updatedWatchlist);
  return updatedWatchlist;
};

/**
 * Remove a player from the watchlist
 * @param playerId Player ID to remove
 * @returns Updated watchlist
 */
export const removeFromWatchlist = (playerId: number): number[] => {
  if (typeof playerId !== 'number' || isNaN(playerId)) {
    throw new Error('Invalid player ID: must be a valid number');
  }
  
  const currentWatchlist = loadWatchlist();
  const updatedWatchlist = currentWatchlist.filter(id => id !== playerId);
  saveWatchlist(updatedWatchlist);
  return updatedWatchlist;
};

/**
 * Check if a player is in the watchlist
 * @param playerId Player ID to check
 * @returns True if player is in watchlist
 */
export const isInWatchlist = (playerId: number): boolean => {
  if (typeof playerId !== 'number' || isNaN(playerId)) {
    return false;
  }
  
  const watchlist = loadWatchlist();
  return watchlist.includes(playerId);
};

/**
 * Clear the entire watchlist
 */
export const clearWatchlist = (): void => {
  try {
    localStorage.removeItem(WATCHLIST_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear watchlist from localStorage:', error);
  }
};

/**
 * Get the number of players in the watchlist
 * @returns Number of players in watchlist
 */
export const getWatchlistCount = (): number => {
  return loadWatchlist().length;
};