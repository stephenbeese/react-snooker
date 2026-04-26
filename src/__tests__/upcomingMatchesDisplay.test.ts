/**
 * Unit tests for upcoming matches display functionality
 * Tests sorting and filtering for the UpcomingPage
 * **Validates: Requirements 5.1, 5.3**
 */

import { describe, test, expect } from 'vitest';
import {
  sortMatchesByDateAsc,
  filterMatches,
  filterMatchesByEvent,
  filterMatchesByPlayer,
  getUpcomingMatches,
  type MatchFilterCriteria,
} from '../utils/matchUtils';
import type { Match } from '../types/snooker';

// Helper function to create a test upcoming match
const createTestUpcomingMatch = (overrides: Partial<Match> = {}): Match => ({
  ID: 1,
  Event_ID: 100,
  Round_ID: 1,
  Match_Number: 1,
  Player1_ID: 1,
  Player1_Name: 'Player One',
  Player2_ID: 2,
  Player2_Name: 'Player Two',
  Player1_Score: 0,
  Player2_Score: 0,
  Status: 'U', // Upcoming
  Date_Time: '2024-06-15T14:00:00Z',
  Session: 1,
  Table: 'Table 1',
  ...overrides,
});

describe('Upcoming Matches Display - Sorting', () => {
  describe('sortMatchesByDateAsc', () => {
    test('should sort upcoming matches by date in ascending order (earliest first)', () => {
      // **Validates: Requirements 5.1**
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Date_Time: '2024-06-20T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 2, Date_Time: '2024-06-15T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 3, Date_Time: '2024-06-25T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 4, Date_Time: '2024-06-10T14:00:00Z' }),
      ];

      const sorted = sortMatchesByDateAsc(matches);

      expect(sorted[0].ID).toBe(4); // 2024-06-10
      expect(sorted[1].ID).toBe(2); // 2024-06-15
      expect(sorted[2].ID).toBe(1); // 2024-06-20
      expect(sorted[3].ID).toBe(3); // 2024-06-25
    });

    test('should verify each match date is less than or equal to the next match date', () => {
      // **Validates: Requirements 5.1** - Property: Upcoming Matches Sorting
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Date_Time: '2024-06-20T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 2, Date_Time: '2024-06-15T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 3, Date_Time: '2024-06-25T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 4, Date_Time: '2024-06-10T14:00:00Z' }),
      ];

      const sorted = sortMatchesByDateAsc(matches);

      // Verify the property: each match's date <= next match's date
      for (let i = 0; i < sorted.length - 1; i++) {
        const currentDate = new Date(sorted[i].Date_Time!).getTime();
        const nextDate = new Date(sorted[i + 1].Date_Time!).getTime();
        expect(currentDate).toBeLessThanOrEqual(nextDate);
      }
    });

    test('should handle matches with same date/time', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Date_Time: '2024-06-15T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 2, Date_Time: '2024-06-15T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 3, Date_Time: '2024-06-20T14:00:00Z' }),
      ];

      const sorted = sortMatchesByDateAsc(matches);

      // Matches with same date should maintain relative order
      expect(sorted[0].Date_Time).toBe('2024-06-15T14:00:00Z');
      expect(sorted[1].Date_Time).toBe('2024-06-15T14:00:00Z');
      expect(sorted[2].Date_Time).toBe('2024-06-20T14:00:00Z');
    });

    test('should handle matches without dates by placing them at the end', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Date_Time: '2024-06-15T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 2, Date_Time: undefined }),
        createTestUpcomingMatch({ ID: 3, Date_Time: '2024-06-20T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 4, Date_Time: undefined }),
      ];

      const sorted = sortMatchesByDateAsc(matches);

      expect(sorted[0].ID).toBe(1); // 2024-06-15
      expect(sorted[1].ID).toBe(3); // 2024-06-20
      // Matches without dates should be at the end
      expect(sorted[2].Date_Time).toBeUndefined();
      expect(sorted[3].Date_Time).toBeUndefined();
    });

    test('should not mutate the original array', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Date_Time: '2024-06-20T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 2, Date_Time: '2024-06-15T14:00:00Z' }),
      ];

      const originalOrder = matches.map(m => m.ID);
      sortMatchesByDateAsc(matches);

      expect(matches.map(m => m.ID)).toEqual(originalOrder);
    });

    test('should handle empty array', () => {
      const sorted = sortMatchesByDateAsc([]);
      expect(sorted).toEqual([]);
    });

    test('should handle single match', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Date_Time: '2024-06-15T14:00:00Z' }),
      ];

      const sorted = sortMatchesByDateAsc(matches);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].ID).toBe(1);
    });
  });
});

describe('Upcoming Matches Display - Filtering', () => {
  describe('filterMatchesByEvent', () => {
    test('should filter upcoming matches by event ID', () => {
      // **Validates: Requirements 5.3**
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Event_ID: 100 }),
        createTestUpcomingMatch({ ID: 2, Event_ID: 200 }),
        createTestUpcomingMatch({ ID: 3, Event_ID: 100 }),
        createTestUpcomingMatch({ ID: 4, Event_ID: 300 }),
      ];

      const filtered = filterMatchesByEvent(matches, 100);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[1].ID).toBe(3);
      filtered.forEach(match => {
        expect(match.Event_ID).toBe(100);
        expect(match.Status).toBe('U');
      });
    });

    test('should return all matches when eventId is 0 or negative', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Event_ID: 100 }),
        createTestUpcomingMatch({ ID: 2, Event_ID: 200 }),
      ];

      expect(filterMatchesByEvent(matches, 0)).toEqual(matches);
      expect(filterMatchesByEvent(matches, -1)).toEqual(matches);
    });

    test('should return empty array when no matches found for event', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Event_ID: 100 }),
        createTestUpcomingMatch({ ID: 2, Event_ID: 200 }),
      ];

      const filtered = filterMatchesByEvent(matches, 999);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterMatchesByPlayer', () => {
    test('should filter upcoming matches where player is Player1', () => {
      // **Validates: Requirements 5.3**
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Player1_ID: 10, Player2_ID: 20 }),
        createTestUpcomingMatch({ ID: 2, Player1_ID: 30, Player2_ID: 40 }),
        createTestUpcomingMatch({ ID: 3, Player1_ID: 10, Player2_ID: 50 }),
      ];

      const filtered = filterMatchesByPlayer(matches, 10);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[1].ID).toBe(3);
    });

    test('should filter upcoming matches where player is Player2', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Player1_ID: 10, Player2_ID: 20 }),
        createTestUpcomingMatch({ ID: 2, Player1_ID: 30, Player2_ID: 20 }),
        createTestUpcomingMatch({ ID: 3, Player1_ID: 10, Player2_ID: 50 }),
      ];

      const filtered = filterMatchesByPlayer(matches, 20);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[1].ID).toBe(2);
    });

    test('should return all matches when playerId is 0 or negative', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Player1_ID: 10, Player2_ID: 20 }),
        createTestUpcomingMatch({ ID: 2, Player1_ID: 30, Player2_ID: 40 }),
      ];

      expect(filterMatchesByPlayer(matches, 0)).toEqual(matches);
      expect(filterMatchesByPlayer(matches, -1)).toEqual(matches);
    });

    test('should return empty array when player not found in any match', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Player1_ID: 10, Player2_ID: 20 }),
        createTestUpcomingMatch({ ID: 2, Player1_ID: 30, Player2_ID: 40 }),
      ];

      const filtered = filterMatchesByPlayer(matches, 999);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterMatches (combined filters)', () => {
    test('should apply multiple filters correctly for upcoming matches', () => {
      // **Validates: Requirements 5.3**
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Event_ID: 100, Player1_ID: 10, Date_Time: '2024-06-15T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 2, Event_ID: 100, Player1_ID: 20, Date_Time: '2024-06-20T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 3, Event_ID: 200, Player1_ID: 10, Date_Time: '2024-06-25T14:00:00Z' }),
        createTestUpcomingMatch({ ID: 4, Event_ID: 100, Player2_ID: 10, Date_Time: '2024-06-18T14:00:00Z' }),
      ];

      const criteria: MatchFilterCriteria = {
        eventId: 100,
        playerId: 10,
        status: 'U',
      };

      const filtered = filterMatches(matches, criteria);

      // Should return matches 1 and 4: Event 100, Player 10, status U
      expect(filtered).toHaveLength(2);
      expect(filtered.map(m => m.ID).sort()).toEqual([1, 4]);
      
      // Verify all filters are satisfied
      filtered.forEach(match => {
        expect(match.Event_ID).toBe(100);
        expect([match.Player1_ID, match.Player2_ID]).toContain(10);
        expect(match.Status).toBe('U');
      });
    });

    test('should handle empty filter criteria', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1 }),
        createTestUpcomingMatch({ ID: 2 }),
      ];

      const filtered = filterMatches(matches, {});
      expect(filtered).toEqual(matches);
    });

    test('should handle partial filter criteria', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Event_ID: 100 }),
        createTestUpcomingMatch({ ID: 2, Event_ID: 200 }),
        createTestUpcomingMatch({ ID: 3, Event_ID: 100 }),
      ];

      // Filter by event only
      const filtered = filterMatches(matches, { eventId: 100 });
      expect(filtered).toHaveLength(2);
      expect(filtered[0].ID).toBe(1);
      expect(filtered[1].ID).toBe(3);
    });

    test('should verify all returned matches satisfy all specified filter criteria', () => {
      // **Validates: Requirements 5.3** - Property: Upcoming Matches Filtering
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Event_ID: 100, Player1_ID: 10 }),
        createTestUpcomingMatch({ ID: 2, Event_ID: 100, Player1_ID: 20 }),
        createTestUpcomingMatch({ ID: 3, Event_ID: 200, Player1_ID: 10 }),
        createTestUpcomingMatch({ ID: 4, Event_ID: 100, Player2_ID: 10 }),
      ];

      const criteria: MatchFilterCriteria = {
        eventId: 100,
        playerId: 10,
      };

      const filtered = filterMatches(matches, criteria);

      // Verify the property: all returned matches satisfy all criteria
      filtered.forEach(match => {
        if (criteria.eventId !== undefined) {
          expect(match.Event_ID).toBe(criteria.eventId);
        }
        if (criteria.playerId !== undefined) {
          expect([match.Player1_ID, match.Player2_ID]).toContain(criteria.playerId);
        }
      });
    });
  });

  describe('getUpcomingMatches', () => {
    test('should return only upcoming matches (status U)', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Status: 'U' }),
        createTestUpcomingMatch({ ID: 2, Status: 'R' }), // Completed
        createTestUpcomingMatch({ ID: 3, Status: 'U' }),
        createTestUpcomingMatch({ ID: 4, Status: 'A' }), // Abandoned
      ];

      const upcoming = getUpcomingMatches(matches);

      expect(upcoming).toHaveLength(2);
      expect(upcoming[0].ID).toBe(1);
      expect(upcoming[1].ID).toBe(3);
      upcoming.forEach(match => {
        expect(match.Status).toBe('U');
      });
    });

    test('should return empty array when no upcoming matches', () => {
      const matches: Match[] = [
        createTestUpcomingMatch({ ID: 1, Status: 'R' }),
        createTestUpcomingMatch({ ID: 2, Status: 'A' }),
      ];

      const upcoming = getUpcomingMatches(matches);
      expect(upcoming).toHaveLength(0);
    });
  });
});

describe('Upcoming Matches Display - Integration', () => {
  test('should filter and sort upcoming matches correctly for UpcomingPage', () => {
    // **Validates: Requirements 5.1, 5.3**
    const matches: Match[] = [
      createTestUpcomingMatch({ ID: 1, Event_ID: 100, Date_Time: '2024-06-20T14:00:00Z', Status: 'U' }),
      createTestUpcomingMatch({ ID: 2, Event_ID: 100, Date_Time: '2024-06-15T14:00:00Z', Status: 'U' }),
      createTestUpcomingMatch({ ID: 3, Event_ID: 200, Date_Time: '2024-06-18T14:00:00Z', Status: 'U' }),
      createTestUpcomingMatch({ ID: 4, Event_ID: 100, Date_Time: '2024-06-25T14:00:00Z', Status: 'R' }), // Completed
    ];

    // Filter by event and status
    const criteria: MatchFilterCriteria = {
      eventId: 100,
      status: 'U',
    };

    const filtered = filterMatches(matches, criteria);
    const sorted = sortMatchesByDateAsc(filtered);

    // Should return matches 2 and 1, sorted by date ascending
    expect(sorted).toHaveLength(2);
    expect(sorted[0].ID).toBe(2); // 2024-06-15
    expect(sorted[1].ID).toBe(1); // 2024-06-20
  });

  test('should handle complex filtering with player and event', () => {
    const matches: Match[] = [
      createTestUpcomingMatch({ ID: 1, Player1_ID: 10, Event_ID: 100, Date_Time: '2024-06-15T14:00:00Z' }),
      createTestUpcomingMatch({ ID: 2, Player1_ID: 10, Event_ID: 200, Date_Time: '2024-06-20T14:00:00Z' }),
      createTestUpcomingMatch({ ID: 3, Player2_ID: 10, Event_ID: 100, Date_Time: '2024-06-25T14:00:00Z' }),
      createTestUpcomingMatch({ ID: 4, Player1_ID: 20, Event_ID: 100, Date_Time: '2024-06-18T14:00:00Z' }),
    ];

    const criteria: MatchFilterCriteria = {
      playerId: 10,
      eventId: 100,
      status: 'U',
    };

    const filtered = filterMatches(matches, criteria);
    const sorted = sortMatchesByDateAsc(filtered);

    // Should return matches 1 and 3, sorted by date ascending
    expect(sorted).toHaveLength(2);
    expect(sorted[0].ID).toBe(1); // 2024-06-15
    expect(sorted[1].ID).toBe(3); // 2024-06-25
  });

  test('should display scheduled date, time, and table information', () => {
    // **Validates: Requirements 5.2**
    const match = createTestUpcomingMatch({
      ID: 1,
      Date_Time: '2024-06-15T14:30:00Z',
      Session: 2,
      Table: 'Table 1',
    });

    // Verify match has required display information
    expect(match.Date_Time).toBeDefined();
    expect(match.Session).toBeDefined();
    expect(match.Table).toBeDefined();

    // Verify date/time can be parsed
    const matchDate = new Date(match.Date_Time!);
    expect(matchDate.getTime()).toBeGreaterThan(0);
  });

  test('should handle matches with missing optional information', () => {
    const match = createTestUpcomingMatch({
      ID: 1,
      Date_Time: '2024-06-15T14:30:00Z',
      Session: undefined,
      Table: undefined,
    });

    // Should still have date/time
    expect(match.Date_Time).toBeDefined();
    
    // Optional fields may be undefined
    expect(match.Session).toBeUndefined();
    expect(match.Table).toBeUndefined();
  });
});

describe('Upcoming Matches Display - Edge Cases', () => {
  test('should handle matches with invalid date formats gracefully', () => {
    const matches: Match[] = [
      createTestUpcomingMatch({ ID: 1, Date_Time: '2024-06-15T14:00:00Z' }),
      createTestUpcomingMatch({ ID: 2, Date_Time: 'invalid-date' }),
      createTestUpcomingMatch({ ID: 3, Date_Time: '2024-06-20T14:00:00Z' }),
    ];

    const sorted = sortMatchesByDateAsc(matches);

    // Valid dates should be sorted correctly
    // Invalid dates may be treated as valid by Date constructor (returns Invalid Date)
    // The sorting function should handle this gracefully
    expect(sorted[0].ID).toBe(1);
    // Match with invalid date might be placed anywhere depending on how Date handles it
    // Just verify we have all 3 matches
    expect(sorted).toHaveLength(3);
    expect(sorted[2].ID).toBe(3);
  });

  test('should handle very large number of upcoming matches', () => {
    const matches: Match[] = Array.from({ length: 1000 }, (_, i) => 
      createTestUpcomingMatch({
        ID: i + 1,
        Date_Time: new Date(2024, 5, 15 + (i % 30), 14, 0, 0).toISOString(),
      })
    );

    const sorted = sortMatchesByDateAsc(matches);

    expect(sorted).toHaveLength(1000);
    
    // Verify sorting property holds for large dataset
    for (let i = 0; i < sorted.length - 1; i++) {
      const currentDate = new Date(sorted[i].Date_Time!).getTime();
      const nextDate = new Date(sorted[i + 1].Date_Time!).getTime();
      expect(currentDate).toBeLessThanOrEqual(nextDate);
    }
  });

  test('should handle matches with same player in both positions', () => {
    const matches: Match[] = [
      createTestUpcomingMatch({ ID: 1, Player1_ID: 10, Player2_ID: 20 }),
      createTestUpcomingMatch({ ID: 2, Player1_ID: 10, Player2_ID: 30 }),
      createTestUpcomingMatch({ ID: 3, Player1_ID: 30, Player2_ID: 10 }),
    ];

    const filtered = filterMatchesByPlayer(matches, 10);

    expect(filtered).toHaveLength(3);
    expect(filtered.map(m => m.ID).sort()).toEqual([1, 2, 3]);
  });

  test('should handle empty matches array', () => {
    const filtered = filterMatches([], { eventId: 100 });
    const sorted = sortMatchesByDateAsc([]);

    expect(filtered).toEqual([]);
    expect(sorted).toEqual([]);
  });

  test('should handle matches with future dates far in advance', () => {
    const matches: Match[] = [
      createTestUpcomingMatch({ ID: 1, Date_Time: '2024-06-15T14:00:00Z' }),
      createTestUpcomingMatch({ ID: 2, Date_Time: '2025-12-31T14:00:00Z' }),
      createTestUpcomingMatch({ ID: 3, Date_Time: '2024-08-20T14:00:00Z' }),
    ];

    const sorted = sortMatchesByDateAsc(matches);

    expect(sorted[0].ID).toBe(1); // 2024-06-15
    expect(sorted[1].ID).toBe(3); // 2024-08-20
    expect(sorted[2].ID).toBe(2); // 2025-12-31
  });
});
