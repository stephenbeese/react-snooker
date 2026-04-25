/**
 * Property-based tests for search utility functions
 * Tests the correctness properties defined in the design document
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  searchPlayers,
  searchEvents,
  searchMatches,
  searchAll,
  isPartialNameMatch,
  groupSearchResultsByType,
  sortSearchResultsByRelevance,
  createDebouncedSearch,
} from '../utils/searchUtils';
import type { Player, Event, Match } from '../types/snooker';
import type { SearchResult, GroupedSearchResults } from '../utils/searchUtils';

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

const eventGenerator = (): fc.Arbitrary<Event> =>
  fc.record({
    ID: fc.integer({ min: 1, max: 1000 }),
    Name: fc.string({ minLength: 1, maxLength: 100 }),
    StartDate: fc.integer({ min: 2020, max: 2025 }).chain(year => 
      fc.integer({ min: 1, max: 12 }).chain(month =>
        fc.integer({ min: 1, max: 28 }).map(day => 
          `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        )
      )
    ),
    EndDate: fc.integer({ min: 2020, max: 2025 }).chain(year => 
      fc.integer({ min: 1, max: 12 }).chain(month =>
        fc.integer({ min: 1, max: 28 }).map(day => 
          `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        )
      )
    ),
    Venue: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    Country: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    Tour: fc.oneof(
      fc.constant('Main Tour'),
      fc.constant('Q Tour'),
      fc.constant('Amateur')
    ),
    Sponsor: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    Prize_Fund: fc.option(fc.integer({ min: 1000, max: 2000000 })),
    Defending_Champion: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    Defending_Champion_ID: fc.option(fc.integer({ min: 1, max: 10000 }))
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
    Frames: fc.option(fc.array(fc.record({
      Frame_Number: fc.integer({ min: 1, max: 35 }),
      Player1_Score: fc.integer({ min: 0, max: 147 }),
      Player2_Score: fc.integer({ min: 0, max: 147 }),
      Winner_ID: fc.option(fc.integer({ min: 1, max: 10000 })),
      Break: fc.option(fc.integer({ min: 0, max: 147 }))
    }), { maxLength: 35 })),
    Duration: fc.option(fc.string())
  });

const searchResultGenerator = (): fc.Arbitrary<SearchResult> =>
  fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    type: fc.oneof(
      fc.constant('player' as const),
      fc.constant('event' as const),
      fc.constant('match' as const)
    ),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    subtitle: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    data: fc.oneof(playerGenerator(), eventGenerator(), matchGenerator())
  });

describe('Search Utils Property-Based Tests', () => {
  
  /**
   * Property 17: Search Across Players and Events
   * For any search term and database of players/events, all returned results 
   * SHALL contain the search term (case-insensitive) in their name or relevant fields.
   * **Validates: Requirements 12.2**
   */
  test('Property 17: Search Across Players and Events', () => {
    fc.assert(
      fc.property(
        fc.array(playerGenerator(), { maxLength: 50 }),
        fc.array(eventGenerator(), { maxLength: 50 }),
        fc.array(matchGenerator(), { maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (players, events, matches, searchTerm) => {
          const results = searchAll(players, events, matches, searchTerm);
          const normalizedTerm = searchTerm.toLowerCase().trim();
          
          // All player results must contain the search term in their name
          results.players.forEach(result => {
            const player = result.data as Player;
            expect(player.Name.toLowerCase()).toContain(normalizedTerm);
          });
          
          // All event results must contain the search term in their name
          results.events.forEach(result => {
            const event = result.data as Event;
            expect(event.Name.toLowerCase()).toContain(normalizedTerm);
          });
          
          // All match results must contain the search term in one of the player names
          results.matches.forEach(result => {
            const match = result.data as Match;
            const player1Match = match.Player1_Name.toLowerCase().includes(normalizedTerm);
            const player2Match = match.Player2_Name.toLowerCase().includes(normalizedTerm);
            expect(player1Match || player2Match).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 18: Search Results Grouping
   * For any set of search results, when grouped by type, each result in a group 
   * SHALL have the same type (player, event, or match) as other results in that group.
   * **Validates: Requirements 12.3**
   */
  test('Property 18: Search Results Grouping', () => {
    fc.assert(
      fc.property(
        fc.array(searchResultGenerator(), { maxLength: 100 }),
        (results) => {
          const grouped = groupSearchResultsByType(results);
          
          // All results in players group must be of type 'player'
          grouped.players.forEach(result => {
            expect(result.type).toBe('player');
          });
          
          // All results in events group must be of type 'event'
          grouped.events.forEach(result => {
            expect(result.type).toBe('event');
          });
          
          // All results in matches group must be of type 'match'
          grouped.matches.forEach(result => {
            expect(result.type).toBe('match');
          });
          
          // Total count should match sum of all groups
          const totalGrouped = grouped.players.length + grouped.events.length + grouped.matches.length;
          expect(grouped.total).toBe(results.length);
          expect(totalGrouped).toBe(results.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 19: Partial Name Matching
   * For any player name and partial search term, if the search term is a substring 
   * of the player name (case-insensitive), the player SHALL be included in search results.
   * **Validates: Requirements 12.4**
   */
  test('Property 19: Partial Name Matching', () => {
    fc.assert(
      fc.property(
        fc.array(playerGenerator(), { minLength: 1, maxLength: 50 }),
        (players) => {
          // For each player, test with a substring of their name
          players.forEach(player => {
            if (player.Name && player.Name.length > 2) {
              // Take a substring from the middle of the name
              const startIndex = Math.floor(player.Name.length / 4);
              const endIndex = Math.floor(player.Name.length * 3 / 4);
              const substring = player.Name.substring(startIndex, endIndex);
              
              if (substring.length > 0) {
                const results = searchPlayers([player], substring);
                
                // The player should be found when searching with a substring of their name
                expect(results.length).toBeGreaterThan(0);
                expect(results[0].data).toEqual(player);
                
                // Test case insensitivity
                const upperResults = searchPlayers([player], substring.toUpperCase());
                const lowerResults = searchPlayers([player], substring.toLowerCase());
                
                expect(upperResults.length).toBeGreaterThan(0);
                expect(lowerResults.length).toBeGreaterThan(0);
                expect(upperResults[0].data).toEqual(player);
                expect(lowerResults[0].data).toEqual(player);
              }
            }
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  // Additional unit tests for specific functions

  test('searchPlayers should return empty array for empty search term', () => {
    fc.assert(
      fc.property(
        fc.array(playerGenerator()),
        (players) => {
          expect(searchPlayers(players, '')).toEqual([]);
          expect(searchPlayers(players, '   ')).toEqual([]);
        }
      )
    );
  });

  test('searchEvents should return empty array for empty search term', () => {
    fc.assert(
      fc.property(
        fc.array(eventGenerator()),
        (events) => {
          expect(searchEvents(events, '')).toEqual([]);
          expect(searchEvents(events, '   ')).toEqual([]);
        }
      )
    );
  });

  test('searchMatches should return empty array for empty search term', () => {
    fc.assert(
      fc.property(
        fc.array(matchGenerator()),
        (matches) => {
          expect(searchMatches(matches, '')).toEqual([]);
          expect(searchMatches(matches, '   ')).toEqual([]);
        }
      )
    );
  });

  test('isPartialNameMatch should be case insensitive', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        (name) => {
          const substring = name.substring(1, name.length - 1);
          
          expect(isPartialNameMatch(name, substring)).toBe(true);
          expect(isPartialNameMatch(name.toUpperCase(), substring.toLowerCase())).toBe(true);
          expect(isPartialNameMatch(name.toLowerCase(), substring.toUpperCase())).toBe(true);
        }
      )
    );
  });

  test('isPartialNameMatch should return false for empty inputs', () => {
    expect(isPartialNameMatch('', 'test')).toBe(false);
    expect(isPartialNameMatch('test', '')).toBe(false);
    expect(isPartialNameMatch('', '')).toBe(false);
  });

  test('searchAll should return empty results for empty search term', () => {
    fc.assert(
      fc.property(
        fc.array(playerGenerator()),
        fc.array(eventGenerator()),
        fc.array(matchGenerator()),
        (players, events, matches) => {
          const results = searchAll(players, events, matches, '');
          
          expect(results.players).toEqual([]);
          expect(results.events).toEqual([]);
          expect(results.matches).toEqual([]);
          expect(results.total).toBe(0);
        }
      )
    );
  });

  test('sortSearchResultsByRelevance should prioritize exact matches', () => {
    const results: SearchResult[] = [
      {
        id: 1,
        type: 'player',
        name: 'John Smith',
        data: {} as Player
      },
      {
        id: 2,
        type: 'player',
        name: 'Smith',
        data: {} as Player
      },
      {
        id: 3,
        type: 'player',
        name: 'Adam Smith Jr',
        data: {} as Player
      }
    ];
    
    const sorted = sortSearchResultsByRelevance(results, 'Smith');
    
    // Exact match should be first
    expect(sorted[0].name).toBe('Smith');
    
    // Results starting with search term should come next
    // Then alphabetical order for remaining
  });

  test('createDebouncedSearch should delay function execution', (done) => {
    let callCount = 0;
    const testFunction = (term: string) => {
      callCount++;
    };
    
    const debouncedSearch = createDebouncedSearch(testFunction, 50);
    
    // Call multiple times quickly
    debouncedSearch('test1');
    debouncedSearch('test2');
    debouncedSearch('test3');
    
    // Should not have been called yet
    expect(callCount).toBe(0);
    
    // Wait for debounce delay
    setTimeout(() => {
      // Should have been called only once with the last value
      expect(callCount).toBe(1);
      done();
    }, 100);
  });

  test('createDebouncedSearch cancel should prevent execution', (done) => {
    let callCount = 0;
    const testFunction = (term: string) => {
      callCount++;
    };
    
    const debouncedSearch = createDebouncedSearch(testFunction, 50);
    
    debouncedSearch('test');
    debouncedSearch.cancel();
    
    setTimeout(() => {
      // Should not have been called due to cancellation
      expect(callCount).toBe(0);
      done();
    }, 100);
  });

  test('groupSearchResultsByType should handle empty array', () => {
    const grouped = groupSearchResultsByType([]);
    
    expect(grouped.players).toEqual([]);
    expect(grouped.events).toEqual([]);
    expect(grouped.matches).toEqual([]);
    expect(grouped.total).toBe(0);
  });

  test('searchPlayers should handle players without names', () => {
    const playersWithoutNames: Player[] = [
      {
        ID: 1,
        Name: '',
        Nationality: 'England',
        Status: 'P'
      },
      {
        ID: 2,
        Name: 'John Smith',
        Nationality: 'England', 
        Status: 'P'
      }
    ];
    
    const results = searchPlayers(playersWithoutNames, 'John');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('John Smith');
  });

  test('searchEvents should handle events without names', () => {
    const eventsWithoutNames: Event[] = [
      {
        ID: 1,
        Name: '',
        StartDate: '2024-01-01',
        EndDate: '2024-01-07',
        Tour: 'Main Tour'
      },
      {
        ID: 2,
        Name: 'World Championship',
        StartDate: '2024-04-20',
        EndDate: '2024-05-06',
        Tour: 'Main Tour'
      }
    ];
    
    const results = searchEvents(eventsWithoutNames, 'World');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('World Championship');
  });

  test('searchMatches should handle matches without player names', () => {
    const matchesWithoutNames: Match[] = [
      {
        ID: 1,
        Event_ID: 1,
        Round_ID: 1,
        Match_Number: 1,
        Player1_ID: 1,
        Player1_Name: '',
        Player2_ID: 2,
        Player2_Name: '',
        Player1_Score: 4,
        Player2_Score: 2,
        Status: 'R'
      },
      {
        ID: 2,
        Event_ID: 1,
        Round_ID: 1,
        Match_Number: 2,
        Player1_ID: 3,
        Player1_Name: 'John Smith',
        Player2_ID: 4,
        Player2_Name: 'Jane Doe',
        Player1_Score: 3,
        Player2_Score: 4,
        Status: 'R'
      }
    ];
    
    const results = searchMatches(matchesWithoutNames, 'John');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('John Smith vs Jane Doe');
  });
});