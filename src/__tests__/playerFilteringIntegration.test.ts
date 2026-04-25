/**
 * Integration tests for player filtering functionality
 * Tests the integration between PlayerFilters component logic and filtering utilities
 * Requirements 1.3
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  filterPlayers,
  type PlayerFilterCriteria
} from '../utils/playerUtils';
import type { Player, PlayerProfile } from '../types/snooker';

describe('Player Filtering Integration Tests', () => {
  let testPlayers: Player[];
  let testPlayerProfiles: PlayerProfile[];

  beforeEach(() => {
    // Create comprehensive test data that matches real-world scenarios
    testPlayers = [
      {
        ID: 1,
        Name: 'Ronnie O\'Sullivan',
        Nationality: 'England',
        Born: 1975,
        Turned_Pro: 1992,
        Status: 'P',
        Image_Url: 'https://example.com/ronnie.jpg'
      },
      {
        ID: 2,
        Name: 'Judd Trump',
        Nationality: 'England',
        Born: 1989,
        Turned_Pro: 2005,
        Status: 'P',
        Image_Url: 'https://example.com/judd.jpg'
      },
      {
        ID: 3,
        Name: 'John Higgins',
        Nationality: 'Scotland',
        Born: 1975,
        Turned_Pro: 1992,
        Status: 'P',
        Image_Url: 'https://example.com/john.jpg'
      },
      {
        ID: 4,
        Name: 'Mark Williams',
        Nationality: 'Wales',
        Born: 1975,
        Turned_Pro: 1992,
        Status: 'P',
        Image_Url: 'https://example.com/mark.jpg'
      },
      {
        ID: 5,
        Name: 'Ding Junhui',
        Nationality: 'China',
        Born: 1987,
        Turned_Pro: 2003,
        Status: 'P',
        Image_Url: 'https://example.com/ding.jpg'
      },
      {
        ID: 6,
        Name: 'Neil Robertson',
        Nationality: 'Australia',
        Born: 1982,
        Turned_Pro: 1998,
        Status: 'P',
        Image_Url: 'https://example.com/neil.jpg'
      },
      {
        ID: 7,
        Name: 'Luca Brecel',
        Nationality: 'Belgium',
        Born: 1995,
        Turned_Pro: 2011,
        Status: 'P',
        Image_Url: 'https://example.com/luca.jpg'
      },
      {
        ID: 8,
        Name: 'Amateur Player 1',
        Nationality: 'England',
        Born: 1990,
        Turned_Pro: undefined,
        Status: 'A',
        Image_Url: undefined
      },
      {
        ID: 9,
        Name: 'Amateur Player 2',
        Nationality: 'Scotland',
        Born: 1992,
        Turned_Pro: undefined,
        Status: 'A',
        Image_Url: undefined
      },
      {
        ID: 10,
        Name: 'Player Without Nationality',
        Nationality: '',
        Born: 1985,
        Turned_Pro: 2010,
        Status: 'P',
        Image_Url: undefined
      }
    ];

    // Create player profiles with ranking data
    testPlayerProfiles = testPlayers.map((player, index) => ({
      ...player,
      Ranking: player.Status === 'P' && player.Nationality !== '' ? index + 1 : undefined,
      Ranking_Points: player.Status === 'P' && player.Nationality !== '' ? (100 - index) * 10000 : undefined,
      Money_Ranking: player.Status === 'P' && player.Nationality !== '' ? index + 1 : undefined,
      Money_Ranking_Points: player.Status === 'P' && player.Nationality !== '' ? (100 - index) * 50000 : undefined,
      Frame_Win_Percentage: player.Status === 'P' && player.Nationality !== '' ? 80 - index * 2 : undefined
    }));
  });

  describe('Real-world Filter Scenarios', () => {
    test('should filter top 10 players correctly', () => {
      const criteria: PlayerFilterCriteria = {
        minRanking: 1,
        maxRanking: 10,
        status: 'P'
      };

      const result = filterPlayers(testPlayerProfiles as Player[], criteria);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(10);
      
      result.forEach(player => {
        expect(player.Status).toBe('P');
        const profilePlayer = player as PlayerProfile;
        if (profilePlayer.Ranking) {
          expect(profilePlayer.Ranking).toBeGreaterThanOrEqual(1);
          expect(profilePlayer.Ranking).toBeLessThanOrEqual(10);
        }
      });
    });

    test('should filter English professional players', () => {
      const criteria: PlayerFilterCriteria = {
        nationality: 'England',
        status: 'P'
      };

      const result = filterPlayers(testPlayers, criteria);
      
      expect(result.length).toBe(2); // Ronnie and Judd
      expect(result.every(p => p.Nationality === 'England' && p.Status === 'P')).toBe(true);
      
      const playerNames = result.map(p => p.Name);
      expect(playerNames).toContain('Ronnie O\'Sullivan');
      expect(playerNames).toContain('Judd Trump');
    });

    test('should filter amateur players by nationality', () => {
      const criteria: PlayerFilterCriteria = {
        nationality: 'Scotland',
        status: 'A'
      };

      const result = filterPlayers(testPlayers, criteria);
      
      expect(result.length).toBe(1);
      expect(result[0].Name).toBe('Amateur Player 2');
      expect(result[0].Nationality).toBe('Scotland');
      expect(result[0].Status).toBe('A');
    });

    test('should handle complex multi-criteria filtering', () => {
      const criteria: PlayerFilterCriteria = {
        nationality: 'England',
        status: 'P',
        minRanking: 1,
        maxRanking: 5,
        season: 2024
      };

      const result = filterPlayers(testPlayerProfiles as Player[], criteria);
      
      result.forEach(player => {
        expect(player.Nationality).toBe('England');
        expect(player.Status).toBe('P');
        
        const profilePlayer = player as PlayerProfile;
        if (profilePlayer.Ranking) {
          expect(profilePlayer.Ranking).toBeGreaterThanOrEqual(1);
          expect(profilePlayer.Ranking).toBeLessThanOrEqual(5);
        }
      });
    });

    test('should return empty results for impossible criteria combinations', () => {
      const criteria: PlayerFilterCriteria = {
        nationality: 'NonExistentCountry',
        status: 'P'
      };

      const result = filterPlayers(testPlayers, criteria);
      expect(result).toEqual([]);
    });

    test('should handle ranking filters with no matching players', () => {
      const criteria: PlayerFilterCriteria = {
        minRanking: 200,
        maxRanking: 300
      };

      const result = filterPlayers(testPlayerProfiles as Player[], criteria);
      expect(result).toEqual([]);
    });
  });

  describe('Filter Combinations and Edge Cases', () => {
    test('should handle nationality filter with special characters', () => {
      // Add a player with special characters in nationality
      const specialPlayer: Player = {
        ID: 100,
        Name: 'Test Player',
        Nationality: 'Côte d\'Ivoire',
        Born: 1990,
        Turned_Pro: 2010,
        Status: 'P',
        Image_Url: undefined
      };

      const playersWithSpecial = [...testPlayers, specialPlayer];
      const criteria: PlayerFilterCriteria = {
        nationality: 'Côte d\'Ivoire'
      };

      const result = filterPlayers(playersWithSpecial, criteria);
      
      expect(result.length).toBe(1);
      expect(result[0].Name).toBe('Test Player');
    });

    test('should handle players without nationality correctly', () => {
      const criteria: PlayerFilterCriteria = {
        nationality: 'England'
      };

      const result = filterPlayers(testPlayers, criteria);
      
      // Should not include player with empty nationality
      expect(result.find(p => p.Name === 'Player Without Nationality')).toBeUndefined();
      expect(result.every(p => p.Nationality && p.Nationality.trim() !== '')).toBe(true);
    });

    test('should handle ranking boundaries correctly', () => {
      const criteria: PlayerFilterCriteria = {
        minRanking: 5,
        maxRanking: 5 // Exact ranking match
      };

      const result = filterPlayers(testPlayerProfiles as Player[], criteria);
      
      if (result.length > 0) {
        result.forEach(player => {
          const profilePlayer = player as PlayerProfile;
          expect(profilePlayer.Ranking).toBe(5);
        });
      }
    });

    test('should maintain filter order independence', () => {
      // Apply filters in different orders and verify same results
      const criteria1: PlayerFilterCriteria = {
        nationality: 'England',
        status: 'P',
        minRanking: 1,
        maxRanking: 10
      };

      const criteria2: PlayerFilterCriteria = {
        minRanking: 1,
        maxRanking: 10,
        nationality: 'England',
        status: 'P'
      };

      const result1 = filterPlayers(testPlayerProfiles as Player[], criteria1);
      const result2 = filterPlayers(testPlayerProfiles as Player[], criteria2);
      
      expect(result1).toEqual(result2);
    });

    test('should handle empty criteria gracefully', () => {
      const result = filterPlayers(testPlayers, {});
      expect(result).toEqual(testPlayers);
    });

    test('should handle undefined criteria values', () => {
      const criteria: PlayerFilterCriteria = {
        nationality: undefined,
        status: undefined,
        minRanking: undefined,
        maxRanking: undefined,
        season: undefined
      };

      const result = filterPlayers(testPlayers, criteria);
      expect(result).toEqual(testPlayers);
    });
  });

  describe('Performance and Data Integrity', () => {
    test('should not modify original player data', () => {
      const originalPlayers = JSON.parse(JSON.stringify(testPlayers));
      const criteria: PlayerFilterCriteria = {
        nationality: 'England',
        status: 'P'
      };

      filterPlayers(testPlayers, criteria);
      
      expect(testPlayers).toEqual(originalPlayers);
    });

    test('should return consistent results for repeated calls', () => {
      const criteria: PlayerFilterCriteria = {
        nationality: 'Scotland',
        status: 'P'
      };

      const result1 = filterPlayers(testPlayers, criteria);
      const result2 = filterPlayers(testPlayers, criteria);
      const result3 = filterPlayers(testPlayers, criteria);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    test('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largePlayerSet: Player[] = [];
      for (let i = 0; i < 1000; i++) {
        largePlayerSet.push({
          ID: i,
          Name: `Player ${i}`,
          Nationality: i % 5 === 0 ? 'England' : i % 5 === 1 ? 'Scotland' : i % 5 === 2 ? 'Wales' : i % 5 === 3 ? 'China' : 'Australia',
          Born: 1980 + (i % 30),
          Turned_Pro: 2000 + (i % 20),
          Status: i % 10 === 0 ? 'A' : 'P',
          Image_Url: undefined
        });
      }

      const criteria: PlayerFilterCriteria = {
        nationality: 'England',
        status: 'P'
      };

      const startTime = performance.now();
      const result = filterPlayers(largePlayerSet, criteria);
      const endTime = performance.now();

      expect(result.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
      expect(result.every(p => p.Nationality === 'England' && p.Status === 'P')).toBe(true);
    });
  });

  describe('Filter State Management Simulation', () => {
    test('should simulate typical user filter workflow', () => {
      // Simulate user starting with no filters
      let currentCriteria: PlayerFilterCriteria = {};
      let filteredPlayers = filterPlayers(testPlayers, currentCriteria);
      expect(filteredPlayers.length).toBe(testPlayers.length);

      // User selects nationality
      currentCriteria = { ...currentCriteria, nationality: 'England' };
      filteredPlayers = filterPlayers(testPlayers, currentCriteria);
      expect(filteredPlayers.length).toBe(3); // 2 professionals + 1 amateur

      // User adds status filter
      currentCriteria = { ...currentCriteria, status: 'P' };
      filteredPlayers = filterPlayers(testPlayers, currentCriteria);
      expect(filteredPlayers.length).toBe(2); // Only professionals

      // User adds ranking filter
      currentCriteria = { ...currentCriteria, minRanking: 1, maxRanking: 2 };
      filteredPlayers = filterPlayers(testPlayerProfiles as Player[], currentCriteria);
      expect(filteredPlayers.length).toBeLessThanOrEqual(2);

      // User clears nationality filter
      currentCriteria = { ...currentCriteria, nationality: undefined };
      filteredPlayers = filterPlayers(testPlayerProfiles as Player[], currentCriteria);
      expect(filteredPlayers.length).toBeGreaterThanOrEqual(2);

      // User clears all filters
      currentCriteria = {};
      filteredPlayers = filterPlayers(testPlayers, currentCriteria);
      expect(filteredPlayers.length).toBe(testPlayers.length);
    });

    test('should handle rapid filter changes', () => {
      const filterSequence = [
        { nationality: 'England' },
        { nationality: 'Scotland' },
        { nationality: 'Wales' },
        { nationality: 'China' },
        { status: 'P' },
        { status: 'A' },
        { minRanking: 1, maxRanking: 10 },
        { minRanking: 11, maxRanking: 20 },
        {}
      ];

      filterSequence.forEach(criteria => {
        const result = filterPlayers(testPlayers, criteria);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Nationality Extraction and Sorting', () => {
    test('should extract unique nationalities correctly', () => {
      const nationalities = Array.from(
        new Set(
          testPlayers
            .map(player => player.Nationality)
            .filter(nationality => nationality && nationality.trim() !== '')
        )
      ).sort();

      expect(nationalities).toContain('England');
      expect(nationalities).toContain('Scotland');
      expect(nationalities).toContain('Wales');
      expect(nationalities).toContain('China');
      expect(nationalities).toContain('Australia');
      expect(nationalities).toContain('Belgium');
      expect(nationalities).not.toContain(''); // Empty nationality should be filtered out
    });

    test('should handle duplicate nationalities', () => {
      const nationalities = Array.from(
        new Set(
          testPlayers
            .map(player => player.Nationality)
            .filter(nationality => nationality && nationality.trim() !== '')
        )
      );

      // Count occurrences of each nationality in original data
      const nationalityCounts = testPlayers.reduce((acc, player) => {
        if (player.Nationality && player.Nationality.trim() !== '') {
          acc[player.Nationality] = (acc[player.Nationality] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Verify England appears multiple times in original data but only once in unique list
      expect(nationalityCounts['England']).toBeGreaterThan(1);
      expect(nationalities.filter(n => n === 'England')).toHaveLength(1);
    });
  });
});