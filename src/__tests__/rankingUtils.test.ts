/**
 * Property-based tests for ranking utility functions
 * Tests the correctness properties defined in the design document
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateRankingChange,
  filterRankingsByTour,
  filterRankingsBySeason,
  sortRankingsByPosition,
  getRankingsMovedUp,
  getRankingsMovedDown,
  getRankingsNoChange,
  getNewRankingEntries,
} from '../utils/rankingUtils';
import type { Ranking, Tour } from '../types/snooker';

// Generators for test data
const rankingGenerator = (): fc.Arbitrary<Ranking> =>
  fc.record({
    Position: fc.integer({ min: 1, max: 128 }),
    Player_ID: fc.integer({ min: 1, max: 10000 }),
    Player_Name: fc.string({ minLength: 1, maxLength: 50 }),
    Nationality: fc.oneof(
      fc.constant('England'),
      fc.constant('Scotland'),
      fc.constant('Wales'),
      fc.constant('Northern Ireland'),
      fc.constant('China'),
      fc.constant('Australia'),
      fc.constant('Belgium'),
      fc.constant('Thailand')
    ),
    Points: fc.integer({ min: 0, max: 1000000 }),
    Money: fc.option(fc.integer({ min: 0, max: 5000000 })),
    Change: fc.option(fc.integer({ min: -50, max: 50 }))
  });

const uniqueRankingGenerator = (): fc.Arbitrary<Ranking[]> =>
  fc.array(rankingGenerator(), { minLength: 1, maxLength: 50 })
    .map(rankings => {
      // Ensure unique positions and player IDs
      const uniqueRankings: Ranking[] = [];
      const usedPositions = new Set<number>();
      const usedPlayerIds = new Set<number>();
      
      rankings.forEach((ranking, index) => {
        let position = ranking.Position;
        let playerId = ranking.Player_ID;
        
        // Ensure unique position
        while (usedPositions.has(position)) {
          position = (position % 128) + 1;
        }
        usedPositions.add(position);
        
        // Ensure unique player ID
        while (usedPlayerIds.has(playerId)) {
          playerId = playerId + 1;
        }
        usedPlayerIds.add(playerId);
        
        uniqueRankings.push({
          ...ranking,
          Position: position,
          Player_ID: playerId
        });
      });
      
      return uniqueRankings.sort((a, b) => a.Position - b.Position);
    });

describe('Ranking Utils Property-Based Tests', () => {
  
  /**
   * Property 8: Ranking Change Calculation
   * For any two consecutive ranking snapshots, the ranking change for each player 
   * SHALL equal (previous position - current position).
   * **Validates: Requirements 6.4**
   */
  test('Property 8: Ranking Change Calculation', () => {
    fc.assert(
      fc.property(
        uniqueRankingGenerator(),
        uniqueRankingGenerator(),
        (currentRankingsRaw, previousRankingsRaw) => {
          // Ensure we have some overlapping players between snapshots
          const currentRankings = currentRankingsRaw.slice(0, Math.min(20, currentRankingsRaw.length));
          const previousRankings = previousRankingsRaw.slice(0, Math.min(20, previousRankingsRaw.length));
          
          // Create some overlap by using some of the same player IDs
          const overlapCount = Math.min(5, currentRankings.length, previousRankings.length);
          for (let i = 0; i < overlapCount; i++) {
            if (i < currentRankings.length && i < previousRankings.length) {
              currentRankings[i] = {
                ...currentRankings[i],
                Player_ID: previousRankings[i].Player_ID
              };
            }
          }
          
          const rankingsWithChanges = calculateRankingChange(currentRankings, previousRankings);
          
          // Verify the calculation for each player
          rankingsWithChanges.forEach(currentRanking => {
            const previousRanking = previousRankings.find(
              prev => prev.Player_ID === currentRanking.Player_ID
            );
            
            if (previousRanking) {
              // Player existed in previous ranking
              const expectedChange = previousRanking.Position - currentRanking.Position;
              expect(currentRanking.Change).toBe(expectedChange);
              
              // Verify the change direction makes sense
              if (expectedChange > 0) {
                // Moved up (lower position number)
                expect(currentRanking.Position).toBeLessThan(previousRanking.Position);
              } else if (expectedChange < 0) {
                // Moved down (higher position number)
                expect(currentRanking.Position).toBeGreaterThan(previousRanking.Position);
              } else {
                // No change
                expect(currentRanking.Position).toBe(previousRanking.Position);
              }
            } else {
              // New player, should have undefined change
              expect(currentRanking.Change).toBeUndefined();
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for specific functions

  test('calculateRankingChange should handle empty arrays', () => {
    const result = calculateRankingChange([], []);
    expect(result).toEqual([]);
  });

  test('calculateRankingChange should handle empty previous rankings', () => {
    fc.assert(
      fc.property(
        uniqueRankingGenerator(),
        (currentRankings) => {
          const result = calculateRankingChange(currentRankings, []);
          
          // All players should have undefined change (new entries)
          result.forEach(ranking => {
            expect(ranking.Change).toBeUndefined();
          });
        }
      )
    );
  });

  test('calculateRankingChange should handle empty current rankings', () => {
    fc.assert(
      fc.property(
        uniqueRankingGenerator(),
        (previousRankings) => {
          const result = calculateRankingChange([], previousRankings);
          expect(result).toEqual([]);
        }
      )
    );
  });

  test('sortRankingsByPosition should sort in ascending order', () => {
    fc.assert(
      fc.property(
        fc.array(rankingGenerator(), { minLength: 1, maxLength: 20 }),
        (rankings) => {
          const sorted = sortRankingsByPosition(rankings);
          
          // Check that positions are in ascending order
          for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].Position).toBeGreaterThanOrEqual(sorted[i - 1].Position);
          }
          
          // Check that all original rankings are present
          expect(sorted.length).toBe(rankings.length);
        }
      )
    );
  });

  test('sortRankingsByPosition should not mutate original array', () => {
    fc.assert(
      fc.property(
        fc.array(rankingGenerator(), { minLength: 1, maxLength: 20 }),
        (rankings) => {
          const originalCopy = [...rankings];
          const sorted = sortRankingsByPosition(rankings);
          
          // Original array should be unchanged
          expect(rankings).toEqual(originalCopy);
          
          // Sorted should be a different array
          expect(sorted).not.toBe(rankings);
        }
      )
    );
  });

  test('getRankingsMovedUp should return only positive changes', () => {
    fc.assert(
      fc.property(
        fc.array(rankingGenerator(), { minLength: 1, maxLength: 20 }),
        (rankings) => {
          const movedUp = getRankingsMovedUp(rankings);
          
          movedUp.forEach(ranking => {
            expect(ranking.Change).toBeDefined();
            expect(ranking.Change!).toBeGreaterThan(0);
          });
        }
      )
    );
  });

  test('getRankingsMovedDown should return only negative changes', () => {
    fc.assert(
      fc.property(
        fc.array(rankingGenerator(), { minLength: 1, maxLength: 20 }),
        (rankings) => {
          const movedDown = getRankingsMovedDown(rankings);
          
          movedDown.forEach(ranking => {
            expect(ranking.Change).toBeDefined();
            expect(ranking.Change!).toBeLessThan(0);
          });
        }
      )
    );
  });

  test('getRankingsNoChange should return only zero changes', () => {
    fc.assert(
      fc.property(
        fc.array(rankingGenerator(), { minLength: 1, maxLength: 20 }),
        (rankings) => {
          const noChange = getRankingsNoChange(rankings);
          
          noChange.forEach(ranking => {
            expect(ranking.Change).toBeDefined();
            expect(ranking.Change!).toBe(0);
          });
        }
      )
    );
  });

  test('getNewRankingEntries should return only undefined changes', () => {
    fc.assert(
      fc.property(
        fc.array(rankingGenerator(), { minLength: 1, maxLength: 20 }),
        (rankings) => {
          const newEntries = getNewRankingEntries(rankings);
          
          newEntries.forEach(ranking => {
            expect(ranking.Change).toBeUndefined();
          });
        }
      )
    );
  });

  test('filterRankingsByTour should return all rankings (placeholder implementation)', () => {
    fc.assert(
      fc.property(
        fc.array(rankingGenerator()),
        fc.oneof(fc.constant('main' as Tour), fc.constant('q' as Tour), fc.constant('amateur' as Tour)),
        (rankings, tour) => {
          const filtered = filterRankingsByTour(rankings, tour);
          expect(filtered).toEqual(rankings);
        }
      )
    );
  });

  test('filterRankingsBySeason should return all rankings (placeholder implementation)', () => {
    fc.assert(
      fc.property(
        fc.array(rankingGenerator()),
        fc.integer({ min: 2020, max: 2024 }),
        (rankings, season) => {
          const filtered = filterRankingsBySeason(rankings, season);
          expect(filtered).toEqual(rankings);
        }
      )
    );
  });

  // Test the complete workflow
  test('ranking change calculation workflow', () => {
    // Create a specific test case to verify the calculation logic
    const previousRankings: Ranking[] = [
      {
        Position: 1,
        Player_ID: 100,
        Player_Name: 'Player A',
        Nationality: 'England',
        Points: 1000000,
        Money: 500000
      },
      {
        Position: 2,
        Player_ID: 200,
        Player_Name: 'Player B',
        Nationality: 'Scotland',
        Points: 900000,
        Money: 450000
      },
      {
        Position: 3,
        Player_ID: 300,
        Player_Name: 'Player C',
        Nationality: 'Wales',
        Points: 800000,
        Money: 400000
      }
    ];

    const currentRankings: Ranking[] = [
      {
        Position: 2, // Moved down from 1
        Player_ID: 100,
        Player_Name: 'Player A',
        Nationality: 'England',
        Points: 950000,
        Money: 475000
      },
      {
        Position: 1, // Moved up from 2
        Player_ID: 200,
        Player_Name: 'Player B',
        Nationality: 'Scotland',
        Points: 1050000,
        Money: 525000
      },
      {
        Position: 3, // No change from 3
        Player_ID: 300,
        Player_Name: 'Player C',
        Nationality: 'Wales',
        Points: 800000,
        Money: 400000
      },
      {
        Position: 4, // New entry
        Player_ID: 400,
        Player_Name: 'Player D',
        Nationality: 'China',
        Points: 750000,
        Money: 375000
      }
    ];

    const result = calculateRankingChange(currentRankings, previousRankings);

    // Player A: moved from 1 to 2, change = 1 - 2 = -1 (moved down)
    const playerA = result.find(r => r.Player_ID === 100);
    expect(playerA?.Change).toBe(-1);

    // Player B: moved from 2 to 1, change = 2 - 1 = 1 (moved up)
    const playerB = result.find(r => r.Player_ID === 200);
    expect(playerB?.Change).toBe(1);

    // Player C: stayed at 3, change = 3 - 3 = 0 (no change)
    const playerC = result.find(r => r.Player_ID === 300);
    expect(playerC?.Change).toBe(0);

    // Player D: new entry, change = undefined
    const playerD = result.find(r => r.Player_ID === 400);
    expect(playerD?.Change).toBeUndefined();
  });
});