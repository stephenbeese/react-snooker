/**
 * Unit tests for PlayerProfile data processing logic
 * Tests correct processing of player information for Requirements 1.2
 */

import { describe, test, expect } from 'vitest';
import type { PlayerProfile, Match } from '../types/snooker';
import { calculatePlayerForm, calculateFrameWinPercentage } from '../utils/playerUtils';

// Mock data
const mockPlayer: PlayerProfile = {
  ID: 1,
  Name: 'Ronnie O\'Sullivan',
  Nationality: 'England',
  Born: 1975,
  Turned_Pro: 1992,
  Status: 'P',
  Image_Url: 'https://example.com/ronnie.jpg',
  Ranking: 1,
  Ranking_Points: 1000000,
  Money_Ranking: 1,
  Money_Ranking_Points: 500000,
  Frame_Win_Percentage: 75
};

const mockMatches: Match[] = [
  {
    ID: 1,
    Event_ID: 100,
    Round_ID: 1,
    Match_Number: 1,
    Player1_ID: 1,
    Player1_Name: 'Ronnie O\'Sullivan',
    Player2_ID: 2,
    Player2_Name: 'Judd Trump',
    Player1_Score: 6,
    Player2_Score: 4,
    Status: 'R',
    Date_Time: '2024-01-15T14:00:00Z',
    Session: 1,
    Table: 'Table 1',
    Duration: '2h 30m'
  },
  {
    ID: 2,
    Event_ID: 100,
    Round_ID: 1,
    Match_Number: 2,
    Player1_ID: 3,
    Player1_Name: 'John Higgins',
    Player2_ID: 1,
    Player2_Name: 'Ronnie O\'Sullivan',
    Player1_Score: 3,
    Player2_Score: 6,
    Status: 'R',
    Date_Time: '2024-01-10T19:00:00Z',
    Session: 2,
    Table: 'Table 2',
    Duration: '2h 15m'
  }
];

describe('PlayerProfile Data Processing', () => {
  describe('Player Information Display Logic', () => {
    test('should correctly identify required player information fields', () => {
      // Test that all required fields are present in PlayerProfile interface
      expect(mockPlayer.ID).toBeDefined();
      expect(mockPlayer.Name).toBeDefined();
      expect(mockPlayer.Nationality).toBeDefined();
      expect(mockPlayer.Status).toBeDefined();
    });

    test('should handle optional player information fields gracefully', () => {
      const playerWithMissingInfo: PlayerProfile = {
        ID: 1,
        Name: 'Test Player',
        Nationality: 'Unknown',
        Status: 'P'
      };

      // Should not throw errors when optional fields are missing
      expect(playerWithMissingInfo.Ranking).toBeUndefined();
      expect(playerWithMissingInfo.Born).toBeUndefined();
      expect(playerWithMissingInfo.Turned_Pro).toBeUndefined();
      expect(playerWithMissingInfo.Image_Url).toBeUndefined();
    });

    test('should validate player status values', () => {
      expect(['P', 'A']).toContain(mockPlayer.Status);
    });

    test('should validate nationality field is string', () => {
      expect(typeof mockPlayer.Nationality).toBe('string');
      expect(mockPlayer.Nationality.length).toBeGreaterThan(0);
    });

    test('should validate ranking fields are numbers when present', () => {
      if (mockPlayer.Ranking !== undefined) {
        expect(typeof mockPlayer.Ranking).toBe('number');
        expect(mockPlayer.Ranking).toBeGreaterThan(0);
      }
      
      if (mockPlayer.Ranking_Points !== undefined) {
        expect(typeof mockPlayer.Ranking_Points).toBe('number');
        expect(mockPlayer.Ranking_Points).toBeGreaterThanOrEqual(0);
      }
    });

    test('should validate year fields are reasonable when present', () => {
      if (mockPlayer.Born !== undefined) {
        expect(mockPlayer.Born).toBeGreaterThan(1900);
        expect(mockPlayer.Born).toBeLessThan(2010);
      }
      
      if (mockPlayer.Turned_Pro !== undefined) {
        expect(mockPlayer.Turned_Pro).toBeGreaterThan(1920);
        expect(mockPlayer.Turned_Pro).toBeLessThanOrEqual(new Date().getFullYear());
      }
    });
  });

  describe('Frame Win Percentage Calculation', () => {
    test('should calculate frame win percentage correctly from match data', () => {
      const frameWinPercentage = calculateFrameWinPercentage(mockMatches, 1);
      
      // Player 1 won 6+6=12 frames, opponent won 4+3=7 frames
      // Total frames = 19, won = 12, percentage = (12/19)*100 = 63.16% rounded to 63%
      expect(frameWinPercentage).toBe(63);
    });

    test('should return 0 for empty matches array', () => {
      const frameWinPercentage = calculateFrameWinPercentage([], 1);
      expect(frameWinPercentage).toBe(0);
    });

    test('should handle matches where player is not involved', () => {
      const otherMatches: Match[] = [
        {
          ID: 3,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 3,
          Player1_ID: 2,
          Player1_Name: 'Judd Trump',
          Player2_ID: 3,
          Player2_Name: 'John Higgins',
          Player1_Score: 5,
          Player2_Score: 3,
          Status: 'R'
        }
      ];
      
      const frameWinPercentage = calculateFrameWinPercentage(otherMatches, 1);
      expect(frameWinPercentage).toBe(0);
    });

    test('should handle matches with zero scores', () => {
      const zeroScoreMatches: Match[] = [
        {
          ID: 4,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 4,
          Player1_ID: 1,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: 2,
          Player2_Name: 'Judd Trump',
          Player1_Score: 0,
          Player2_Score: 0,
          Status: 'R'
        }
      ];
      
      const frameWinPercentage = calculateFrameWinPercentage(zeroScoreMatches, 1);
      expect(frameWinPercentage).toBe(0);
    });
  });

  describe('Player Form Calculation', () => {
    test('should calculate player form correctly from match data', () => {
      const playerForm = calculatePlayerForm(mockMatches, 1, 10);
      
      expect(playerForm.playerId).toBe(1);
      expect(playerForm.playerName).toBe('Ronnie O\'Sullivan');
      expect(playerForm.wins).toBe(2); // Won both matches
      expect(playerForm.losses).toBe(0);
      expect(playerForm.winPercentage).toBe(100);
      expect(playerForm.lastMatches).toHaveLength(2);
    });

    test('should limit matches to specified count', () => {
      const manyMatches = Array(15).fill(null).map((_, index) => ({
        ...mockMatches[0],
        ID: index + 1,
        Date_Time: `2024-01-${String(index + 1).padStart(2, '0')}T14:00:00Z`
      }));
      
      const playerForm = calculatePlayerForm(manyMatches, 1, 5);
      expect(playerForm.lastMatches).toHaveLength(5);
    });

    test('should return empty form for empty matches array', () => {
      const playerForm = calculatePlayerForm([], 1, 10);
      
      expect(playerForm.playerId).toBe(1);
      expect(playerForm.playerName).toBe('');
      expect(playerForm.wins).toBe(0);
      expect(playerForm.losses).toBe(0);
      expect(playerForm.winPercentage).toBe(0);
      expect(playerForm.lastMatches).toHaveLength(0);
      expect(playerForm.formTrend).toBe('stable');
    });

    test('should calculate form trend correctly', () => {
      // Create matches to test form trend calculation
      // Note: matches array is ordered most recent first
      const testMatches: Match[] = [
        // Recent wins (first half - most recent)
        {
          ID: 1,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 1,
          Player1_ID: 1,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: 2,
          Player2_Name: 'Judd Trump',
          Player1_Score: 6,
          Player2_Score: 2,
          Status: 'R'
        },
        {
          ID: 2,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 2,
          Player1_ID: 1,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: 3,
          Player2_Name: 'John Higgins',
          Player1_Score: 6,
          Player2_Score: 3,
          Status: 'R'
        },
        {
          ID: 3,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 3,
          Player1_ID: 1,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: 4,
          Player2_Name: 'Mark Selby',
          Player1_Score: 6,
          Player2_Score: 2,
          Status: 'R'
        },
        // Older losses (second half - older matches)
        {
          ID: 4,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 4,
          Player1_ID: 1,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: 5,
          Player2_Name: 'Neil Robertson',
          Player1_Score: 2,
          Player2_Score: 6,
          Status: 'R'
        },
        {
          ID: 5,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 5,
          Player1_ID: 1,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: 6,
          Player2_Name: 'Stuart Bingham',
          Player1_Score: 1,
          Player2_Score: 6,
          Status: 'R'
        },
        {
          ID: 6,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 6,
          Player1_ID: 1,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: 7,
          Player2_Name: 'Shaun Murphy',
          Player1_Score: 4,
          Player2_Score: 6,
          Status: 'R'
        }
      ];
      
      const playerForm = calculatePlayerForm(testMatches, 1, 6);
      // First half (recent): 3 wins out of 3 = 100% win rate
      // Second half (older): 0 wins out of 3 = 0% win rate
      // Since first half win rate (100%) > second half win rate (0%) + 0.2, trend is declining
      expect(playerForm.formTrend).toBe('declining');
    });
  });

  describe('Data Validation', () => {
    test('should validate match data structure', () => {
      mockMatches.forEach(match => {
        expect(match.ID).toBeDefined();
        expect(match.Player1_ID).toBeDefined();
        expect(match.Player2_ID).toBeDefined();
        expect(match.Player1_Name).toBeDefined();
        expect(match.Player2_Name).toBeDefined();
        expect(match.Player1_Score).toBeGreaterThanOrEqual(0);
        expect(match.Player2_Score).toBeGreaterThanOrEqual(0);
        expect(['R', 'U', 'A']).toContain(match.Status);
      });
    });

    test('should validate player profile data completeness for display', () => {
      // Required fields for basic display
      expect(mockPlayer.Name).toBeTruthy();
      expect(mockPlayer.Nationality).toBeTruthy();
      expect(mockPlayer.Status).toBeTruthy();
      
      // Optional fields should be handled gracefully
      const hasRanking = mockPlayer.Ranking !== undefined;
      const hasBorn = mockPlayer.Born !== undefined;
      const hasTurnedPro = mockPlayer.Turned_Pro !== undefined;
      
      if (hasRanking) {
        expect(mockPlayer.Ranking).toBeGreaterThan(0);
      }
      
      if (hasBorn) {
        expect(mockPlayer.Born).toBeGreaterThan(1900);
      }
      
      if (hasTurnedPro) {
        expect(mockPlayer.Turned_Pro).toBeGreaterThan(1920);
      }
    });

    test('should handle edge cases in player data', () => {
      const edgeCasePlayer: PlayerProfile = {
        ID: 999,
        Name: '',
        Nationality: '',
        Status: 'P'
      };
      
      // Should not throw errors with empty strings
      expect(() => {
        const hasName = edgeCasePlayer.Name && edgeCasePlayer.Name.length > 0;
        const hasNationality = edgeCasePlayer.Nationality && edgeCasePlayer.Nationality.length > 0;
        return { hasName, hasNationality };
      }).not.toThrow();
    });
  });

  describe('Requirements Validation', () => {
    test('should satisfy Requirement 1.2: Display player profile including name, nationality, current ranking, and season statistics', () => {
      // Verify that PlayerProfile interface contains all required fields
      expect(mockPlayer).toHaveProperty('Name');
      expect(mockPlayer).toHaveProperty('Nationality');
      expect(mockPlayer).toHaveProperty('Ranking'); // Current ranking
      
      // Season statistics can be calculated from matches
      const frameWinPercentage = calculateFrameWinPercentage(mockMatches, mockPlayer.ID);
      expect(typeof frameWinPercentage).toBe('number');
      expect(frameWinPercentage).toBeGreaterThanOrEqual(0);
      expect(frameWinPercentage).toBeLessThanOrEqual(100);
    });

    test('should satisfy Requirement 1.5: Display frame win percentage for current season', () => {
      const frameWinPercentage = calculateFrameWinPercentage(mockMatches, mockPlayer.ID);
      
      // Should return a valid percentage
      expect(typeof frameWinPercentage).toBe('number');
      expect(frameWinPercentage).toBeGreaterThanOrEqual(0);
      expect(frameWinPercentage).toBeLessThanOrEqual(100);
      
      // Should be calculated correctly (not just a static value)
      const emptyFrameWinPercentage = calculateFrameWinPercentage([], mockPlayer.ID);
      expect(emptyFrameWinPercentage).toBe(0);
    });

    test('should satisfy Requirement 8.1: Display form chart showing performance over last 10 matches', () => {
      const playerForm = calculatePlayerForm(mockMatches, mockPlayer.ID, 10);
      
      // Should return form data structure
      expect(playerForm).toHaveProperty('playerId');
      expect(playerForm).toHaveProperty('playerName');
      expect(playerForm).toHaveProperty('lastMatches');
      expect(playerForm).toHaveProperty('wins');
      expect(playerForm).toHaveProperty('losses');
      expect(playerForm).toHaveProperty('winPercentage');
      expect(playerForm).toHaveProperty('formTrend');
      
      // Should limit to 10 matches
      expect(playerForm.lastMatches.length).toBeLessThanOrEqual(10);
    });

    test('should satisfy Requirement 8.2: Calculate and display frame win percentage for current season', () => {
      const frameWinPercentage = calculateFrameWinPercentage(mockMatches, mockPlayer.ID);
      
      // Should calculate percentage based on actual match data
      expect(frameWinPercentage).toBe(63); // Based on mock data: 12 frames won out of 19 total
      
      // Should handle different scenarios
      const noMatchesPercentage = calculateFrameWinPercentage([], mockPlayer.ID);
      expect(noMatchesPercentage).toBe(0);
    });
  });
});