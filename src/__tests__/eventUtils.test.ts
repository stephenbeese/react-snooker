/**
 * Property-based tests for event utility functions
 * Tests the correctness properties defined in the design document
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  categorizeEventByTour,
  filterEventsByTour,
  filterEventsBySeason,
  filterEventsByDateRange,
  filterEvents,
  sortEventsByStartDate,
  sortEventsByStartDateDesc,
  getOngoingEvents,
  getUpcomingEvents,
  getCompletedEvents,
} from '../utils/eventUtils';
import type { EventFilterCriteria, DateRange } from '../utils/eventUtils';
import type { Event } from '../types/snooker';

// Generators for test data
const eventGenerator = (): fc.Arbitrary<Event> => 
  fc.record({
    ID: fc.integer({ min: 1, max: 10000 }),
    Name: fc.string({ minLength: 1, maxLength: 100 }),
    StartDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).map(d => {
      try {
        return d.toISOString().split('T')[0];
      } catch {
        return '2024-01-01';
      }
    }),
    EndDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).map(d => {
      try {
        return d.toISOString().split('T')[0];
      } catch {
        return '2024-01-07';
      }
    }),
    Venue: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    Country: fc.option(fc.oneof(
      fc.constant('England'),
      fc.constant('Scotland'),
      fc.constant('Wales'),
      fc.constant('China'),
      fc.constant('Germany'),
      fc.constant('Belgium')
    )),
    Tour: fc.oneof(
      fc.constant('Main Tour'),
      fc.constant('Q Tour'),
      fc.constant('Amateur'),
      fc.constant('main tour'),
      fc.constant('q tour'),
      fc.constant('amateur'),
      fc.constant('Main'),
      fc.constant('Q'),
      fc.constant('Qualifying Tour'),
      fc.constant('Other Tour')
    ),
    Sponsor: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    Prize_Fund: fc.option(fc.integer({ min: 1000, max: 2500000 })),
    Defending_Champion: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    Defending_Champion_ID: fc.option(fc.integer({ min: 1, max: 10000 }))
  });

// Generator for events with consistent date ranges (StartDate <= EndDate)
const validEventGenerator = (): fc.Arbitrary<Event> =>
  fc.record({
    ID: fc.integer({ min: 1, max: 10000 }),
    Name: fc.string({ minLength: 1, maxLength: 100 }),
    StartDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-06-01') }),
    EndDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
    Venue: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    Country: fc.option(fc.oneof(
      fc.constant('England'),
      fc.constant('Scotland'),
      fc.constant('Wales'),
      fc.constant('China'),
      fc.constant('Germany'),
      fc.constant('Belgium')
    )),
    Tour: fc.oneof(
      fc.constant('Main Tour'),
      fc.constant('Q Tour'),
      fc.constant('Amateur'),
      fc.constant('main tour'),
      fc.constant('q tour'),
      fc.constant('amateur'),
      fc.constant('Main'),
      fc.constant('Q'),
      fc.constant('Qualifying Tour'),
      fc.constant('Other Tour')
    ),
    Sponsor: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    Prize_Fund: fc.option(fc.integer({ min: 1000, max: 2500000 })),
    Defending_Champion: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    Defending_Champion_ID: fc.option(fc.integer({ min: 1, max: 10000 }))
  }).map(event => {
    try {
      const startDateStr = event.StartDate.toISOString().split('T')[0];
      const endDateStr = new Date(Math.max(event.StartDate.getTime(), event.EndDate.getTime())).toISOString().split('T')[0];
      return {
        ...event,
        StartDate: startDateStr,
        EndDate: endDateStr
      };
    } catch {
      return {
        ...event,
        StartDate: '2024-01-01',
        EndDate: '2024-01-07'
      };
    }
  });

describe('Event Utils Property-Based Tests', () => {
  
  /**
   * Property 3: Event Categorization
   * For any list of events, each event SHALL be correctly categorized by tour type 
   * based on its Tour field.
   * **Validates: Requirements 2.2**
   */
  test('Property 3: Event Categorization', () => {
    fc.assert(
      fc.property(
        fc.array(eventGenerator(), { maxLength: 100 }),
        (events) => {
          events.forEach(event => {
            const category = categorizeEventByTour(event);
            
            // Property: Category should be a non-empty string
            expect(typeof category).toBe('string');
            expect(category.length).toBeGreaterThan(0);
            
            // Property: Standard tour types should be normalized
            if (event.Tour) {
              const tourLower = event.Tour.toLowerCase().trim();
              
              if (tourLower === 'main tour' || tourLower === 'main' || tourLower === 'maintour') {
                expect(category).toBe('Main Tour');
              } else if (tourLower === 'q tour' || tourLower === 'q' || tourLower === 'qtour' || tourLower === 'qualifying tour') {
                expect(category).toBe('Q Tour');
              } else if (tourLower === 'amateur' || tourLower === 'am') {
                expect(category).toBe('Amateur');
              } else {
                // For non-standard tour names, should return the original value
                expect(category).toBe(event.Tour);
              }
            } else {
              // Events without tour should be categorized as 'Other'
              expect(category).toBe('Other');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Tour filtering consistency
   * For any list of events and tour filter, all returned events should have 
   * the same categorized tour type as the filter.
   */
  test('Tour filtering consistency', () => {
    fc.assert(
      fc.property(
        fc.array(eventGenerator(), { maxLength: 50 }),
        fc.oneof(
          fc.constant('Main Tour'),
          fc.constant('Q Tour'),
          fc.constant('Amateur')
        ),
        (events, tourFilter) => {
          const filtered = filterEventsByTour(events, tourFilter);
          
          // All filtered events should match the tour category
          filtered.forEach(event => {
            const category = categorizeEventByTour(event);
            expect(category.toLowerCase()).toBe(tourFilter.toLowerCase());
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Season filtering correctness
   * For any list of events and season year, all returned events should 
   * start in that year or the following year.
   */
  test('Season filtering correctness', () => {
    fc.assert(
      fc.property(
        fc.array(validEventGenerator(), { maxLength: 50 }),
        fc.integer({ min: 2020, max: 2024 }),
        (events, season) => {
          const filtered = filterEventsBySeason(events, season);
          
          filtered.forEach(event => {
            const startDate = new Date(event.StartDate);
            const eventYear = startDate.getFullYear();
            
            // Event should start in the season year or the following year
            expect(eventYear === season || eventYear === season + 1).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Date range filtering correctness
   * For any list of events and date range, all returned events should 
   * overlap with the specified date range.
   */
  test('Date range filtering correctness', () => {
    fc.assert(
      fc.property(
        fc.array(validEventGenerator(), { maxLength: 50 }),
        fc.record({
          startDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-06-01') }),
          endDate: fc.date({ min: new Date('2024-06-01'), max: new Date('2025-12-31') })
        }).map(dateRangeRaw => {
          try {
            return {
              startDate: dateRangeRaw.startDate.toISOString().split('T')[0],
              endDate: dateRangeRaw.endDate.toISOString().split('T')[0]
            };
          } catch {
            return {
              startDate: '2024-01-01',
              endDate: '2024-12-31'
            };
          }
        }),
        (events, dateRange) => {
          const filtered = filterEventsByDateRange(events, dateRange);
          
          const rangeStart = new Date(dateRange.startDate);
          const rangeEnd = new Date(dateRange.endDate);
          
          filtered.forEach(event => {
            const eventStart = new Date(event.StartDate);
            const eventEnd = new Date(event.EndDate);
            
            // Event should overlap with date range:
            // Event starts before range ends AND event ends after range starts
            expect(eventStart <= rangeEnd && eventEnd >= rangeStart).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Combined filtering correctness
   * For any list of events and filter criteria, all returned events should 
   * satisfy all specified filter criteria.
   */
  test('Combined filtering correctness', () => {
    fc.assert(
      fc.property(
        fc.array(validEventGenerator(), { maxLength: 50 }),
        fc.record({
          tour: fc.option(fc.oneof(
            fc.constant('Main Tour'),
            fc.constant('Q Tour'),
            fc.constant('Amateur')
          ), { nil: undefined }),
          season: fc.option(fc.integer({ min: 2020, max: 2024 }), { nil: undefined }),
          country: fc.option(fc.oneof(
            fc.constant('England'),
            fc.constant('Scotland'),
            fc.constant('China')
          ), { nil: undefined })
        }),
        (events, filtersRaw) => {
          const filters: EventFilterCriteria = {
            tour: filtersRaw.tour ?? undefined,
            season: filtersRaw.season ?? undefined,
            country: filtersRaw.country ?? undefined
          };
          
          const filtered = filterEvents(events, filters);
          
          filtered.forEach(event => {
            // Check tour filter
            if (filters.tour) {
              const category = categorizeEventByTour(event);
              expect(category.toLowerCase()).toBe(filters.tour.toLowerCase());
            }
            
            // Check season filter
            if (filters.season !== undefined) {
              const startDate = new Date(event.StartDate);
              const eventYear = startDate.getFullYear();
              expect(eventYear === filters.season || eventYear === filters.season + 1).toBe(true);
            }
            
            // Check country filter
            if (filters.country) {
              expect(event.Country).toBe(filters.country);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Event sorting by start date (ascending)
   * For any list of events, when sorted by start date ascending, 
   * each event's start date should be <= the next event's start date.
   */
  test('Event sorting by start date ascending', () => {
    fc.assert(
      fc.property(
        fc.array(validEventGenerator(), { minLength: 2, maxLength: 20 }),
        (events) => {
          const sorted = sortEventsByStartDate(events);
          
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentDate = new Date(sorted[i].StartDate);
            const nextDate = new Date(sorted[i + 1].StartDate);
            
            expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Event sorting by start date (descending)
   * For any list of events, when sorted by start date descending, 
   * each event's start date should be >= the next event's start date.
   */
  test('Event sorting by start date descending', () => {
    fc.assert(
      fc.property(
        fc.array(validEventGenerator(), { minLength: 2, maxLength: 20 }),
        (events) => {
          const sorted = sortEventsByStartDateDesc(events);
          
          for (let i = 0; i < sorted.length - 1; i++) {
            const currentDate = new Date(sorted[i].StartDate);
            const nextDate = new Date(sorted[i + 1].StartDate);
            
            expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Unit tests for specific edge cases

  test('categorizeEventByTour should handle null/undefined events', () => {
    expect(categorizeEventByTour(null as any)).toBe('Other');
    expect(categorizeEventByTour(undefined as any)).toBe('Other');
  });

  test('categorizeEventByTour should handle events without Tour field', () => {
    const event = {
      ID: 1,
      Name: 'Test Event',
      StartDate: '2024-01-01',
      EndDate: '2024-01-07',
      Tour: undefined as any
    };
    expect(categorizeEventByTour(event)).toBe('Other');
  });

  test('filterEventsByTour should return all events when tour is empty', () => {
    fc.assert(
      fc.property(
        fc.array(eventGenerator()),
        (events) => {
          const filtered = filterEventsByTour(events, '');
          expect(filtered).toEqual(events);
        }
      )
    );
  });

  test('filterEventsBySeason should return all events when season is invalid', () => {
    fc.assert(
      fc.property(
        fc.array(eventGenerator()),
        (events) => {
          const filtered1 = filterEventsBySeason(events, 0);
          const filtered2 = filterEventsBySeason(events, -1);
          
          expect(filtered1).toEqual(events);
          expect(filtered2).toEqual(events);
        }
      )
    );
  });

  test('filterEventsByDateRange should return all events when date range is invalid', () => {
    fc.assert(
      fc.property(
        fc.array(eventGenerator()),
        (events) => {
          const invalidRange1 = { startDate: '', endDate: '2024-12-31' };
          const invalidRange2 = { startDate: '2024-01-01', endDate: '' };
          
          const filtered1 = filterEventsByDateRange(events, invalidRange1);
          const filtered2 = filterEventsByDateRange(events, invalidRange2);
          
          expect(filtered1).toEqual(events);
          expect(filtered2).toEqual(events);
        }
      )
    );
  });

  test('getOngoingEvents should only return events that contain current date', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const events: Event[] = [
      {
        ID: 1,
        Name: 'Past Event',
        StartDate: '2020-01-01',
        EndDate: '2020-01-07',
        Tour: 'Main Tour'
      },
      {
        ID: 2,
        Name: 'Ongoing Event',
        StartDate: yesterday.toISOString().split('T')[0],
        EndDate: tomorrow.toISOString().split('T')[0],
        Tour: 'Main Tour'
      },
      {
        ID: 3,
        Name: 'Future Event',
        StartDate: '2030-01-01',
        EndDate: '2030-01-07',
        Tour: 'Main Tour'
      }
    ];
    
    const ongoing = getOngoingEvents(events);
    expect(ongoing).toHaveLength(1);
    expect(ongoing[0].Name).toBe('Ongoing Event');
  });

  test('getUpcomingEvents should only return events that start after current date', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const events: Event[] = [
      {
        ID: 1,
        Name: 'Past Event',
        StartDate: '2020-01-01',
        EndDate: '2020-01-07',
        Tour: 'Main Tour'
      },
      {
        ID: 2,
        Name: 'Ongoing Event',
        StartDate: yesterday.toISOString().split('T')[0],
        EndDate: tomorrow.toISOString().split('T')[0],
        Tour: 'Main Tour'
      },
      {
        ID: 3,
        Name: 'Future Event',
        StartDate: '2030-01-01',
        EndDate: '2030-01-07',
        Tour: 'Main Tour'
      }
    ];
    
    const upcoming = getUpcomingEvents(events);
    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].Name).toBe('Future Event');
  });

  test('getCompletedEvents should only return events that ended before current date', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const events: Event[] = [
      {
        ID: 1,
        Name: 'Past Event',
        StartDate: '2020-01-01',
        EndDate: '2020-01-07',
        Tour: 'Main Tour'
      },
      {
        ID: 2,
        Name: 'Ongoing Event',
        StartDate: yesterday.toISOString().split('T')[0],
        EndDate: tomorrow.toISOString().split('T')[0],
        Tour: 'Main Tour'
      },
      {
        ID: 3,
        Name: 'Future Event',
        StartDate: '2030-01-01',
        EndDate: '2030-01-07',
        Tour: 'Main Tour'
      }
    ];
    
    const completed = getCompletedEvents(events);
    expect(completed).toHaveLength(1);
    expect(completed[0].Name).toBe('Past Event');
  });
});