/**
 * Property-based tests for match utility functions
 * Tests the correctness properties defined in the design document
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  sortMatchesByDateDesc,
  sortMatchesByDateAsc,
  filterMatchesByEvent,
  filterMatchesByPlayer,
  filterMatchesByDateRange,
  filterMatches,
  getCompletedMatches,
  getUpcomingMatches,
  calculateMatchStats,
} from '../utils/matchUtils';
import type { MatchFilterCriteria, DateRange } from '../utils/matchUtils';
import type { Match, Frame } from '../types/snooker';

// Generators for test data
const frameGenerator = (): fc.Arbitrary<Frame> =>
  fc.record({
    Frame_Number: fc.integer({ min: 1, max: 35 }),
    Player1_Score: fc.integer({ min: 0, max: 147 }),
    Player2_Score: fc.integer({ min: 0, max: 147 }),
    Winner_ID: fc.option(fc.integer({ min: 1, max: 10000 })),
    Break: fc.option(fc.integer({ min: 0, max: 147 }))
  });

const matchGenerator = (): fc.Arbitrary<Match> =>
  fc.record({
    ID: fc.integer({ min: 1, max: 100000 }),
    Event_ID: fc.integer({ min: 1, max: 1000 }),
    Round_ID: fc.integer({ min: 1, max: 100 }),
    Match_Number: fc.integer({ min: 1, max: 64 }),
    Player1_ID: fc.integer({ min: 1, max: 10000 }),
    Player1_Name: fc.string({ minLength: 1, maxLength: 50 }),
    Player2_ID: fc.integer({ min: 1, max: 10000 }),
    Player2_Name: fc.string({ minLength: 1, maxLength: 50 }),
    Player1_Score: fc.integer({ min: 0, max: 18 }),
    Player2_Score: fc.integer({ min: 0, max: 18 }),
    Status: fc.oneof(fc.constant('R' as const), fc.constant('U' as const), fc.constant('A' as const)),
    Date_Time: fc.option(fc.integer({ min: 1577836800000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString())),
    Session: fc.option(fc.integer({ min: 1, max: 4 })),
    Table: fc.option(fc.string()),
    Frames: fc.option(fc.array(frameGenerator(), { maxLength: 35 })),
    Duration: fc.option(fc.string())
  });

// Generator for matches with guaranteed dates for sorting tests
const matchWithDateGenerator = (): fc.Arbitrary<Match> =>
  fc.record({
    ID: fc.integer({ min: 1, max: 100000 }),
    Event_ID: fc.integer({ min: 1, max: 1000 }),
    Round_ID: fc.integer({ min: 1, max: 100 }),
    Match_Number: fc.integer({ min: 1, max: 64 }),
    Player1_ID: fc.integer({ min: 1, max: 10000 }),
    Player1_Name: fc.string({ minLength: 1, maxLength: 50 }),
    Player2_ID: fc.integer({ min: 1, max: 10000 }),
    Player2_Name: fc.string({ minLength: 1, maxLength: 50 }),
    Player1_Score: fc.integer({ min: 0, max: 18 }),
    Player2_Score: fc.integer({ min: 0, max: 18 }),
    Status: fc.oneof(fc.constant('R' as const), fc.constant('U' as const), fc.constant('A' as const)),
    Date_Time: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString()),
    Session: fc.option(fc.integer({ min: 1, max: 4 })),
    Table: fc.option(fc.string()),
    Frames: fc.option(fc.array(frameGenerator(), { maxLength: 35 })),
    Duration: fc.option(fc.string())
  });

describe('Match Utils Property-Based Tests', () => {
  
  /**
   * Property 4: Match Results Sorting
   * For any list of completed matches, when sorted by date in descending order, 
   * each match's date SHALL be greater than or equal to the next match's date.
   * **Validates: Requirements 3.1**
   */
  test('Property 4: Match Results Sorting', () => {
    fc.assert(
      fc.property(
        fc.array(matchWithDateGenerator(), { minLength: 2, maxLength: 50 }),
        (matches) => {
          // Filter to completed matches only
          const completedMatches = matches.filter(match => match.Status === 'R');
          
          if (completedMatches.length < 2) {
            return; // Skip if not enough completed matches
          }
          
          const sorted = sortMatchesByDateDesc(completedMatches);
          
          // Property: Each match's date should be >= the next match's date (descending order)
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentMatch = sorted[i];
            const nextMatch = sorted[i + 1];
            
            if (currentMatch.Date_Time && nextMatch.Date_Time) {
              const currentDate = new Date(currentMatch.Date_Time);
              const nextDate = new Date(nextMatch.Date_Time);
              
              expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Match Results Filtering
   * For any list of matches and any filter criteria (event, player, date range), 
   * all returned matches SHALL satisfy all specified filter criteria.
   * **Validates: Requirements 3.4**
   */
  test('Property 5: Match Results Filtering', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator(), { maxLength: 100 }),
        fc.record({
          eventId: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
          playerId: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: undefined }),
          startDate: fc.option(fc.integer({ min: 1577836800000, max: 1640995200000 }).map(timestamp => new Date(timestamp).toISOString()), { nil: undefined }),
          endDate: fc.option(fc.integer({ min: 1640995200000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString()), { nil: undefined }),
          status: fc.option(fc.oneof(fc.constant('R' as const), fc.constant('U' as const), fc.constant('A' as const)), { nil: undefined })
        }),
        (matches, filtersRaw) => {
          // Convert null values to undefined and ensure date range is valid
          const filters: MatchFilterCriteria = {
            eventId: filtersRaw.eventId ?? undefined,
            playerId: filtersRaw.playerId ?? undefined,
            startDate: filtersRaw.startDate ?? undefined,
            endDate: filtersRaw.endDate ?? undefined,
            status: filtersRaw.status ?? undefined
          };
          
          // Ensure startDate <= endDate if both are provided
          if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            if (start > end) {
              filters.endDate = filters.startDate;
            }
          }
          
          const filtered = filterMatches(matches, filters);
          
          // All returned matches must satisfy all filter criteria
          filtered.forEach(match => {
            // Check event filter
            if (filters.eventId !== undefined) {
              expect(match.Event_ID).toBe(filters.eventId);
            }
            
            // Check player filter
            if (filters.playerId !== undefined) {
              expect(
                match.Player1_ID === filters.playerId || match.Player2_ID === filters.playerId
              ).toBe(true);
            }
            
            // Check status filter
            if (filters.status) {
              expect(match.Status).toBe(filters.status);
            }
            
            // Check date range filter
            if (filters.startDate && filters.endDate && match.Date_Time) {
              const matchDate = new Date(match.Date_Time);
              const startDate = new Date(filters.startDate);
              const endDate = new Date(filters.endDate);
              
              expect(matchDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
              expect(matchDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Upcoming Matches Sorting
   * For any list of upcoming matches, when sorted by date in ascending order, 
   * each match's date SHALL be less than or equal to the next match's date.
   * **Validates: Requirements 5.1**
   */
  test('Property 6: Upcoming Matches Sorting', () => {
    fc.assert(
      fc.property(
        fc.array(matchWithDateGenerator(), { minLength: 2, maxLength: 50 }),
        (matches) => {
          // Filter to upcoming matches only
          const upcomingMatches = matches.filter(match => match.Status === 'U');
          
          if (upcomingMatches.length < 2) {
            return; // Skip if not enough upcoming matches
          }
          
          const sorted = sortMatchesByDateAsc(upcomingMatches);
          
          // Property: Each match's date should be <= the next match's date (ascending order)
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentMatch = sorted[i];
            const nextMatch = sorted[i + 1];
            
            if (currentMatch.Date_Time && nextMatch.Date_Time) {
              const currentDate = new Date(currentMatch.Date_Time);
              const nextDate = new Date(nextMatch.Date_Time);
              
              expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Upcoming Matches Filtering
   * For any list of upcoming matches and any filter criteria (event, player), 
   * all returned matches SHALL satisfy all specified filter criteria.
   * **Validates: Requirements 5.3**
   */
  test('Property 7: Upcoming Matches Filtering', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator(), { maxLength: 100 }),
        fc.record({
          eventId: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: undefined }),
          playerId: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: undefined })
        }),
        (matches, filtersRaw) => {
          // Filter to upcoming matches first
          const upcomingMatches = matches.filter(match => match.Status === 'U');
          
          const filters: MatchFilterCriteria = {
            eventId: filtersRaw.eventId ?? undefined,
            playerId: filtersRaw.playerId ?? undefined
          };
          
          const filtered = filterMatches(upcomingMatches, filters);
          
          // All returned matches must be upcoming and satisfy filter criteria
          filtered.forEach(match => {
            // Must be upcoming
            expect(match.Status).toBe('U');
            
            // Check event filter
            if (filters.eventId !== undefined) {
              expect(match.Event_ID).toBe(filters.eventId);
            }
            
            // Check player filter
            if (filters.playerId !== undefined) {
              expect(
                match.Player1_ID === filters.playerId || match.Player2_ID === filters.playerId
              ).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for specific functions

  test('sortMatchesByDateDesc should handle matches without dates', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator()),
        (matches) => {
          const sorted = sortMatchesByDateDesc(matches);
          
          // Should not throw and should return same number of matches
          expect(sorted.length).toBe(matches.length);
          
          // Matches without dates should be at the end
          let foundMatchWithoutDate = false;
          for (let i = 0; i < sorted.length; i++) {
            if (!sorted[i].Date_Time) {
              foundMatchWithoutDate = true;
            } else if (foundMatchWithoutDate) {
              // If we found a match without date, all subsequent matches should also have no date
              expect(sorted[i].Date_Time).toBeFalsy();
            }
          }
        }
      )
    );
  });

  test('sortMatchesByDateAsc should handle matches without dates', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator()),
        (matches) => {
          const sorted = sortMatchesByDateAsc(matches);
          
          // Should not throw and should return same number of matches
          expect(sorted.length).toBe(matches.length);
          
          // Matches without dates should be at the end
          let foundMatchWithoutDate = false;
          for (let i = 0; i < sorted.length; i++) {
            if (!sorted[i].Date_Time) {
              foundMatchWithoutDate = true;
            } else if (foundMatchWithoutDate) {
              // If we found a match without date, all subsequent matches should also have no date
              expect(sorted[i].Date_Time).toBeFalsy();
            }
          }
        }
      )
    );
  });

  test('filterMatchesByEvent should return all matches when eventId is 0 or negative', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator()),
        fc.integer({ max: 0 }),
        (matches, invalidEventId) => {
          const filtered = filterMatchesByEvent(matches, invalidEventId);
          expect(filtered).toEqual(matches);
        }
      )
    );
  });

  test('filterMatchesByPlayer should return all matches when playerId is 0 or negative', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator()),
        fc.integer({ max: 0 }),
        (matches, invalidPlayerId) => {
          const filtered = filterMatchesByPlayer(matches, invalidPlayerId);
          expect(filtered).toEqual(matches);
        }
      )
    );
  });

  test('filterMatchesByDateRange should return all matches when date range is invalid', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator()),
        (matches) => {
          // Test with empty date range
          const filtered1 = filterMatchesByDateRange(matches, { startDate: '', endDate: '' });
          expect(filtered1).toEqual(matches);
          
          // Test with missing startDate
          const filtered2 = filterMatchesByDateRange(matches, { startDate: '', endDate: '2024-12-31' });
          expect(filtered2).toEqual(matches);
          
          // Test with missing endDate
          const filtered3 = filterMatchesByDateRange(matches, { startDate: '2024-01-01', endDate: '' });
          expect(filtered3).toEqual(matches);
        }
      )
    );
  });

  test('getCompletedMatches should only return matches with status R', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator()),
        (matches) => {
          const completed = getCompletedMatches(matches);
          
          completed.forEach(match => {
            expect(match.Status).toBe('R');
          });
          
          // Should return all and only completed matches
          const expectedCompleted = matches.filter(match => match.Status === 'R');
          expect(completed.length).toBe(expectedCompleted.length);
        }
      )
    );
  });

  test('getUpcomingMatches should only return matches with status U', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator()),
        (matches) => {
          const upcoming = getUpcomingMatches(matches);
          
          upcoming.forEach(match => {
            expect(match.Status).toBe('U');
          });
          
          // Should return all and only upcoming matches
          const expectedUpcoming = matches.filter(match => match.Status === 'U');
          expect(upcoming.length).toBe(expectedUpcoming.length);
        }
      )
    );
  });

  test('calculateMatchStats should return correct statistics', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.array(matchGenerator(), { minLength: 1, maxLength: 20 }),
        (playerId, matches) => {
          // Ensure the player appears in at least some matches
          const playerMatches = matches.map((match, index) => {
            // Randomly assign the test player to either player1 or player2 position
            if (index % 2 === 0) {
              return { ...match, Player1_ID: playerId };
            } else {
              return { ...match, Player2_ID: playerId };
            }
          });
          
          const stats = calculateMatchStats(playerMatches, playerId);
          
          // Basic properties
          expect(stats.totalMatches).toBeGreaterThanOrEqual(0);
          expect(stats.wins).toBeGreaterThanOrEqual(0);
          expect(stats.losses).toBeGreaterThanOrEqual(0);
          expect(stats.draws).toBeGreaterThanOrEqual(0);
          expect(stats.winPercentage).toBeGreaterThanOrEqual(0);
          expect(stats.winPercentage).toBeLessThanOrEqual(100);
          expect(stats.totalFramesWon).toBeGreaterThanOrEqual(0);
          expect(stats.totalFramesLost).toBeGreaterThanOrEqual(0);
          expect(stats.frameWinPercentage).toBeGreaterThanOrEqual(0);
          expect(stats.frameWinPercentage).toBeLessThanOrEqual(100);
          
          // Wins + losses + draws should equal total matches
          expect(stats.wins + stats.losses + stats.draws).toBe(stats.totalMatches);
          
          // Win percentage should be correct
          if (stats.totalMatches > 0) {
            const expectedWinPercentage = Math.round((stats.wins / stats.totalMatches) * 100);
            expect(stats.winPercentage).toBe(expectedWinPercentage);
          } else {
            expect(stats.winPercentage).toBe(0);
          }
          
          // Frame win percentage should be correct
          const totalFrames = stats.totalFramesWon + stats.totalFramesLost;
          if (totalFrames > 0) {
            const expectedFrameWinPercentage = Math.round((stats.totalFramesWon / totalFrames) * 100);
            expect(stats.frameWinPercentage).toBe(expectedFrameWinPercentage);
          } else {
            expect(stats.frameWinPercentage).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('calculateMatchStats should return zero stats for empty matches or invalid player', () => {
    const emptyStats = calculateMatchStats([], 123);
    expect(emptyStats.totalMatches).toBe(0);
    expect(emptyStats.wins).toBe(0);
    expect(emptyStats.losses).toBe(0);
    expect(emptyStats.draws).toBe(0);
    expect(emptyStats.winPercentage).toBe(0);
    expect(emptyStats.totalFramesWon).toBe(0);
    expect(emptyStats.totalFramesLost).toBe(0);
    expect(emptyStats.frameWinPercentage).toBe(0);
    
    // Test with invalid player ID
    fc.assert(
      fc.property(
        fc.array(matchGenerator(), { minLength: 1 }),
        (matches) => {
          const stats = calculateMatchStats(matches, 0); // Invalid player ID
          expect(stats.totalMatches).toBe(0);
        }
      )
    );
  });
});