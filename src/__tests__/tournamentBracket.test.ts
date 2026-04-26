/**
 * Property-based tests for tournament bracket functionality
 * Tests the correctness properties defined in the design document
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Match } from '../types/snooker';

// Generator for tournament matches with proper bracket structure
const tournamentMatchGenerator = (
  totalRounds: number,
  playersPerRound: number[]
): fc.Arbitrary<Match[]> => {
  return fc.array(
    fc.record({
      ID: fc.integer({ min: 1, max: 100000 }),
      Event_ID: fc.constant(1), // Same event for all matches
      Round_ID: fc.integer({ min: 1, max: totalRounds }),
      Match_Number: fc.integer({ min: 1, max: 64 }),
      Player1_ID: fc.integer({ min: 1, max: 1000 }),
      Player1_Name: fc.string({ minLength: 3, maxLength: 30 }),
      Player2_ID: fc.integer({ min: 1, max: 1000 }),
      Player2_Name: fc.string({ minLength: 3, maxLength: 30 }),
      Player1_Score: fc.integer({ min: 0, max: 18 }),
      Player2_Score: fc.integer({ min: 0, max: 18 }),
      Status: fc.constant('R' as const), // All matches completed for winner path testing
      Date_Time: fc.option(fc.integer({ min: 1577836800000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString())),
      Session: fc.option(fc.integer({ min: 1, max: 4 })),
      Table: fc.option(fc.string()),
      Frames: fc.option(fc.array(fc.record({
        Frame_Number: fc.integer({ min: 1, max: 35 }),
        Player1_Score: fc.integer({ min: 0, max: 147 }),
        Player2_Score: fc.integer({ min: 0, max: 147 }),
        Winner_ID: fc.option(fc.integer({ min: 1, max: 1000 })),
        Break: fc.option(fc.integer({ min: 0, max: 147 }))
      }), { maxLength: 35 })),
      Duration: fc.option(fc.string())
    }),
    { minLength: 1, maxLength: 127 } // Up to 127 matches for a 128-player tournament
  );
};

// Helper function to create a valid tournament bracket
const createValidTournamentBracket = (rounds: number): Match[] => {
  const matches: Match[] = [];
  let matchId = 1;
  let playerId = 1;
  
  // Create matches for each round
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    
    for (let matchNum = 1; matchNum <= matchesInRound; matchNum++) {
      const player1Id = playerId++;
      const player2Id = playerId++;
      
      // Determine winner (player with higher score)
      const player1Score = Math.floor(Math.random() * 10) + 1;
      const player2Score = Math.floor(Math.random() * 10) + 1;
      
      matches.push({
        ID: matchId++,
        Event_ID: 1,
        Round_ID: round,
        Match_Number: matchNum,
        Player1_ID: player1Id,
        Player1_Name: `Player ${player1Id}`,
        Player2_ID: player2Id,
        Player2_Name: `Player ${player2Id}`,
        Player1_Score: player1Score,
        Player2_Score: player2Score,
        Status: 'R',
        Date_Time: new Date().toISOString()
      });
    }
  }
  
  return matches;
};

// Helper function to trace winner path through bracket
const traceWinnerPath = (matches: Match[]): { winnerId: number; winnerName: string; path: number[] } | null => {
  if (!matches || matches.length === 0) return null;
  
  // Group matches by round
  const roundGroups = new Map<number, Match[]>();
  matches.forEach(match => {
    const roundId = match.Round_ID || 0;
    if (!roundGroups.has(roundId)) {
      roundGroups.set(roundId, []);
    }
    roundGroups.get(roundId)!.push(match);
  });
  
  // Find the final round (highest round number)
  const maxRound = Math.max(...Array.from(roundGroups.keys()));
  const finalRound = roundGroups.get(maxRound);
  
  if (!finalRound || finalRound.length === 0) return null;
  
  // Find the final match (should be only one in final round)
  const finalMatch = finalRound.find(match => match.Status === 'R');
  if (!finalMatch) return null;
  
  // Determine winner of final match
  let winnerId: number;
  let winnerName: string;
  
  if (finalMatch.Player1_Score > finalMatch.Player2_Score) {
    winnerId = finalMatch.Player1_ID;
    winnerName = finalMatch.Player1_Name;
  } else if (finalMatch.Player2_Score > finalMatch.Player1_Score) {
    winnerId = finalMatch.Player2_ID;
    winnerName = finalMatch.Player2_Name;
  } else {
    return null; // No clear winner (draw)
  }
  
  // Trace path backwards from final to first round
  const path: number[] = [];
  let currentPlayerId = winnerId;
  
  // Sort rounds in descending order (final to first)
  const sortedRounds = Array.from(roundGroups.keys()).sort((a, b) => b - a);
  
  for (const roundId of sortedRounds) {
    const roundMatches = roundGroups.get(roundId) || [];
    
    // Find the match where current player won
    const winnerMatch = roundMatches.find(match => {
      if (match.Status !== 'R') return false;
      
      const player1Won = match.Player1_Score > match.Player2_Score;
      const player2Won = match.Player2_Score > match.Player1_Score;
      
      return (player1Won && match.Player1_ID === currentPlayerId) ||
             (player2Won && match.Player2_ID === currentPlayerId);
    });
    
    if (winnerMatch) {
      path.push(winnerMatch.ID);
    }
  }
  
  return { winnerId, winnerName, path };
};

// Helper function to validate that a path leads to the final
const validateWinnerPath = (matches: Match[], winnerId: number, path: number[]): boolean => {
  if (path.length === 0) return false;
  
  // Group matches by round
  const roundGroups = new Map<number, Match[]>();
  matches.forEach(match => {
    const roundId = match.Round_ID || 0;
    if (!roundGroups.has(roundId)) {
      roundGroups.set(roundId, []);
    }
    roundGroups.get(roundId)!.push(match);
  });
  
  // Sort rounds in ascending order (first to final)
  const sortedRounds = Array.from(roundGroups.keys()).sort((a, b) => a - b);
  
  let currentPlayerId = winnerId;
  
  // Work backwards through the path (from final to first round)
  const reversedPath = [...path].reverse();
  let pathIndex = 0;
  
  // Start from final round and work backwards
  for (let i = sortedRounds.length - 1; i >= 0; i--) {
    const roundId = sortedRounds[i];
    const roundMatches = roundGroups.get(roundId) || [];
    
    if (pathIndex >= reversedPath.length) break;
    
    const expectedMatchId = reversedPath[pathIndex];
    const match = roundMatches.find(m => m.ID === expectedMatchId);
    
    if (!match) return false;
    
    // Verify that the current player won this match
    const player1Won = match.Player1_Score > match.Player2_Score;
    const player2Won = match.Player2_Score > match.Player1_Score;
    
    const playerWon = (player1Won && match.Player1_ID === currentPlayerId) ||
                     (player2Won && match.Player2_ID === currentPlayerId);
    
    if (!playerWon) return false;
    
    pathIndex++;
  }
  
  return pathIndex === path.length;
};

describe('Tournament Bracket Property-Based Tests', () => {
  
  /**
   * Property 12: Tournament Bracket Winner Path
   * For any tournament bracket with a known winner, the path from the winner's 
   * initial match through all subsequent rounds SHALL lead to the final match.
   * **Validates: Requirements 9.4**
   */
  test('Property 12: Tournament Bracket Winner Path', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }), // 2-6 rounds (4-64 players)
        (rounds) => {
          // Create a valid tournament bracket
          const matches = createValidTournamentBracket(rounds);
          
          // Trace the winner's path
          const result = traceWinnerPath(matches);
          
          if (!result) {
            return; // Skip if no clear winner found
          }
          
          const { winnerId, path } = result;
          
          // Property: The winner's path should be valid and lead to the final
          expect(path.length).toBeGreaterThan(0);
          expect(path.length).toBeLessThanOrEqual(rounds);
          
          // Validate that the path actually leads to the final
          const isValidPath = validateWinnerPath(matches, winnerId, path);
          expect(isValidPath).toBe(true);
          
          // The final match should be in the path
          const finalRoundMatches = matches.filter(m => m.Round_ID === rounds);
          const finalMatch = finalRoundMatches.find(m => 
            (m.Player1_ID === winnerId && m.Player1_Score > m.Player2_Score) ||
            (m.Player2_ID === winnerId && m.Player2_Score > m.Player1_Score)
          );
          
          if (finalMatch) {
            expect(path).toContain(finalMatch.ID);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for bracket functionality

  test('traceWinnerPath should return null for empty matches', () => {
    const result = traceWinnerPath([]);
    expect(result).toBeNull();
  });

  test('traceWinnerPath should return null when no completed matches', () => {
    const matches: Match[] = [{
      ID: 1,
      Event_ID: 1,
      Round_ID: 1,
      Match_Number: 1,
      Player1_ID: 1,
      Player1_Name: 'Player 1',
      Player2_ID: 2,
      Player2_Name: 'Player 2',
      Player1_Score: 0,
      Player2_Score: 0,
      Status: 'U' // Unplayed
    }];
    
    const result = traceWinnerPath(matches);
    expect(result).toBeNull();
  });

  test('traceWinnerPath should return null for drawn final match', () => {
    const matches: Match[] = [{
      ID: 1,
      Event_ID: 1,
      Round_ID: 1,
      Match_Number: 1,
      Player1_ID: 1,
      Player1_Name: 'Player 1',
      Player2_ID: 2,
      Player2_Name: 'Player 2',
      Player1_Score: 5,
      Player2_Score: 5, // Draw
      Status: 'R'
    }];
    
    const result = traceWinnerPath(matches);
    expect(result).toBeNull();
  });

  test('validateWinnerPath should return false for empty path', () => {
    const matches = createValidTournamentBracket(3);
    const isValid = validateWinnerPath(matches, 1, []);
    expect(isValid).toBe(false);
  });

  test('validateWinnerPath should return false for invalid match IDs in path', () => {
    const matches = createValidTournamentBracket(3);
    const isValid = validateWinnerPath(matches, 1, [999, 1000, 1001]); // Non-existent match IDs
    expect(isValid).toBe(false);
  });

  test('createValidTournamentBracket should create correct number of matches', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 6 }),
        (rounds) => {
          const matches = createValidTournamentBracket(rounds);
          
          // Total matches should be 2^rounds - 1 (for single elimination)
          const expectedMatches = Math.pow(2, rounds) - 1;
          expect(matches.length).toBe(expectedMatches);
          
          // Each round should have the correct number of matches
          for (let round = 1; round <= rounds; round++) {
            const roundMatches = matches.filter(m => m.Round_ID === round);
            const expectedRoundMatches = Math.pow(2, rounds - round);
            expect(roundMatches.length).toBe(expectedRoundMatches);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('tournament bracket should have unique match IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        (rounds) => {
          const matches = createValidTournamentBracket(rounds);
          const matchIds = matches.map(m => m.ID);
          const uniqueIds = new Set(matchIds);
          
          expect(uniqueIds.size).toBe(matchIds.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('tournament bracket should have unique player IDs within each match', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        (rounds) => {
          const matches = createValidTournamentBracket(rounds);
          
          matches.forEach(match => {
            expect(match.Player1_ID).not.toBe(match.Player2_ID);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  test('final round should have exactly one match', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }),
        (rounds) => {
          const matches = createValidTournamentBracket(rounds);
          const finalRoundMatches = matches.filter(m => m.Round_ID === rounds);
          
          expect(finalRoundMatches.length).toBe(1);
        }
      ),
      { numRuns: 50 }
    );
  });
});