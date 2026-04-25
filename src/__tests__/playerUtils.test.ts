/**
 * Property-based tests for player utility functions
 * Tests the correctness properties defined in the design document
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  filterPlayersByNationality,
  filterPlayersByRanking,
  calculateFrameWinPercentage,
  calculatePlayerForm,
  filterPlayers,
} from '../utils/playerUtils';
import type { PlayerFilterCriteria } from '../utils/playerUtils';
import type { Player, PlayerProfile, Match, Frame } from '../types/snooker';

// Generators for test data
const playerGenerator = (): fc.Arbitrary<Player> => 
  fc.record({
    ID: fc.integer({ min: 1, max: 10000 }),
    Name: fc.string({ minLength: 1, maxLength: 50 }),
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
    Born: fc.option(fc.integer({ min: 1950, max: 2005 })),
    Turned_Pro: fc.option(fc.integer({ min: 1970, max: 2023 })),
    Status: fc.oneof(fc.constant('P' as const), fc.constant('A' as const)),
    Image_Url: fc.option(fc.webUrl())
  });

const playerProfileGenerator = (): fc.Arbitrary<PlayerProfile> =>
  fc.record({
    ID: fc.integer({ min: 1, max: 10000 }),
    Name: fc.string({ minLength: 1, maxLength: 50 }),
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
    Born: fc.option(fc.integer({ min: 1950, max: 2005 })),
    Turned_Pro: fc.option(fc.integer({ min: 1970, max: 2023 })),
    Status: fc.oneof(fc.constant('P' as const), fc.constant('A' as const)),
    Image_Url: fc.option(fc.webUrl()),
    Ranking: fc.option(fc.integer({ min: 1, max: 128 })),
    Ranking_Points: fc.option(fc.integer({ min: 0, max: 1000000 })),
    Money_Ranking: fc.option(fc.integer({ min: 1, max: 128 })),
    Money_Ranking_Points: fc.option(fc.integer({ min: 0, max: 5000000 })),
    Frame_Win_Percentage: fc.option(fc.integer({ min: 0, max: 100 }))
  });

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
    Date_Time: fc.option(fc.string()),
    Session: fc.option(fc.integer({ min: 1, max: 4 })),
    Table: fc.option(fc.string()),
    Frames: fc.option(fc.array(frameGenerator(), { maxLength: 35 })),
    Duration: fc.option(fc.string())
  });

describe('Player Utils Property-Based Tests', () => {
  
  /**
   * Property 1: Player Filtering Correctness
   * For any list of players and any filter criteria (nationality, ranking range, season), 
   * all returned players SHALL match the specified filter criteria.
   * **Validates: Requirements 1.3**
   */
  test('Property 1: Player Filtering Correctness', () => {
    fc.assert(
      fc.property(
        fc.array(playerGenerator(), { maxLength: 100 }),
        fc.record({
          nationality: fc.option(fc.oneof(
            fc.constant('England'),
            fc.constant('Scotland'),
            fc.constant('Wales'),
            fc.constant('China')
          ), { nil: undefined }),
          minRanking: fc.option(fc.integer({ min: 1, max: 64 }), { nil: undefined }),
          maxRanking: fc.option(fc.integer({ min: 65, max: 128 }), { nil: undefined }),
          season: fc.option(fc.integer({ min: 2020, max: 2024 }), { nil: undefined }),
          status: fc.option(fc.oneof(fc.constant('P' as const), fc.constant('A' as const)), { nil: undefined })
        }),
        (players, filtersRaw) => {
          // Convert null values to undefined for proper typing
          const filters: PlayerFilterCriteria = {
            nationality: filtersRaw.nationality ?? undefined,
            minRanking: filtersRaw.minRanking ?? undefined,
            maxRanking: filtersRaw.maxRanking ?? undefined,
            season: filtersRaw.season ?? undefined,
            status: filtersRaw.status ?? undefined
          };
          
          const filtered = filterPlayers(players, filters);
          
          // All returned players must match filter criteria
          filtered.forEach(player => {
            // Check nationality filter
            if (filters.nationality) {
              expect(player.Nationality).toBe(filters.nationality);
            }
            
            // Check status filter
            if (filters.status) {
              expect(player.Status).toBe(filters.status);
            }
            
            // Check ranking filters (only for PlayerProfile objects with ranking)
            if ((filters.minRanking !== undefined || filters.maxRanking !== undefined)) {
              const profilePlayer = player as PlayerProfile;
              if (profilePlayer.Ranking && profilePlayer.Ranking > 0) {
                if (filters.minRanking !== undefined) {
                  expect(profilePlayer.Ranking).toBeGreaterThanOrEqual(filters.minRanking);
                }
                if (filters.maxRanking !== undefined) {
                  expect(profilePlayer.Ranking).toBeLessThanOrEqual(filters.maxRanking);
                }
              }
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Frame Win Percentage Calculation
   * For any set of matches with frame data, the calculated frame win percentage 
   * SHALL equal (frames won / total frames played) × 100, rounded to nearest integer.
   * **Validates: Requirements 1.5, 8.2**
   */
  test('Property 2: Frame Win Percentage Calculation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }), // Player ID
        fc.array(matchGenerator(), { minLength: 1, maxLength: 20 }),
        (playerId, matches) => {
          // Ensure the player appears in at least some matches
          const playerMatches = matches.map(match => {
            // Randomly assign the test player to either player1 or player2 position
            if (Math.random() < 0.5) {
              return { ...match, Player1_ID: playerId };
            } else {
              return { ...match, Player2_ID: playerId };
            }
          });
          
          const percentage = calculateFrameWinPercentage(playerMatches, playerId);
          
          // Property: Percentage should be between 0 and 100
          expect(percentage).toBeGreaterThanOrEqual(0);
          expect(percentage).toBeLessThanOrEqual(100);
          expect(Number.isInteger(percentage)).toBe(true);
          
          // Manual calculation to verify correctness
          let totalFrames = 0;
          let framesWon = 0;
          
          playerMatches.forEach(match => {
            const isPlayer1 = match.Player1_ID === playerId;
            const isPlayer2 = match.Player2_ID === playerId;
            
            if (isPlayer1 || isPlayer2) {
              if (match.Frames && match.Frames.length > 0) {
                // Use frame-by-frame data
                match.Frames.forEach(frame => {
                  totalFrames++;
                  if (frame.Winner_ID === playerId) {
                    framesWon++;
                  }
                });
              } else {
                // Use match scores
                const playerScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
                const opponentScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
                
                totalFrames += playerScore + opponentScore;
                framesWon += playerScore;
              }
            }
          });
          
          const expectedPercentage = totalFrames > 0 ? Math.round((framesWon / totalFrames) * 100) : 0;
          expect(percentage).toBe(expectedPercentage);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for specific functions

  test('filterPlayersByNationality should return all players when nationality is empty', () => {
    fc.assert(
      fc.property(
        fc.array(playerGenerator()),
        (players) => {
          const filtered = filterPlayersByNationality(players, '');
          expect(filtered).toEqual(players);
        }
      )
    );
  });

  test('filterPlayersByNationality should be case insensitive', () => {
    fc.assert(
      fc.property(
        fc.array(playerGenerator()),
        fc.string({ minLength: 1 }),
        (players, nationality) => {
          const lowerFiltered = filterPlayersByNationality(players, nationality.toLowerCase());
          const upperFiltered = filterPlayersByNationality(players, nationality.toUpperCase());
          const mixedFiltered = filterPlayersByNationality(players, nationality);
          
          // All should return the same results
          expect(lowerFiltered).toEqual(upperFiltered);
          expect(lowerFiltered).toEqual(mixedFiltered);
        }
      )
    );
  });

  test('filterPlayersByRanking should exclude players without ranking', () => {
    fc.assert(
      fc.property(
        fc.array(playerProfileGenerator()),
        fc.integer({ min: 1, max: 64 }),
        fc.integer({ min: 65, max: 128 }),
        (players, minRanking, maxRanking) => {
          const filtered = filterPlayersByRanking(players, minRanking, maxRanking);
          
          filtered.forEach(player => {
            expect(player.Ranking).toBeDefined();
            expect(player.Ranking).toBeGreaterThan(0);
          });
        }
      )
    );
  });

  test('calculateFrameWinPercentage should return 0 for empty matches array', () => {
    const percentage = calculateFrameWinPercentage([], 123);
    expect(percentage).toBe(0);
  });

  test('calculatePlayerForm should handle empty matches array', () => {
    const form = calculatePlayerForm([], 123);
    expect(form.playerId).toBe(123);
    expect(form.wins).toBe(0);
    expect(form.losses).toBe(0);
    expect(form.winPercentage).toBe(0);
    expect(form.lastMatches).toEqual([]);
  });

  test('calculatePlayerForm should limit to specified match count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.array(matchGenerator(), { minLength: 15, maxLength: 30 }),
        fc.integer({ min: 5, max: 10 }),
        (playerId, matches, matchCount) => {
          // Ensure player appears in matches
          const playerMatches = matches.map(match => ({ ...match, Player1_ID: playerId }));
          
          const form = calculatePlayerForm(playerMatches, playerId, matchCount);
          
          expect(form.lastMatches.length).toBeLessThanOrEqual(matchCount);
          expect(form.lastMatches.length).toBeLessThanOrEqual(playerMatches.length);
        }
      )
    );
  });
});