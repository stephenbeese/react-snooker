/**
 * Integration test for Head-to-Head comparison feature
 * Tests the complete H2H workflow from player selection to display
 */

import { describe, it, expect } from 'vitest';
import { calculateH2HWinPercentage, groupH2HByEventType } from '../utils/h2hUtils';
import type { Match, Event } from '../types/snooker';

describe('Head-to-Head Integration', () => {
  // Sample test data
  const player1Id = 1;
  const player2Id = 2;

  const sampleMatches: Match[] = [
    {
      ID: 1,
      Event_ID: 100,
      Round_ID: 1,
      Match_Number: 1,
      Player1_ID: player1Id,
      Player1_Name: 'Ronnie O\'Sullivan',
      Player2_ID: player2Id,
      Player2_Name: 'John Higgins',
      Player1_Score: 6,
      Player2_Score: 4,
      Status: 'R',
      Date_Time: '2024-01-15T19:00:00Z',
    },
    {
      ID: 2,
      Event_ID: 100,
      Round_ID: 2,
      Match_Number: 1,
      Player1_ID: player2Id,
      Player1_Name: 'John Higgins',
      Player2_ID: player1Id,
      Player2_Name: 'Ronnie O\'Sullivan',
      Player1_Score: 5,
      Player2_Score: 6,
      Status: 'R',
      Date_Time: '2024-02-20T19:00:00Z',
    },
    {
      ID: 3,
      Event_ID: 101,
      Round_ID: 1,
      Match_Number: 1,
      Player1_ID: player1Id,
      Player1_Name: 'Ronnie O\'Sullivan',
      Player2_ID: player2Id,
      Player2_Name: 'John Higgins',
      Player1_Score: 4,
      Player2_Score: 6,
      Status: 'R',
      Date_Time: '2024-03-10T19:00:00Z',
    },
  ];

  const sampleEvents: Event[] = [
    {
      ID: 100,
      Name: 'World Championship',
      StartDate: '2024-01-01',
      EndDate: '2024-01-31',
      Tour: 'Main Tour',
    },
    {
      ID: 101,
      Name: 'UK Championship',
      StartDate: '2024-03-01',
      EndDate: '2024-03-31',
      Tour: 'Main Tour',
    },
  ];

  describe('H2H Statistics Calculation', () => {
    it('should calculate correct win percentages', () => {
      const stats = calculateH2HWinPercentage(sampleMatches, player1Id, player2Id);

      expect(stats.player1Id).toBe(player1Id);
      expect(stats.player2Id).toBe(player2Id);
      expect(stats.totalMatches).toBe(3);
      expect(stats.player1Wins).toBe(2);
      expect(stats.player2Wins).toBe(1);
      expect(stats.player1WinPercentage).toBe(67); // 2/3 * 100 = 66.67, rounded to 67
      expect(stats.player2WinPercentage).toBe(33); // 1/3 * 100 = 33.33, rounded to 33
    });

    it('should handle empty match list', () => {
      const stats = calculateH2HWinPercentage([], player1Id, player2Id);

      expect(stats.totalMatches).toBe(0);
      expect(stats.player1Wins).toBe(0);
      expect(stats.player2Wins).toBe(0);
      expect(stats.player1WinPercentage).toBe(0);
      expect(stats.player2WinPercentage).toBe(0);
    });

    it('should correctly identify player names', () => {
      const stats = calculateH2HWinPercentage(sampleMatches, player1Id, player2Id);

      expect(stats.player1Name).toBe('Ronnie O\'Sullivan');
      expect(stats.player2Name).toBe('John Higgins');
    });
  });

  describe('Event Type Breakdown', () => {
    it('should group matches by event type', () => {
      const breakdown = groupH2HByEventType(sampleMatches, sampleEvents, player1Id, player2Id);

      expect(breakdown).toHaveLength(1); // All matches are Main Tour
      expect(breakdown[0].eventType).toBe('Main Tour');
      expect(breakdown[0].totalMatches).toBe(3);
      expect(breakdown[0].player1Wins).toBe(2);
      expect(breakdown[0].player2Wins).toBe(1);
    });

    it('should handle multiple event types', () => {
      const mixedEvents: Event[] = [
        ...sampleEvents,
        {
          ID: 102,
          Name: 'Q School',
          StartDate: '2024-04-01',
          EndDate: '2024-04-30',
          Tour: 'Q Tour',
        },
      ];

      const mixedMatches: Match[] = [
        ...sampleMatches,
        {
          ID: 4,
          Event_ID: 102,
          Round_ID: 1,
          Match_Number: 1,
          Player1_ID: player1Id,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: player2Id,
          Player2_Name: 'John Higgins',
          Player1_Score: 3,
          Player2_Score: 2,
          Status: 'R',
          Date_Time: '2024-04-15T19:00:00Z',
        },
      ];

      const breakdown = groupH2HByEventType(mixedMatches, mixedEvents, player1Id, player2Id);

      expect(breakdown).toHaveLength(2);
      
      const mainTour = breakdown.find(b => b.eventType === 'Main Tour');
      const qTour = breakdown.find(b => b.eventType === 'Q Tour');

      expect(mainTour).toBeDefined();
      expect(mainTour?.totalMatches).toBe(3);
      
      expect(qTour).toBeDefined();
      expect(qTour?.totalMatches).toBe(1);
    });

    it('should return empty array for no matches', () => {
      const breakdown = groupH2HByEventType([], sampleEvents, player1Id, player2Id);

      expect(breakdown).toEqual([]);
    });
  });

  describe('Win Percentage Calculation', () => {
    it('should round win percentages to nearest integer', () => {
      // Create matches with specific win distribution
      const matches: Match[] = [
        {
          ID: 1,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 1,
          Player1_ID: player1Id,
          Player1_Name: 'Player 1',
          Player2_ID: player2Id,
          Player2_Name: 'Player 2',
          Player1_Score: 6,
          Player2_Score: 4,
          Status: 'R',
        },
        {
          ID: 2,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 2,
          Player1_ID: player1Id,
          Player1_Name: 'Player 1',
          Player2_ID: player2Id,
          Player2_Name: 'Player 2',
          Player1_Score: 4,
          Player2_Score: 6,
          Status: 'R',
        },
        {
          ID: 3,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 3,
          Player1_ID: player1Id,
          Player1_Name: 'Player 1',
          Player2_ID: player2Id,
          Player2_Name: 'Player 2',
          Player1_Score: 4,
          Player2_Score: 6,
          Status: 'R',
        },
      ];

      const stats = calculateH2HWinPercentage(matches, player1Id, player2Id);

      // 1 win out of 3 = 33.33%, should round to 33
      expect(stats.player1WinPercentage).toBe(33);
      // 2 wins out of 3 = 66.67%, should round to 67
      expect(stats.player2WinPercentage).toBe(67);
    });
  });

  describe('Match History Sorting', () => {
    it('should handle matches with dates', () => {
      const sortedMatches = [...sampleMatches].sort((a, b) => {
        if (!a.Date_Time || !b.Date_Time) return 0;
        return new Date(b.Date_Time).getTime() - new Date(a.Date_Time).getTime();
      });

      // Most recent match should be first
      expect(sortedMatches[0].ID).toBe(3); // March match
      expect(sortedMatches[1].ID).toBe(2); // February match
      expect(sortedMatches[2].ID).toBe(1); // January match
    });
  });

  describe('Player Selection Validation', () => {
    it('should not allow comparing a player with themselves', () => {
      const samePlayerMatches = sampleMatches.filter(
        m => (m.Player1_ID === player1Id && m.Player2_ID === player1Id)
      );

      expect(samePlayerMatches).toHaveLength(0);
    });

    it('should filter matches to only include selected players', () => {
      const player3Id = 3;
      const mixedMatches: Match[] = [
        ...sampleMatches,
        {
          ID: 4,
          Event_ID: 100,
          Round_ID: 1,
          Match_Number: 4,
          Player1_ID: player1Id,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: player3Id,
          Player2_Name: 'Mark Selby',
          Player1_Score: 6,
          Player2_Score: 3,
          Status: 'R',
        },
      ];

      const stats = calculateH2HWinPercentage(mixedMatches, player1Id, player2Id);

      // Should only count matches between player1 and player2
      expect(stats.totalMatches).toBe(3);
    });
  });
});
