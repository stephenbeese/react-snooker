/**
 * Property-based tests for historical date matching functionality
 * Tests Property 16: Historical Date Matching
 * **Validates: Requirements 11.4**
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { matchesHistoricalDate } from '../utils/matchUtils';
import type { Match } from '../types/snooker';

// Generator for matches with dates
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
    Date_Time: fc.integer({ min: 946684800000, max: 1893456000000 }).map(timestamp => new Date(timestamp).toISOString()), // 2000-2030
    Session: fc.option(fc.integer({ min: 1, max: 4 })),
    Table: fc.option(fc.string()),
    Frames: fc.option(fc.array(fc.record({
      Frame_Number: fc.integer({ min: 1, max: 35 }),
      Player1_Score: fc.integer({ min: 0, max: 147 }),
      Player2_Score: fc.integer({ min: 0, max: 147 }),
      Winner_ID: fc.option(fc.integer({ min: 1, max: 10000 })),
      Break: fc.option(fc.integer({ min: 0, max: 147 }))
    }), { maxLength: 35 })),
    Duration: fc.option(fc.string())
  });

// Generator for dates
const dateGenerator = (): fc.Arbitrary<Date> =>
  fc.integer({ min: 946684800000, max: 1893456000000 }).map(timestamp => new Date(timestamp));

describe('Historical Date Matching Property-Based Tests', () => {
  
  /**
   * Property 16: Historical Date Matching
   * For any set of matches and a target date, the "On this day" feature SHALL return 
   * only matches where the month and day match the target date, regardless of year.
   * **Validates: Requirements 11.4**
   */
  test('Property 16: Historical Date Matching - matches only month and day', () => {
    fc.assert(
      fc.property(
        fc.array(matchWithDateGenerator(), { minLength: 1, maxLength: 100 }),
        dateGenerator(),
        (matches, targetDate) => {
          // Filter matches using the historical date matching function
          const matchingMatches = matches.filter(match => matchesHistoricalDate(match, targetDate));
          
          // Property: All matching matches must have the same month and day as target date
          matchingMatches.forEach(match => {
            if (match.Date_Time) {
              const matchDate = new Date(match.Date_Time);
              
              // Month and day must match
              expect(matchDate.getMonth()).toBe(targetDate.getMonth());
              expect(matchDate.getDate()).toBe(targetDate.getDate());
              
              // Year can be different (that's the whole point of historical matching)
              // We don't assert anything about the year
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Historical date matching should be year-independent
   * A match on the same month/day but different year should match
   */
  test('Property 16: Historical Date Matching - year independence', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }), // month (1-12)
        fc.integer({ min: 1, max: 28 }), // day (1-28 to avoid month-end issues)
        fc.integer({ min: 2000, max: 2030 }), // match year
        fc.integer({ min: 2000, max: 2030 }), // target year
        (month, day, matchYear, targetYear) => {
          // Create a match with a specific date
          const match: Match = {
            ID: 1,
            Event_ID: 1,
            Round_ID: 1,
            Match_Number: 1,
            Player1_ID: 1,
            Player1_Name: 'Player 1',
            Player2_ID: 2,
            Player2_Name: 'Player 2',
            Player1_Score: 5,
            Player2_Score: 3,
            Status: 'R',
            Date_Time: new Date(matchYear, month - 1, day).toISOString()
          };
          
          // Create target date with same month/day but potentially different year
          const targetDate = new Date(targetYear, month - 1, day);
          
          // Property: Should match regardless of year difference
          const result = matchesHistoricalDate(match, targetDate);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Historical date matching should reject different month/day combinations
   */
  test('Property 16: Historical Date Matching - rejects different dates', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }), // match month
        fc.integer({ min: 1, max: 28 }), // match day
        fc.integer({ min: 1, max: 12 }), // target month
        fc.integer({ min: 1, max: 28 }), // target day
        fc.integer({ min: 2000, max: 2030 }), // year
        (matchMonth, matchDay, targetMonth, targetDay, year) => {
          // Skip if dates are the same
          if (matchMonth === targetMonth && matchDay === targetDay) {
            return;
          }
          
          // Create a match with a specific date
          const match: Match = {
            ID: 1,
            Event_ID: 1,
            Round_ID: 1,
            Match_Number: 1,
            Player1_ID: 1,
            Player1_Name: 'Player 1',
            Player2_ID: 2,
            Player2_Name: 'Player 2',
            Player1_Score: 5,
            Player2_Score: 3,
            Status: 'R',
            Date_Time: new Date(year, matchMonth - 1, matchDay).toISOString()
          };
          
          // Create target date with different month or day
          const targetDate = new Date(year, targetMonth - 1, targetDay);
          
          // Property: Should NOT match if month or day is different
          const result = matchesHistoricalDate(match, targetDate);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Matches without dates should never match
   */
  test('Property 16: Historical Date Matching - handles missing dates', () => {
    fc.assert(
      fc.property(
        dateGenerator(),
        (targetDate) => {
          // Create a match without a date
          const match: Match = {
            ID: 1,
            Event_ID: 1,
            Round_ID: 1,
            Match_Number: 1,
            Player1_ID: 1,
            Player1_Name: 'Player 1',
            Player2_ID: 2,
            Player2_Name: 'Player 2',
            Player1_Score: 5,
            Player2_Score: 3,
            Status: 'U',
            Date_Time: undefined
          };
          
          // Property: Should never match if match has no date
          const result = matchesHistoricalDate(match, targetDate);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Filtering should be consistent
   * Applying the filter twice should give the same results
   */
  test('Property 16: Historical Date Matching - consistency', () => {
    fc.assert(
      fc.property(
        fc.array(matchWithDateGenerator(), { minLength: 1, maxLength: 50 }),
        dateGenerator(),
        (matches, targetDate) => {
          // Filter twice
          const result1 = matches.filter(match => matchesHistoricalDate(match, targetDate));
          const result2 = matches.filter(match => matchesHistoricalDate(match, targetDate));
          
          // Property: Results should be identical
          expect(result1.length).toBe(result2.length);
          expect(result1.map(m => m.ID).sort()).toEqual(result2.map(m => m.ID).sort());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All non-matching matches should have different month or day
   */
  test('Property 16: Historical Date Matching - completeness', () => {
    fc.assert(
      fc.property(
        fc.array(matchWithDateGenerator(), { minLength: 1, maxLength: 100 }),
        dateGenerator(),
        (matches, targetDate) => {
          // Separate matches into matching and non-matching
          const matchingMatches = matches.filter(match => matchesHistoricalDate(match, targetDate));
          const nonMatchingMatches = matches.filter(match => !matchesHistoricalDate(match, targetDate));
          
          // Property: All non-matching matches must have different month or day
          nonMatchingMatches.forEach(match => {
            if (match.Date_Time) {
              const matchDate = new Date(match.Date_Time);
              const hasDifferentMonthOrDay = 
                matchDate.getMonth() !== targetDate.getMonth() ||
                matchDate.getDate() !== targetDate.getDate();
              
              expect(hasDifferentMonthOrDay).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Edge case - leap year dates (Feb 29)
   */
  test('Property 16: Historical Date Matching - leap year handling', () => {
    // Create a match on Feb 29 (leap year)
    const leapYearMatch: Match = {
      ID: 1,
      Event_ID: 1,
      Round_ID: 1,
      Match_Number: 1,
      Player1_ID: 1,
      Player1_Name: 'Player 1',
      Player2_ID: 2,
      Player2_Name: 'Player 2',
      Player1_Score: 5,
      Player2_Score: 3,
      Status: 'R',
      Date_Time: new Date(2020, 1, 29).toISOString() // Feb 29, 2020
    };
    
    // Target date is also Feb 29 but different year
    const targetDate = new Date(2024, 1, 29); // Feb 29, 2024
    
    // Should match
    expect(matchesHistoricalDate(leapYearMatch, targetDate)).toBe(true);
    
    // Target date is Feb 28
    const nonLeapTarget = new Date(2024, 1, 28); // Feb 28, 2024
    
    // Should NOT match
    expect(matchesHistoricalDate(leapYearMatch, nonLeapTarget)).toBe(false);
  });

  /**
   * Property: Edge case - year boundaries (Jan 1, Dec 31)
   */
  test('Property 16: Historical Date Matching - year boundaries', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2000, max: 2030 }),
        fc.integer({ min: 2000, max: 2030 }),
        (matchYear, targetYear) => {
          // Test Jan 1
          const jan1Match: Match = {
            ID: 1,
            Event_ID: 1,
            Round_ID: 1,
            Match_Number: 1,
            Player1_ID: 1,
            Player1_Name: 'Player 1',
            Player2_ID: 2,
            Player2_Name: 'Player 2',
            Player1_Score: 5,
            Player2_Score: 3,
            Status: 'R',
            Date_Time: new Date(matchYear, 0, 1).toISOString()
          };
          
          const jan1Target = new Date(targetYear, 0, 1);
          expect(matchesHistoricalDate(jan1Match, jan1Target)).toBe(true);
          
          // Test Dec 31
          const dec31Match: Match = {
            ...jan1Match,
            ID: 2,
            Date_Time: new Date(matchYear, 11, 31).toISOString()
          };
          
          const dec31Target = new Date(targetYear, 11, 31);
          expect(matchesHistoricalDate(dec31Match, dec31Target)).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
});
