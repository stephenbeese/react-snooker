/**
 * Property-based tests for performance utility functions
 * Tests the correctness properties defined in the design document
 * Feature: snooker-results-app, Property 11: Pressure Situation Performance
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculatePressurePerformance,
  isDecidingFrame,
  isComebackMatch,
  getPressureSituationsByType,
  getPressurePerformanceSummary,
} from '../utils/performanceUtils';
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

// Generator for completed matches with frame data
const completedMatchGenerator = (): fc.Arbitrary<Match> =>
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
    Status: fc.constant('R' as const), // Only completed matches
    Date_Time: fc.option(fc.integer({ min: 1577836800000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString())),
    Session: fc.option(fc.integer({ min: 1, max: 4 })),
    Table: fc.option(fc.string()),
    Frames: fc.option(fc.array(frameGenerator(), { minLength: 1, maxLength: 35 })),
    Duration: fc.option(fc.string())
  });

// Generator for matches with consistent frame data (frames match the final scores)
const consistentMatchGenerator = (): fc.Arbitrary<Match> =>
  fc.integer({ min: 1, max: 17 }).chain(player1Score =>
    fc.integer({ min: 1, max: 17 }).chain(player2Score => {
      const totalFrames = player1Score + player2Score;
      
      return fc.record({
        ID: fc.integer({ min: 1, max: 100000 }),
        Event_ID: fc.integer({ min: 1, max: 1000 }),
        Round_ID: fc.integer({ min: 1, max: 100 }),
        Match_Number: fc.integer({ min: 1, max: 64 }),
        Player1_ID: fc.integer({ min: 1, max: 10000 }),
        Player1_Name: fc.string({ minLength: 1, maxLength: 50 }),
        Player2_ID: fc.integer({ min: 1, max: 10000 }),
        Player2_Name: fc.string({ minLength: 1, maxLength: 50 }),
        Player1_Score: fc.constant(player1Score),
        Player2_Score: fc.constant(player2Score),
        Status: fc.constant('R' as const),
        Date_Time: fc.option(fc.string()),
        Session: fc.option(fc.integer({ min: 1, max: 4 })),
        Table: fc.option(fc.string()),
        Frames: fc.constant(generateConsistentFrames(player1Score, player2Score, totalFrames)),
        Duration: fc.option(fc.string())
      });
    })
  );

// Helper function to generate frames that match the final scores
function generateConsistentFrames(player1Score: number, player2Score: number, totalFrames: number): Frame[] {
  const frames: Frame[] = [];
  let p1Wins = 0;
  let p2Wins = 0;
  
  for (let i = 1; i <= totalFrames; i++) {
    let winnerId: number;
    
    // Determine winner based on remaining frames needed
    const p1Remaining = player1Score - p1Wins;
    const p2Remaining = player2Score - p2Wins;
    const framesLeft = totalFrames - i + 1;
    
    if (p1Remaining === framesLeft) {
      // Player 1 must win all remaining frames
      winnerId = 1; // We'll use 1 and 2 as placeholder IDs
      p1Wins++;
    } else if (p2Remaining === framesLeft) {
      // Player 2 must win all remaining frames
      winnerId = 2;
      p2Wins++;
    } else {
      // Random assignment, but ensure we don't exceed target scores
      if (p1Wins < player1Score && p2Wins < player2Score) {
        winnerId = Math.random() < 0.5 ? 1 : 2;
        if (winnerId === 1) p1Wins++;
        else p2Wins++;
      } else if (p1Wins < player1Score) {
        winnerId = 1;
        p1Wins++;
      } else {
        winnerId = 2;
        p2Wins++;
      }
    }
    
    frames.push({
      Frame_Number: i,
      Player1_Score: Math.floor(Math.random() * 100),
      Player2_Score: Math.floor(Math.random() * 100),
      Winner_ID: winnerId,
      Break: Math.random() < 0.3 ? Math.floor(Math.random() * 147) : undefined
    });
  }
  
  return frames;
}

describe('Performance Utils Property-Based Tests', () => {
  
  /**
   * Property 11: Pressure Situation Performance
   * For any set of matches, the pressure situation performance (deciding frames and matches when behind) 
   * SHALL be correctly identified and calculated based on frame scores and match state.
   * **Validates: Requirements 8.3**
   */
  test('Property 11: Pressure Situation Performance', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }), // Player ID
        fc.array(completedMatchGenerator(), { minLength: 1, maxLength: 20 }),
        (playerId, matches) => {
          // Ensure the player appears in at least some matches
          const playerMatches = matches.map((match, index) => {
            // Assign the test player to either player1 or player2 position
            if (index % 2 === 0) {
              return { ...match, Player1_ID: playerId };
            } else {
              return { ...match, Player2_ID: playerId };
            }
          });
          
          const performance = calculatePressurePerformance(playerMatches, playerId);
          
          // Basic properties
          expect(performance.playerId).toBe(playerId);
          expect(performance.totalPressureSituations).toBeGreaterThanOrEqual(0);
          expect(performance.pressureSituationsWon).toBeGreaterThanOrEqual(0);
          expect(performance.pressureWinPercentage).toBeGreaterThanOrEqual(0);
          expect(performance.pressureWinPercentage).toBeLessThanOrEqual(100);
          
          // Deciding frames properties
          expect(performance.decidingFrames.total).toBeGreaterThanOrEqual(0);
          expect(performance.decidingFrames.won).toBeGreaterThanOrEqual(0);
          expect(performance.decidingFrames.won).toBeLessThanOrEqual(performance.decidingFrames.total);
          expect(performance.decidingFrames.winPercentage).toBeGreaterThanOrEqual(0);
          expect(performance.decidingFrames.winPercentage).toBeLessThanOrEqual(100);
          
          // Comeback matches properties
          expect(performance.comebackMatches.total).toBeGreaterThanOrEqual(0);
          expect(performance.comebackMatches.won).toBeGreaterThanOrEqual(0);
          expect(performance.comebackMatches.won).toBeLessThanOrEqual(performance.comebackMatches.total);
          expect(performance.comebackMatches.winPercentage).toBeGreaterThanOrEqual(0);
          expect(performance.comebackMatches.winPercentage).toBeLessThanOrEqual(100);
          
          // Total should equal sum of components
          expect(performance.totalPressureSituations).toBe(
            performance.decidingFrames.total + performance.comebackMatches.total
          );
          expect(performance.pressureSituationsWon).toBe(
            performance.decidingFrames.won + performance.comebackMatches.won
          );
          
          // Situations array should match totals
          expect(performance.situations.length).toBe(performance.totalPressureSituations);
          
          const decidingSituations = performance.situations.filter(s => s.type === 'deciding_frame');
          const comebackSituations = performance.situations.filter(s => s.type === 'comeback_match');
          
          expect(decidingSituations.length).toBe(performance.decidingFrames.total);
          expect(comebackSituations.length).toBe(performance.comebackMatches.total);
          
          // Win percentage calculations should be correct
          if (performance.totalPressureSituations > 0) {
            const expectedWinPercentage = Math.round(
              (performance.pressureSituationsWon / performance.totalPressureSituations) * 100
            );
            expect(performance.pressureWinPercentage).toBe(expectedWinPercentage);
          } else {
            expect(performance.pressureWinPercentage).toBe(0);
          }
          
          if (performance.decidingFrames.total > 0) {
            const expectedDecidingPercentage = Math.round(
              (performance.decidingFrames.won / performance.decidingFrames.total) * 100
            );
            expect(performance.decidingFrames.winPercentage).toBe(expectedDecidingPercentage);
          } else {
            expect(performance.decidingFrames.winPercentage).toBe(0);
          }
          
          if (performance.comebackMatches.total > 0) {
            const expectedComebackPercentage = Math.round(
              (performance.comebackMatches.won / performance.comebackMatches.total) * 100
            );
            expect(performance.comebackMatches.winPercentage).toBe(expectedComebackPercentage);
          } else {
            expect(performance.comebackMatches.winPercentage).toBe(0);
          }
          
          // All situations should have valid match IDs
          performance.situations.forEach(situation => {
            expect(situation.matchId).toBeGreaterThan(0);
            expect(typeof situation.playerWon).toBe('boolean');
            expect(typeof situation.description).toBe('string');
            expect(situation.description.length).toBeGreaterThan(0);
            
            if (situation.type === 'deciding_frame') {
              expect(situation.frameNumber).toBeGreaterThan(0);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for specific functions

  test('isDecidingFrame should correctly identify deciding frames', () => {
    fc.assert(
      fc.property(
        consistentMatchGenerator(),
        (match) => {
          if (!match.Frames || match.Frames.length === 0) {
            return; // Skip matches without frames
          }
          
          const maxFrameNumber = Math.max(...match.Frames.map(f => f.Frame_Number));
          const scoreDifference = Math.abs(match.Player1_Score - match.Player2_Score);
          
          // Test the final frame
          const isDeciding = isDecidingFrame(match, maxFrameNumber);
          
          // Should be deciding if the match was close (score difference <= 1)
          if (scoreDifference <= 1) {
            expect(isDeciding).toBe(true);
          }
          
          // Non-final frames should not be deciding
          if (match.Frames.length > 1) {
            const nonFinalFrame = match.Frames.find(f => f.Frame_Number < maxFrameNumber);
            if (nonFinalFrame) {
              expect(isDecidingFrame(match, nonFinalFrame.Frame_Number)).toBe(false);
            }
          }
        }
      )
    );
  });

  test('isComebackMatch should only return true for matches where player won after being behind', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        consistentMatchGenerator(),
        (playerId, match) => {
          // Assign player to the match
          const testMatch = { ...match, Player1_ID: playerId };
          
          const isComeback = isComebackMatch(testMatch, playerId);
          
          if (isComeback) {
            // If it's a comeback, player must have won the match
            expect(testMatch.Player1_Score).toBeGreaterThan(testMatch.Player2_Score);
          }
          
          // If player lost, it can't be a comeback
          if (testMatch.Player1_Score <= testMatch.Player2_Score) {
            expect(isComeback).toBe(false);
          }
        }
      )
    );
  });

  test('calculatePressurePerformance should return zero stats for empty matches', () => {
    const performance = calculatePressurePerformance([], 123);
    
    expect(performance.playerId).toBe(123);
    expect(performance.totalPressureSituations).toBe(0);
    expect(performance.pressureSituationsWon).toBe(0);
    expect(performance.pressureWinPercentage).toBe(0);
    expect(performance.decidingFrames.total).toBe(0);
    expect(performance.decidingFrames.won).toBe(0);
    expect(performance.decidingFrames.winPercentage).toBe(0);
    expect(performance.comebackMatches.total).toBe(0);
    expect(performance.comebackMatches.won).toBe(0);
    expect(performance.comebackMatches.winPercentage).toBe(0);
    expect(performance.situations).toEqual([]);
  });

  test('calculatePressurePerformance should ignore matches where player is not involved', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.array(completedMatchGenerator(), { minLength: 1, maxLength: 10 }),
        (playerId, matches) => {
          // Ensure player is not in any match
          const nonPlayerMatches = matches.map(match => ({
            ...match,
            Player1_ID: playerId + 1000,
            Player2_ID: playerId + 2000
          }));
          
          const performance = calculatePressurePerformance(nonPlayerMatches, playerId);
          
          expect(performance.totalPressureSituations).toBe(0);
          expect(performance.situations).toEqual([]);
        }
      )
    );
  });

  test('getPressureSituationsByType should filter situations correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.array(completedMatchGenerator(), { minLength: 1, maxLength: 10 }),
        (playerId, matches) => {
          const playerMatches = matches.map(match => ({ ...match, Player1_ID: playerId }));
          const performance = calculatePressurePerformance(playerMatches, playerId);
          
          const decidingSituations = getPressureSituationsByType(performance, 'deciding_frame');
          const comebackSituations = getPressureSituationsByType(performance, 'comeback_match');
          
          // All deciding situations should have type 'deciding_frame'
          decidingSituations.forEach(situation => {
            expect(situation.type).toBe('deciding_frame');
            expect(situation.frameNumber).toBeDefined();
          });
          
          // All comeback situations should have type 'comeback_match'
          comebackSituations.forEach(situation => {
            expect(situation.type).toBe('comeback_match');
            expect(situation.frameNumber).toBeUndefined();
          });
          
          // Counts should match performance stats
          expect(decidingSituations.length).toBe(performance.decidingFrames.total);
          expect(comebackSituations.length).toBe(performance.comebackMatches.total);
        }
      )
    );
  });

  test('getPressurePerformanceSummary should return appropriate messages', () => {
    // Test empty performance
    const emptyPerformance = calculatePressurePerformance([], 123);
    const emptySummary = getPressurePerformanceSummary(emptyPerformance);
    expect(emptySummary).toBe('No pressure situations recorded');
    
    // Test with generated data
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.array(completedMatchGenerator(), { minLength: 1, maxLength: 5 }),
        (playerId, matches) => {
          const playerMatches = matches.map(match => ({ ...match, Player1_ID: playerId }));
          const performance = calculatePressurePerformance(playerMatches, playerId);
          const summary = getPressurePerformanceSummary(performance);
          
          expect(typeof summary).toBe('string');
          expect(summary.length).toBeGreaterThan(0);
          
          if (performance.totalPressureSituations === 0) {
            expect(summary).toBe('No pressure situations recorded');
          } else {
            expect(summary).toContain('Overall pressure performance');
            expect(summary).toContain(`${performance.pressureWinPercentage}%`);
          }
        }
      )
    );
  });

  test('isDecidingFrame should return false for non-completed matches', () => {
    fc.assert(
      fc.property(
        completedMatchGenerator(),
        fc.integer({ min: 1, max: 35 }),
        (match, frameNumber) => {
          // Test with unplayed match
          const unplayedMatch = { ...match, Status: 'U' as const };
          expect(isDecidingFrame(unplayedMatch, frameNumber)).toBe(false);
          
          // Test with abandoned match
          const abandonedMatch = { ...match, Status: 'A' as const };
          expect(isDecidingFrame(abandonedMatch, frameNumber)).toBe(false);
        }
      )
    );
  });

  test('isDecidingFrame should return false for matches without frames', () => {
    fc.assert(
      fc.property(
        completedMatchGenerator(),
        fc.integer({ min: 1, max: 35 }),
        (match, frameNumber) => {
          const matchWithoutFrames = { ...match, Frames: undefined };
          expect(isDecidingFrame(matchWithoutFrames, frameNumber)).toBe(false);
          
          const matchWithEmptyFrames = { ...match, Frames: [] };
          expect(isDecidingFrame(matchWithEmptyFrames, frameNumber)).toBe(false);
        }
      )
    );
  });

  test('isComebackMatch should return false for non-completed matches', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        completedMatchGenerator(),
        (playerId, match) => {
          const playerMatch = { ...match, Player1_ID: playerId };
          
          // Test with unplayed match
          const unplayedMatch = { ...playerMatch, Status: 'U' as const };
          expect(isComebackMatch(unplayedMatch, playerId)).toBe(false);
          
          // Test with abandoned match
          const abandonedMatch = { ...playerMatch, Status: 'A' as const };
          expect(isComebackMatch(abandonedMatch, playerId)).toBe(false);
        }
      )
    );
  });
});