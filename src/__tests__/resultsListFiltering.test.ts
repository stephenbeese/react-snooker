/**
 * Unit tests for results list filtering and sorting
 * Tests filter application and sorting logic for the ResultsPage
 */

import { describe, test, expect } from 'vitest';
import {
  sortMatchesByDateDesc,
  filterMatches,
  filterMatchesByEvent,
  filterMatchesByPlayer,
  filterMatchesByDateRange,
  getCompletedMatches,
  type MatchFilterCriteria,
} from '../utils/matchUtils';
import type { Match } from '../types/snooker';

// Helper function to create a test match
const createTestMatch = (overrides: Partial<Match> = {}): Match => ({
  ID: 1,
  Event_ID: 100,
  Round_ID: 1,
  Match_Number: 1,
  Player1_ID: 1,
  Player1_Name: 'Player One',
  Player2_ID: 2,
  Player2_Name: 'Player Two',
  Player1_Score: 5,
  Player2_Score: 3,
  Status: 'R',
  Date_Time: '2024-01-15T14:00:00Z',
  ...overrides,
});

describe('Results List Filtering', () => {
  describe('sortMatchesByDateDesc', () => {
    test('should sort matches by date in descending order (most recent first)', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Date_Time: '2024-01-10T14:00:00Z' }),
        createTestMatch({ ID: 2, Date_Time: '2024-01-15T14:00:00Z' }),
        createTestMatch({ ID: 3, Date_Time: '2024-01-05T14:00:00Z' }),
        createTestMatch({ ID: 4, Date_Time: '2024-01-20T14:00:00Z' }),
      ];

      const sorted = sortMatchesByDateDesc(matches);

      expect(sorted[0].ID).toBe(4); // 2024-01-20
      expect(sorted[1].ID).toBe(2); // 2024-01-15
      expect(sorted[2].ID).toBe(1); // 2024-01-10
      expect(sorted[3].ID).toBe(3); // 2024-01-05
    });

    test('should handle matches without dates by placing them at the end', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Date_Time: '2024-01-15T14:00:00Z' }),
        createTestMatch({ ID: 2, Date_Time: undefined }),
        createTestMatch({ ID: 3, Date_Time: '2024-01-20T14:00:00Z' }),
        createTestMatch({ ID: 4, Date_Time: undefined }),
      ];

      const sorted = sortMatchesByDateDesc(matches);

      expect(sorted[0].ID).toBe(3); // 2024-01-20
      expect(sorted[1].ID).toBe(1); // 2024-01-15
      // Matches without dates should be at the end
      expect(sorted[2].Date_Time).toBeUndefined();
      expect(sorted[3].Date_Time).toBeUndefined();
    });

    test('should not mutate the original array', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Date_Time: '2024-01-10T14:00:00Z' }),
        createTestMatch({ ID: 2, Date_Time: '2024-01-15T14:00:00Z' }),
      ];

      const originalOrder = matches.map(m => m.ID);
      sortMatchesByDateDesc(matches);

      expect(matches.map(m => m.ID)).toEqual(originalOrder);
    });
  });

  describe('filterMatchesByEvent', () => {
    test('should filter matches by event ID', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Event_ID: 100 }),
        createTestMatch({ ID: 2, Event_ID: 200 }),
        createTestMatch({ ID: 3, Event_ID: 100 }),
        createTestMatch({ ID: 4, Event_ID: 300 }),
      ];

      const filtered = filterMatchesByEvent(matches, 100);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[1].ID).toBe(3);
      filtered.forEach(match => {
        expect(match.Event_ID).toBe(100);
      });
    });

    test('should return all matches when eventId is 0 or negative', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Event_ID: 100 }),
        createTestMatch({ ID: 2, Event_ID: 200 }),
      ];

      expect(filterMatchesByEvent(matches, 0)).toEqual(matches);
      expect(filterMatchesByEvent(matches, -1)).toEqual(matches);
    });

    test('should return empty array when no matches found for event', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Event_ID: 100 }),
        createTestMatch({ ID: 2, Event_ID: 200 }),
      ];

      const filtered = filterMatchesByEvent(matches, 999);

      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterMatchesByPlayer', () => {
    test('should filter matches where player is Player1', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Player1_ID: 10, Player2_ID: 20 }),
        createTestMatch({ ID: 2, Player1_ID: 30, Player2_ID: 40 }),
        createTestMatch({ ID: 3, Player1_ID: 10, Player2_ID: 50 }),
      ];

      const filtered = filterMatchesByPlayer(matches, 10);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[1].ID).toBe(3);
    });

    test('should filter matches where player is Player2', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Player1_ID: 10, Player2_ID: 20 }),
        createTestMatch({ ID: 2, Player1_ID: 30, Player2_ID: 20 }),
        createTestMatch({ ID: 3, Player1_ID: 10, Player2_ID: 50 }),
      ];

      const filtered = filterMatchesByPlayer(matches, 20);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[1].ID).toBe(2);
    });

    test('should return all matches when playerId is 0 or negative', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Player1_ID: 10, Player2_ID: 20 }),
        createTestMatch({ ID: 2, Player1_ID: 30, Player2_ID: 40 }),
      ];

      expect(filterMatchesByPlayer(matches, 0)).toEqual(matches);
      expect(filterMatchesByPlayer(matches, -1)).toEqual(matches);
    });
  });

  describe('filterMatchesByDateRange', () => {
    test('should filter matches within date range', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Date_Time: '2024-01-05T14:00:00Z' }),
        createTestMatch({ ID: 2, Date_Time: '2024-01-15T14:00:00Z' }),
        createTestMatch({ ID: 3, Date_Time: '2024-01-25T14:00:00Z' }),
        createTestMatch({ ID: 4, Date_Time: '2024-02-05T14:00:00Z' }),
      ];

      const filtered = filterMatchesByDateRange(matches, {
        startDate: '2024-01-10',
        endDate: '2024-01-31',
      });

      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(2);
      expect(filtered[1].ID).toBe(3);
    });

    test('should include matches on boundary dates', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Date_Time: '2024-01-10T00:00:00Z' }),
        createTestMatch({ ID: 2, Date_Time: '2024-01-15T14:00:00Z' }),
        createTestMatch({ ID: 3, Date_Time: '2024-01-20T14:00:00Z' }),
      ];

      const filtered = filterMatchesByDateRange(matches, {
        startDate: '2024-01-10T00:00:00.000Z',
        endDate: '2024-01-20T23:59:59.999Z',
      });

      // All three matches should be included (start date, middle, end date)
      expect(filtered).toHaveLength(3);
      expect(filtered.map(m => m.ID).sort()).toEqual([1, 2, 3]);
    });

    test('should return all matches when date range is invalid', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Date_Time: '2024-01-15T14:00:00Z' }),
        createTestMatch({ ID: 2, Date_Time: '2024-01-20T14:00:00Z' }),
      ];

      expect(filterMatchesByDateRange(matches, { startDate: '', endDate: '' })).toEqual(matches);
      expect(filterMatchesByDateRange(matches, { startDate: '2024-01-10', endDate: '' })).toEqual(matches);
      expect(filterMatchesByDateRange(matches, { startDate: '', endDate: '2024-01-31' })).toEqual(matches);
    });

    test('should exclude matches without dates', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Date_Time: '2024-01-15T14:00:00Z' }),
        createTestMatch({ ID: 2, Date_Time: undefined }),
        createTestMatch({ ID: 3, Date_Time: '2024-01-20T14:00:00Z' }),
      ];

      const filtered = filterMatchesByDateRange(matches, {
        startDate: '2024-01-10',
        endDate: '2024-01-31',
      });

      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[1].ID).toBe(3);
    });
  });

  describe('filterMatches (combined filters)', () => {
    test('should apply multiple filters correctly', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Event_ID: 100, Player1_ID: 10, Date_Time: '2024-01-15T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 2, Event_ID: 100, Player1_ID: 20, Date_Time: '2024-01-20T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 3, Event_ID: 200, Player1_ID: 10, Date_Time: '2024-01-25T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 4, Event_ID: 100, Player2_ID: 10, Date_Time: '2024-01-18T14:00:00Z', Status: 'U' }),
      ];

      const criteria: MatchFilterCriteria = {
        eventId: 100,
        playerId: 10,
        startDate: '2024-01-10',
        endDate: '2024-01-20',
        status: 'R',
      };

      const filtered = filterMatches(matches, criteria);

      // Should only return match 1: Event 100, Player 10, within date range, status R
      expect(filtered).toHaveLength(1);
      expect(filtered[0].ID).toBe(1);
    });

    test('should handle empty filter criteria', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1 }),
        createTestMatch({ ID: 2 }),
      ];

      const filtered = filterMatches(matches, {});

      expect(filtered).toEqual(matches);
    });

    test('should handle partial filter criteria', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Event_ID: 100, Status: 'R' }),
        createTestMatch({ ID: 2, Event_ID: 200, Status: 'R' }),
        createTestMatch({ ID: 3, Event_ID: 100, Status: 'U' }),
      ];

      // Filter by event only
      const filtered1 = filterMatches(matches, { eventId: 100 });
      expect(filtered1).toHaveLength(2);
      expect(filtered1[0].ID).toBe(1);
      expect(filtered1[1].ID).toBe(3);

      // Filter by status only
      const filtered2 = filterMatches(matches, { status: 'R' });
      expect(filtered2).toHaveLength(2);
      expect(filtered2[0].ID).toBe(1);
      expect(filtered2[1].ID).toBe(2);
    });
  });

  describe('getCompletedMatches', () => {
    test('should return only completed matches (status R)', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Status: 'R' }),
        createTestMatch({ ID: 2, Status: 'U' }),
        createTestMatch({ ID: 3, Status: 'R' }),
        createTestMatch({ ID: 4, Status: 'A' }),
      ];

      const completed = getCompletedMatches(matches);

      expect(completed).toHaveLength(2);
      expect(completed[0].ID).toBe(1);
      expect(completed[1].ID).toBe(3);
      completed.forEach(match => {
        expect(match.Status).toBe('R');
      });
    });

    test('should return empty array when no completed matches', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Status: 'U' }),
        createTestMatch({ ID: 2, Status: 'A' }),
      ];

      const completed = getCompletedMatches(matches);

      expect(completed).toHaveLength(0);
    });
  });

  describe('Integration: Filter and Sort', () => {
    test('should filter and sort matches correctly for results page', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Event_ID: 100, Date_Time: '2024-01-10T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 2, Event_ID: 100, Date_Time: '2024-01-20T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 3, Event_ID: 200, Date_Time: '2024-01-15T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 4, Event_ID: 100, Date_Time: '2024-01-25T14:00:00Z', Status: 'U' }),
      ];

      // Filter by event and status
      const criteria: MatchFilterCriteria = {
        eventId: 100,
        status: 'R',
      };

      const filtered = filterMatches(matches, criteria);
      const sorted = sortMatchesByDateDesc(filtered);

      // Should return matches 1 and 2, sorted by date descending
      expect(sorted).toHaveLength(2);
      expect(sorted[0].ID).toBe(2); // 2024-01-20
      expect(sorted[1].ID).toBe(1); // 2024-01-10
    });

    test('should handle complex filtering with player and date range', () => {
      const matches: Match[] = [
        createTestMatch({ ID: 1, Player1_ID: 10, Date_Time: '2024-01-05T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 2, Player1_ID: 10, Date_Time: '2024-01-15T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 3, Player2_ID: 10, Date_Time: '2024-01-25T14:00:00Z', Status: 'R' }),
        createTestMatch({ ID: 4, Player1_ID: 20, Date_Time: '2024-01-20T14:00:00Z', Status: 'R' }),
      ];

      const criteria: MatchFilterCriteria = {
        playerId: 10,
        startDate: '2024-01-10',
        endDate: '2024-01-31',
        status: 'R',
      };

      const filtered = filterMatches(matches, criteria);
      const sorted = sortMatchesByDateDesc(filtered);

      // Should return matches 2 and 3, sorted by date descending
      expect(sorted).toHaveLength(2);
      expect(sorted[0].ID).toBe(3); // 2024-01-25
      expect(sorted[1].ID).toBe(2); // 2024-01-15
    });
  });
});
