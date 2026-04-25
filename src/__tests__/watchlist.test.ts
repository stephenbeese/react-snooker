/**
 * Property-based tests for watchlist functionality
 * Tests the correctness properties defined in the design document
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  loadWatchlist,
  saveWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  clearWatchlist,
} from '../utils/watchlistUtils';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock global localStorage
vi.stubGlobal('localStorage', localStorageMock);

describe('Watchlist Property-Based Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorageMock.clear();
  });

  /**
   * Property 13: Watchlist Addition
   * For any player and watchlist, adding a player to the watchlist SHALL result in that player appearing in the watchlist.
   * **Validates: Requirements 10.1**
   */
  test('Property 13: Watchlist Addition', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 })), // Initial watchlist
        fc.integer({ min: 1, max: 1000 }), // Player to add
        (initialWatchlist, playerToAdd) => {
          // Set up initial state
          saveWatchlist(initialWatchlist);
          
          // Add player to watchlist
          const updatedWatchlist = addToWatchlist(playerToAdd);
          
          // Property: The player should now be in the watchlist
          expect(updatedWatchlist).toContain(playerToAdd);
          expect(isInWatchlist(playerToAdd)).toBe(true);
          
          // Verify persistence
          const loadedWatchlist = loadWatchlist();
          expect(loadedWatchlist).toContain(playerToAdd);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Watchlist Removal
   * For any watchlist containing a player, removing that player SHALL result in that player no longer appearing in the watchlist.
   * **Validates: Requirements 10.2**
   */
  test('Property 14: Watchlist Removal', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1 }), // Non-empty watchlist
        (initialWatchlist) => {
          // Set up initial state with the watchlist
          saveWatchlist(initialWatchlist);
          
          // Pick a player that's definitely in the watchlist
          const playerToRemove = initialWatchlist[0];
          
          // Ensure the player is in the watchlist initially
          expect(isInWatchlist(playerToRemove)).toBe(true);
          
          // Remove player from watchlist
          const updatedWatchlist = removeFromWatchlist(playerToRemove);
          
          // Property: The player should no longer be in the watchlist
          expect(updatedWatchlist).not.toContain(playerToRemove);
          expect(isInWatchlist(playerToRemove)).toBe(false);
          
          // Verify persistence
          const loadedWatchlist = loadWatchlist();
          expect(loadedWatchlist).not.toContain(playerToRemove);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15: Watchlist Persistence Round Trip
   * For any watchlist data, serializing to localStorage and then deserializing SHALL produce an equivalent watchlist.
   * **Validates: Requirements 10.4**
   */
  test('Property 15: Watchlist Persistence Round Trip', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 })), // Arbitrary watchlist
        (originalWatchlist) => {
          // Remove duplicates to match expected behavior
          const uniqueWatchlist = [...new Set(originalWatchlist)];
          
          // Save the watchlist
          saveWatchlist(uniqueWatchlist);
          
          // Load the watchlist back
          const loadedWatchlist = loadWatchlist();
          
          // Property: The loaded watchlist should be equivalent to the original
          expect(loadedWatchlist).toEqual(uniqueWatchlist);
          expect(loadedWatchlist.length).toBe(uniqueWatchlist.length);
          
          // Verify each element is preserved
          uniqueWatchlist.forEach(playerId => {
            expect(loadedWatchlist).toContain(playerId);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional property tests for edge cases and invariants

  test('Property: Adding duplicate player should not change watchlist size', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 })),
        fc.integer({ min: 1, max: 1000 }),
        (initialWatchlist, playerId) => {
          // Remove duplicates from initial watchlist to match expected behavior
          const uniqueInitialWatchlist = [...new Set(initialWatchlist)];
          
          // Set up initial state
          saveWatchlist(uniqueInitialWatchlist);
          
          // Add player twice
          const firstAdd = addToWatchlist(playerId);
          const secondAdd = addToWatchlist(playerId);
          
          // Property: Second add should not change the watchlist
          expect(firstAdd).toEqual(secondAdd);
          expect(firstAdd.filter(id => id === playerId).length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: Removing non-existent player should not change watchlist', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 500 })),
        fc.integer({ min: 501, max: 1000 }), // Ensure player is not in initial list
        (initialWatchlist, playerToRemove) => {
          // Set up initial state
          saveWatchlist(initialWatchlist);
          const originalWatchlist = loadWatchlist();
          
          // Remove player that's not in watchlist
          const updatedWatchlist = removeFromWatchlist(playerToRemove);
          
          // Property: Watchlist should remain unchanged
          expect(updatedWatchlist).toEqual(originalWatchlist);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: Watchlist operations preserve data integrity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 1000 })),
        fc.array(fc.integer({ min: 1, max: 1000 })),
        (playersToAdd, playersToRemove) => {
          // Start with empty watchlist
          clearWatchlist();
          
          // Add all players
          playersToAdd.forEach(playerId => {
            addToWatchlist(playerId);
          });
          
          const afterAdding = loadWatchlist();
          
          // Remove players
          playersToRemove.forEach(playerId => {
            removeFromWatchlist(playerId);
          });
          
          const afterRemoving = loadWatchlist();
          
          // Property: All operations should maintain valid state
          expect(Array.isArray(afterAdding)).toBe(true);
          expect(Array.isArray(afterRemoving)).toBe(true);
          
          // All remaining players should be valid numbers
          afterRemoving.forEach(playerId => {
            expect(typeof playerId).toBe('number');
            expect(isNaN(playerId)).toBe(false);
          });
          
          // Players that were added but not removed should still be present
          const uniqueAdded = [...new Set(playersToAdd)];
          const uniqueRemoved = new Set(playersToRemove);
          
          uniqueAdded.forEach(playerId => {
            if (!uniqueRemoved.has(playerId)) {
              expect(afterRemoving).toContain(playerId);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});