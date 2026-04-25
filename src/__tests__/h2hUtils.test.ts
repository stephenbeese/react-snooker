/**
 * Property-based tests for head-to-head utility functions
 * Tests the correctness properties defined in the design document
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateH2HWinPercentage,
  calculateH2HStats,
  groupH2HByEventType,
  aggregateH2HRecord,
  getMostCommonH2HVenue,
  calculateH2HTrends,
} from '../utils/h2hUtils';
import type { Match, Event, Frame } from '../types/snooker';

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

// Generator for H2H matches between two specific players
const h2hMatchGenerator = (player1Id: number, player2Id: number): fc.Arbitrary<Match> =>
  fc.record({
    ID: fc.integer({ min: 1, max: 100000 }),
    Event_ID: fc.integer({ min: 1, max: 1000 }),
    Round_ID: fc.integer({ min: 1, max: 100 }),
    Match_Number: fc.integer({ min: 1, max: 64 }),
    Player1_ID: fc.oneof(fc.constant(player1Id), fc.constant(player2Id)),
    Player1_Name: fc.string({ minLength: 1, maxLength: 50 }),
    Player2_ID: fc.oneof(fc.constant(player1Id), fc.constant(player2Id)),
    Player2_Name: fc.string({ minLength: 1, maxLength: 50 }),
    Player1_Score: fc.integer({ min: 0, max: 18 }),
    Player2_Score: fc.integer({ min: 0, max: 18 }),
    Status: fc.oneof(fc.constant('R' as const), fc.constant('U' as const), fc.constant('A' as const)),
    Date_Time: fc.option(fc.integer({ min: 1577836800000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString())),
    Session: fc.option(fc.integer({ min: 1, max: 4 })),
    Table: fc.option(fc.string()),
    Frames: fc.option(fc.array(frameGenerator(), { maxLength: 35 })),
    Duration: fc.option(fc.string())
  }).filter(match => match.Player1_ID !== match.Player2_ID); // Ensure different players

const eventGenerator = (): fc.Arbitrary<Event> =>
  fc.record({
    ID: fc.integer({ min: 1, max: 1000 }),
    Name: fc.string({ minLength: 1, maxLength: 100 }),
    StartDate: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString().split('T')[0]),
    EndDate: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString().split('T')[0]),
    Venue: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    Country: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    Tour: fc.oneof(fc.constant('Main Tour'), fc.constant('Q Tour'), fc.constant('Amateur')),
    Sponsor: fc.option(fc.string()),
    Prize_Fund: fc.option(fc.integer({ min: 0, max: 10000000 })),
    Defending_Champion: fc.option(fc.string()),
    Defending_Champion_ID: fc.option(fc.integer({ min: 1, max: 10000 }))
  });

describe('Head-to-Head Utils Property-Based Tests', () => {
  
  /**
   * Property 9: Head-to-Head Win Percentage
   * For any set of matches between two players, the win percentage for each player 
   * SHALL equal (wins / total matches) × 100, rounded to nearest integer.
   * **Validates: Requirements 7.2**
   */
  test('Property 9: Head-to-Head Win Percentage', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1001, max: 2000 }),
          fc.array(h2hMatchGenerator(0, 0), { minLength: 1, maxLength: 20 })
        ),
        ([player1Id, player2Id, matches]) => {
          if (matches.length === 0) return;
          
          // Update matches to use the specific player IDs
          const h2hMatches = matches.map((match, index) => ({
            ...match,
            Player1_ID: index % 2 === 0 ? player1Id : player2Id,
            Player2_ID: index % 2 === 0 ? player2Id : player1Id,
            Player1_Name: `Player ${index % 2 === 0 ? player1Id : player2Id}`,
            Player2_Name: `Player ${index % 2 === 0 ? player2Id : player1Id}`
          }));
          
          const stats = calculateH2HWinPercentage(h2hMatches, player1Id, player2Id);
          
          // Calculate expected values manually
          let player1Wins = 0;
          let player2Wins = 0;
          let draws = 0;
          
          h2hMatches.forEach(match => {
            const isPlayer1AsPlayer1 = match.Player1_ID === player1Id;
            const player1Score = isPlayer1AsPlayer1 ? match.Player1_Score : match.Player2_Score;
            const player2Score = isPlayer1AsPlayer1 ? match.Player2_Score : match.Player1_Score;
            
            if (player1Score > player2Score) {
              player1Wins++;
            } else if (player2Score > player1Score) {
              player2Wins++;
            } else {
              draws++;
            }
          });
          
          const totalMatches = h2hMatches.length;
          const expectedPlayer1WinPercentage = totalMatches > 0 ? Math.round((player1Wins / totalMatches) * 100) : 0;
          const expectedPlayer2WinPercentage = totalMatches > 0 ? Math.round((player2Wins / totalMatches) * 100) : 0;
          
          // Verify the property: win percentage = (wins / total matches) × 100, rounded to nearest integer
          expect(stats.player1WinPercentage).toBe(expectedPlayer1WinPercentage);
          expect(stats.player2WinPercentage).toBe(expectedPlayer2WinPercentage);
          expect(stats.player1Wins).toBe(player1Wins);
          expect(stats.player2Wins).toBe(player2Wins);
          expect(stats.draws).toBe(draws);
          expect(stats.totalMatches).toBe(totalMatches);
          
          // Additional properties
          expect(stats.player1Id).toBe(player1Id);
          expect(stats.player2Id).toBe(player2Id);
          expect(stats.player1WinPercentage).toBeGreaterThanOrEqual(0);
          expect(stats.player1WinPercentage).toBeLessThanOrEqual(100);
          expect(stats.player2WinPercentage).toBeGreaterThanOrEqual(0);
          expect(stats.player2WinPercentage).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 10: Head-to-Head Event Grouping
   * For any list of head-to-head matches, when grouped by event type, 
   * each match in a group SHALL have the same event type as other matches in that group.
   * **Validates: Requirements 7.4**
   */
  test('Property 10: Head-to-Head Event Grouping', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1001, max: 2000 }),
          fc.array(matchGenerator(), { minLength: 1, maxLength: 15 }),
          fc.array(eventGenerator(), { minLength: 1, maxLength: 10 })
        ),
        ([player1Id, player2Id, matches, events]) => {
          // Convert matches to H2H matches between the two players
          const h2hMatches = matches.map((match, index) => ({
            ...match,
            Player1_ID: index % 2 === 0 ? player1Id : player2Id,
            Player2_ID: index % 2 === 0 ? player2Id : player1Id,
            Player1_Name: `Player ${index % 2 === 0 ? player1Id : player2Id}`,
            Player2_Name: `Player ${index % 2 === 0 ? player2Id : player1Id}`,
            Event_ID: events[index % events.length].ID // Ensure event exists
          }));
          
          const grouped = groupH2HByEventType(h2hMatches, events, player1Id, player2Id);
          
          // Property: Each match in a group should have the same event type
          grouped.forEach(group => {
            const eventType = group.eventType;
            
            group.matches.forEach(match => {
              // Find the event for this match
              const event = events.find(e => e.ID === match.Event_ID);
              const matchEventType = event?.Tour || 'Unknown';
              
              // Each match in the group should have the same event type
              expect(matchEventType).toBe(eventType);
            });
            
            // Additional properties
            expect(group.totalMatches).toBe(group.matches.length);
            expect(group.player1Wins + group.player2Wins + group.draws).toBe(group.totalMatches);
            expect(group.player1Wins).toBeGreaterThanOrEqual(0);
            expect(group.player2Wins).toBeGreaterThanOrEqual(0);
            expect(group.draws).toBeGreaterThanOrEqual(0);
          });
          
          // All matches should be accounted for in groups
          const totalMatchesInGroups = grouped.reduce((sum, group) => sum + group.matches.length, 0);
          expect(totalMatchesInGroups).toBe(h2hMatches.length);
          
          // No duplicate matches across groups
          const allMatchIds = new Set<number>();
          grouped.forEach(group => {
            group.matches.forEach(match => {
              expect(allMatchIds.has(match.ID)).toBe(false);
              allMatchIds.add(match.ID);
            });
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  // Additional unit tests for edge cases and specific functionality

  test('calculateH2HWinPercentage should handle empty matches array', () => {
    const stats = calculateH2HWinPercentage([], 1, 2);
    
    expect(stats.player1Id).toBe(1);
    expect(stats.player2Id).toBe(2);
    expect(stats.player1Wins).toBe(0);
    expect(stats.player2Wins).toBe(0);
    expect(stats.draws).toBe(0);
    expect(stats.totalMatches).toBe(0);
    expect(stats.player1WinPercentage).toBe(0);
    expect(stats.player2WinPercentage).toBe(0);
    expect(stats.player1Name).toBe('');
    expect(stats.player2Name).toBe('');
  });

  test('calculateH2HWinPercentage should handle matches not involving the specified players', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator(), { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 10001, max: 20000 }),
        fc.integer({ min: 20001, max: 30000 }),
        (matches, player1Id, player2Id) => {
          // Ensure matches don't involve the specified players
          const nonH2HMatches = matches.map(match => ({
            ...match,
            Player1_ID: 1,
            Player2_ID: 2
          }));
          
          const stats = calculateH2HWinPercentage(nonH2HMatches, player1Id, player2Id);
          
          expect(stats.totalMatches).toBe(0);
          expect(stats.player1Wins).toBe(0);
          expect(stats.player2Wins).toBe(0);
          expect(stats.draws).toBe(0);
          expect(stats.player1WinPercentage).toBe(0);
          expect(stats.player2WinPercentage).toBe(0);
        }
      )
    );
  });

  test('calculateH2HStats should include frame statistics', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1001, max: 2000 }),
          fc.array(h2hMatchGenerator(0, 0), { minLength: 1, maxLength: 10 })
        ),
        ([player1Id, player2Id, matches]) => {
          // Update matches to use the specific player IDs
          const h2hMatches = matches.map((match, index) => ({
            ...match,
            Player1_ID: index % 2 === 0 ? player1Id : player2Id,
            Player2_ID: index % 2 === 0 ? player2Id : player1Id,
            Player1_Name: `Player ${index % 2 === 0 ? player1Id : player2Id}`,
            Player2_Name: `Player ${index % 2 === 0 ? player2Id : player1Id}`
          }));
          
          const stats = calculateH2HStats(h2hMatches, player1Id, player2Id);
          
          // Should have all basic H2H stats
          expect(stats.player1Id).toBe(player1Id);
          expect(stats.player2Id).toBe(player2Id);
          expect(stats.totalMatches).toBe(h2hMatches.length);
          
          // Should have frame statistics
          expect(stats.player1FramesWon).toBeGreaterThanOrEqual(0);
          expect(stats.player2FramesWon).toBeGreaterThanOrEqual(0);
          expect(stats.totalFrames).toBe(stats.player1FramesWon + stats.player2FramesWon);
          expect(stats.player1FrameWinPercentage).toBeGreaterThanOrEqual(0);
          expect(stats.player1FrameWinPercentage).toBeLessThanOrEqual(100);
          expect(stats.player2FrameWinPercentage).toBeGreaterThanOrEqual(0);
          expect(stats.player2FrameWinPercentage).toBeLessThanOrEqual(100);
          
          // Frame win percentages should be calculated correctly
          if (stats.totalFrames > 0) {
            const expectedPlayer1FrameWinPercentage = Math.round((stats.player1FramesWon / stats.totalFrames) * 100);
            const expectedPlayer2FrameWinPercentage = Math.round((stats.player2FramesWon / stats.totalFrames) * 100);
            expect(stats.player1FrameWinPercentage).toBe(expectedPlayer1FrameWinPercentage);
            expect(stats.player2FrameWinPercentage).toBe(expectedPlayer2FrameWinPercentage);
          } else {
            expect(stats.player1FrameWinPercentage).toBe(0);
            expect(stats.player2FrameWinPercentage).toBe(0);
          }
        }
      )
    );
  });

  test('groupH2HByEventType should handle empty matches or events arrays', () => {
    const result1 = groupH2HByEventType([], [], 1, 2);
    expect(result1).toEqual([]);
    
    const matches = [
      {
        ID: 1,
        Event_ID: 1,
        Round_ID: 1,
        Match_Number: 1,
        Player1_ID: 1,
        Player1_Name: 'Player 1',
        Player2_ID: 2,
        Player2_Name: 'Player 2',
        Player1_Score: 4,
        Player2_Score: 2,
        Status: 'R' as const,
        Date_Time: '2024-01-01T10:00:00Z'
      }
    ];
    
    const result2 = groupH2HByEventType(matches, [], 1, 2);
    expect(result2).toHaveLength(1);
    expect(result2[0].eventType).toBe('Unknown');
  });

  test('groupH2HByEventType should sort results by event type name', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1001, max: 2000 }),
          fc.array(matchGenerator(), { minLength: 3, maxLength: 6 }),
          fc.array(eventGenerator(), { minLength: 3, maxLength: 5 })
        ),
        ([player1Id, player2Id, matches, events]) => {
          // Ensure we have different event types
          const diverseEvents = events.map((event, index) => ({
            ...event,
            Tour: ['Main Tour', 'Q Tour', 'Amateur'][index % 3]
          }));
          
          const h2hMatches = matches.map((match, index) => ({
            ...match,
            Player1_ID: index % 2 === 0 ? player1Id : player2Id,
            Player2_ID: index % 2 === 0 ? player2Id : player1Id,
            Event_ID: diverseEvents[index % diverseEvents.length].ID
          }));
          
          const grouped = groupH2HByEventType(h2hMatches, diverseEvents, player1Id, player2Id);
          
          // Should be sorted by event type name
          for (let i = 0; i < grouped.length - 1; i++) {
            expect(grouped[i].eventType.localeCompare(grouped[i + 1].eventType)).toBeLessThanOrEqual(0);
          }
        }
      )
    );
  });

  test('aggregateH2HRecord should provide comprehensive statistics', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1001, max: 2000 }),
          fc.array(h2hMatchGenerator(0, 0), { minLength: 5, maxLength: 10 })
        ),
        ([player1Id, player2Id, matches]) => {
          // Add dates and update player IDs
          const h2hMatches = matches.map((match, index) => ({
            ...match,
            Player1_ID: index % 2 === 0 ? player1Id : player2Id,
            Player2_ID: index % 2 === 0 ? player2Id : player1Id,
            Date_Time: new Date(2020 + (index % 5), index % 12, 1).toISOString()
          }));
          
          const aggregated = aggregateH2HRecord(h2hMatches, player1Id, player2Id);
          
          // Should have overall stats
          expect(aggregated.overall.totalMatches).toBe(h2hMatches.length);
          expect(aggregated.overall.player1Id).toBe(player1Id);
          expect(aggregated.overall.player2Id).toBe(player2Id);
          
          // Should have by-year breakdown
          expect(typeof aggregated.byYear).toBe('object');
          
          // Should have recent form (last 10 matches)
          expect(aggregated.recentForm.totalMatches).toBeLessThanOrEqual(10);
          expect(aggregated.recentForm.totalMatches).toBeLessThanOrEqual(h2hMatches.length);
          
          // Sum of yearly matches should equal total matches (for matches with valid dates)
          const yearlyTotal = Object.values(aggregated.byYear).reduce((sum, yearStats) => sum + yearStats.totalMatches, 0);
          const matchesWithDates = h2hMatches.filter(match => match.Date_Time).length;
          expect(yearlyTotal).toBe(matchesWithDates);
        }
      )
    );
  });

  test('getMostCommonH2HVenue should return correct venue', () => {
    const events = [
      { ID: 1, Name: 'Event 1', StartDate: '2024-01-01', EndDate: '2024-01-07', Tour: 'Main Tour', Venue: 'Crucible Theatre' },
      { ID: 2, Name: 'Event 2', StartDate: '2024-02-01', EndDate: '2024-02-07', Tour: 'Main Tour', Venue: 'Alexandra Palace' },
      { ID: 3, Name: 'Event 3', StartDate: '2024-03-01', EndDate: '2024-03-07', Tour: 'Main Tour', Venue: 'Crucible Theatre' }
    ];
    
    const matches = [
      { ID: 1, Event_ID: 1, Round_ID: 1, Match_Number: 1, Player1_ID: 1, Player1_Name: 'Player 1', Player2_ID: 2, Player2_Name: 'Player 2', Player1_Score: 4, Player2_Score: 2, Status: 'R' as const },
      { ID: 2, Event_ID: 1, Round_ID: 1, Match_Number: 2, Player1_ID: 1, Player1_Name: 'Player 1', Player2_ID: 2, Player2_Name: 'Player 2', Player1_Score: 3, Player2_Score: 4, Status: 'R' as const },
      { ID: 3, Event_ID: 2, Round_ID: 1, Match_Number: 1, Player1_ID: 1, Player1_Name: 'Player 1', Player2_ID: 2, Player2_Name: 'Player 2', Player1_Score: 4, Player2_Score: 1, Status: 'R' as const },
      { ID: 4, Event_ID: 3, Round_ID: 1, Match_Number: 1, Player1_ID: 1, Player1_Name: 'Player 1', Player2_ID: 2, Player2_Name: 'Player 2', Player1_Score: 2, Player2_Score: 4, Status: 'R' as const }
    ];
    
    const mostCommonVenue = getMostCommonH2HVenue(matches, events);
    expect(mostCommonVenue).toBe('Crucible Theatre'); // Appears in 3 matches vs 1 for Alexandra Palace
  });

  test('getMostCommonH2HVenue should handle empty data', () => {
    expect(getMostCommonH2HVenue([], [])).toBeNull();
    expect(getMostCommonH2HVenue([{ ID: 1, Event_ID: 1 } as Match], [])).toBeNull();
    expect(getMostCommonH2HVenue([], [{ ID: 1, Venue: 'Test' } as Event])).toBeNull();
  });

  test('calculateH2HTrends should provide chronological performance data', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1001, max: 2000 }),
          fc.array(h2hMatchGenerator(0, 0), { minLength: 3, maxLength: 8 })
        ),
        ([player1Id, player2Id, matches]) => {
          // Add chronological dates and update player IDs
          const h2hMatches = matches.map((match, index) => ({
            ...match,
            Player1_ID: index % 2 === 0 ? player1Id : player2Id,
            Player2_ID: index % 2 === 0 ? player2Id : player1Id,
            Date_Time: new Date(2020, 0, index + 1).toISOString()
          }));
          
          const trends = calculateH2HTrends(h2hMatches, player1Id, player2Id);
          
          // Should have one trend point per match
          expect(trends.length).toBe(h2hMatches.length);
          
          // Dates should be in chronological order
          for (let i = 0; i < trends.length - 1; i++) {
            const currentDate = new Date(trends[i].date);
            const nextDate = new Date(trends[i + 1].date);
            expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
          }
          
          // Cumulative wins should be non-decreasing
          for (let i = 0; i < trends.length - 1; i++) {
            expect(trends[i + 1].player1CumulativeWins).toBeGreaterThanOrEqual(trends[i].player1CumulativeWins);
            expect(trends[i + 1].player2CumulativeWins).toBeGreaterThanOrEqual(trends[i].player2CumulativeWins);
          }
          
          // Win percentages should be calculated correctly
          trends.forEach(trend => {
            const totalMatches = trend.player1CumulativeWins + trend.player2CumulativeWins;
            if (totalMatches > 0) {
              const expectedPlayer1Percentage = Math.round((trend.player1CumulativeWins / totalMatches) * 100);
              const expectedPlayer2Percentage = Math.round((trend.player2CumulativeWins / totalMatches) * 100);
              expect(trend.player1WinPercentage).toBe(expectedPlayer1Percentage);
              expect(trend.player2WinPercentage).toBe(expectedPlayer2Percentage);
            } else {
              expect(trend.player1WinPercentage).toBe(0);
              expect(trend.player2WinPercentage).toBe(0);
            }
          });
        }
      )
    );
  });

  test('calculateH2HTrends should handle matches without dates', () => {
    const matchesWithoutDates = [
      { ID: 1, Event_ID: 1, Round_ID: 1, Match_Number: 1, Player1_ID: 1, Player1_Name: 'Player 1', Player2_ID: 2, Player2_Name: 'Player 2', Player1_Score: 4, Player2_Score: 2, Status: 'R' as const, Date_Time: undefined },
      { ID: 2, Event_ID: 1, Round_ID: 1, Match_Number: 2, Player1_ID: 1, Player1_Name: 'Player 1', Player2_ID: 2, Player2_Name: 'Player 2', Player1_Score: 3, Player2_Score: 4, Status: 'R' as const, Date_Time: undefined }
    ];
    
    const trends = calculateH2HTrends(matchesWithoutDates, 1, 2);
    expect(trends).toEqual([]);
  });
});