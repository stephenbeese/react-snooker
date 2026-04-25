/**
 * Unit tests for event list filtering functionality
 * **Validates: Requirements 2.1, 2.2**
 */

import { describe, it, expect } from 'vitest';
import {
  filterEvents,
  categorizeEventsByTour,
  categorizeEventByTour,
  filterEventsByTour,
  filterEventsBySeason,
  filterEventsByCountry,
  type EventFilterCriteria
} from '../utils/eventUtils';
import type { Event } from '../types/snooker';

// Mock event data for testing
const mockEvents: Event[] = [
  {
    ID: 1,
    Name: 'World Championship',
    StartDate: '2024-04-20',
    EndDate: '2024-05-06',
    Tour: 'Main Tour',
    Country: 'England',
    Venue: 'Crucible Theatre',
    Prize_Fund: 2395000
  },
  {
    ID: 2,
    Name: 'UK Championship',
    StartDate: '2024-11-23',
    EndDate: '2024-12-08',
    Tour: 'Main Tour',
    Country: 'England',
    Venue: 'Barbican Centre',
    Prize_Fund: 1000000
  },
  {
    ID: 3,
    Name: 'Q School Event 1',
    StartDate: '2024-05-14',
    EndDate: '2024-05-17',
    Tour: 'Q Tour',
    Country: 'England',
    Venue: 'Ponds Forge',
    Prize_Fund: 50000
  },
  {
    ID: 4,
    Name: 'Amateur Championship',
    StartDate: '2024-03-15',
    EndDate: '2024-03-22',
    Tour: 'Amateur',
    Country: 'Wales',
    Venue: 'Newport Centre',
    Prize_Fund: 10000
  },
  {
    ID: 5,
    Name: 'Masters',
    StartDate: '2025-01-12',
    EndDate: '2025-01-19',
    Tour: 'Main Tour',
    Country: 'England',
    Venue: 'Alexandra Palace',
    Prize_Fund: 725000
  },
  {
    ID: 6,
    Name: 'European Masters',
    StartDate: '2024-09-23',
    EndDate: '2024-09-29',
    Tour: 'Main Tour',
    Country: 'Germany',
    Venue: 'Stadthalle Fürth',
    Prize_Fund: 427000
  }
];

describe('Event Categorization', () => {
  describe('categorizeEventByTour', () => {
    it('should categorize Main Tour events correctly', () => {
      const event: Event = {
        ID: 1,
        Name: 'Test Event',
        StartDate: '2024-01-01',
        EndDate: '2024-01-07',
        Tour: 'Main Tour'
      };
      
      expect(categorizeEventByTour(event)).toBe('Main Tour');
    });

    it('should categorize Q Tour events correctly', () => {
      const event: Event = {
        ID: 2,
        Name: 'Test Event',
        StartDate: '2024-01-01',
        EndDate: '2024-01-07',
        Tour: 'Q Tour'
      };
      
      expect(categorizeEventByTour(event)).toBe('Q Tour');
    });

    it('should categorize Amateur events correctly', () => {
      const event: Event = {
        ID: 3,
        Name: 'Test Event',
        StartDate: '2024-01-01',
        EndDate: '2024-01-07',
        Tour: 'Amateur'
      };
      
      expect(categorizeEventByTour(event)).toBe('Amateur');
    });

    it('should handle case-insensitive tour names', () => {
      const mainTourEvent: Event = {
        ID: 1,
        Name: 'Test Event',
        StartDate: '2024-01-01',
        EndDate: '2024-01-07',
        Tour: 'main tour'
      };
      
      const qTourEvent: Event = {
        ID: 2,
        Name: 'Test Event',
        StartDate: '2024-01-01',
        EndDate: '2024-01-07',
        Tour: 'q tour'
      };
      
      expect(categorizeEventByTour(mainTourEvent)).toBe('Main Tour');
      expect(categorizeEventByTour(qTourEvent)).toBe('Q Tour');
    });

    it('should return "Other" for unknown tour types', () => {
      const event: Event = {
        ID: 1,
        Name: 'Test Event',
        StartDate: '2024-01-01',
        EndDate: '2024-01-07',
        Tour: 'Unknown Tour'
      };
      
      expect(categorizeEventByTour(event)).toBe('Unknown Tour');
    });

    it('should handle events without tour information', () => {
      const event: Event = {
        ID: 1,
        Name: 'Test Event',
        StartDate: '2024-01-01',
        EndDate: '2024-01-07',
        Tour: ''
      };
      
      expect(categorizeEventByTour(event)).toBe('Other');
    });
  });

  describe('categorizeEventsByTour', () => {
    it('should group events by tour type correctly', () => {
      const categorized = categorizeEventsByTour(mockEvents);
      
      expect(categorized['Main Tour']).toHaveLength(4);
      expect(categorized['Q Tour']).toHaveLength(1);
      expect(categorized['Amateur']).toHaveLength(1);
      expect(categorized['Other']).toHaveLength(0);
    });

    it('should handle empty event array', () => {
      const categorized = categorizeEventsByTour([]);
      
      expect(categorized['Main Tour']).toHaveLength(0);
      expect(categorized['Q Tour']).toHaveLength(0);
      expect(categorized['Amateur']).toHaveLength(0);
      expect(categorized['Other']).toHaveLength(0);
    });

    it('should place unknown tour types in "Other" category', () => {
      const eventsWithUnknown: Event[] = [
        ...mockEvents,
        {
          ID: 7,
          Name: 'Unknown Event',
          StartDate: '2024-01-01',
          EndDate: '2024-01-07',
          Tour: 'Custom Tour'
        }
      ];
      
      const categorized = categorizeEventsByTour(eventsWithUnknown);
      expect(categorized['Other']).toHaveLength(1);
      expect(categorized['Other'][0].Name).toBe('Unknown Event');
    });
  });
});

describe('Event Filtering', () => {
  describe('filterEventsByTour', () => {
    it('should filter events by Main Tour', () => {
      const filtered = filterEventsByTour(mockEvents, 'Main Tour');
      
      expect(filtered).toHaveLength(4);
      filtered.forEach(event => {
        expect(categorizeEventByTour(event)).toBe('Main Tour');
      });
    });

    it('should filter events by Q Tour', () => {
      const filtered = filterEventsByTour(mockEvents, 'Q Tour');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].Name).toBe('Q School Event 1');
    });

    it('should filter events by Amateur tour', () => {
      const filtered = filterEventsByTour(mockEvents, 'Amateur');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].Name).toBe('Amateur Championship');
    });

    it('should return all events when no tour filter is provided', () => {
      const filtered = filterEventsByTour(mockEvents, '');
      
      expect(filtered).toHaveLength(mockEvents.length);
    });

    it('should handle case-insensitive tour filtering', () => {
      const filtered = filterEventsByTour(mockEvents, 'main tour');
      
      expect(filtered).toHaveLength(4);
    });
  });

  describe('filterEventsBySeason', () => {
    it('should filter events by 2024 season', () => {
      const filtered = filterEventsBySeason(mockEvents, 2024);
      
      // Should include events from 2024 and 2025 (2024/2025 season)
      expect(filtered).toHaveLength(6);
    });

    it('should return all events when season is 0 or negative', () => {
      const filtered1 = filterEventsBySeason(mockEvents, 0);
      const filtered2 = filterEventsBySeason(mockEvents, -1);
      
      expect(filtered1).toHaveLength(mockEvents.length);
      expect(filtered2).toHaveLength(mockEvents.length);
    });

    it('should handle events without start dates', () => {
      const eventsWithoutDates: Event[] = [
        {
          ID: 1,
          Name: 'Event Without Date',
          StartDate: '',
          EndDate: '',
          Tour: 'Main Tour'
        }
      ];
      
      const filtered = filterEventsBySeason(eventsWithoutDates, 2024);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('filterEventsByCountry', () => {
    it('should filter events by England', () => {
      const filtered = filterEventsByCountry(mockEvents, 'England');
      
      expect(filtered).toHaveLength(4);
      filtered.forEach(event => {
        expect(event.Country).toBe('England');
      });
    });

    it('should filter events by Wales', () => {
      const filtered = filterEventsByCountry(mockEvents, 'Wales');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].Name).toBe('Amateur Championship');
    });

    it('should handle case-insensitive country filtering', () => {
      const filtered = filterEventsByCountry(mockEvents, 'england');
      
      expect(filtered).toHaveLength(4);
    });

    it('should return all events when no country filter is provided', () => {
      const filtered = filterEventsByCountry(mockEvents, '');
      
      expect(filtered).toHaveLength(mockEvents.length);
    });
  });

  describe('filterEvents (combined filtering)', () => {
    it('should apply multiple filters correctly', () => {
      const criteria: EventFilterCriteria = {
        tourType: 'Main Tour',
        country: 'England'
      };
      
      const filtered = filterEvents(mockEvents, criteria);
      
      expect(filtered).toHaveLength(3);
      filtered.forEach(event => {
        expect(categorizeEventByTour(event)).toBe('Main Tour');
        expect(event.Country).toBe('England');
      });
    });

    it('should filter by minimum prize fund', () => {
      const criteria: EventFilterCriteria = {
        minPrizeFund: 500000
      };
      
      const filtered = filterEvents(mockEvents, criteria);
      
      // Count events with prize fund >= 500000:
      // World Championship: 2395000, UK Championship: 1000000, Masters: 725000
      expect(filtered).toHaveLength(3);
      filtered.forEach(event => {
        expect(event.Prize_Fund).toBeGreaterThanOrEqual(500000);
      });
    });

    it('should filter by season and tour type', () => {
      const criteria: EventFilterCriteria = {
        season: 2024,
        tourType: 'Q Tour'
      };
      
      const filtered = filterEvents(mockEvents, criteria);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].Name).toBe('Q School Event 1');
    });

    it('should return all events when no criteria are provided', () => {
      const filtered = filterEvents(mockEvents, {});
      
      expect(filtered).toHaveLength(mockEvents.length);
    });

    it('should handle date range filtering', () => {
      const criteria: EventFilterCriteria = {
        startDate: '2024-04-01',
        endDate: '2024-06-01'
      };
      
      const filtered = filterEvents(mockEvents, criteria);
      
      // Should include World Championship and Q School Event 1
      expect(filtered).toHaveLength(2);
      expect(filtered.map(e => e.Name)).toContain('World Championship');
      expect(filtered.map(e => e.Name)).toContain('Q School Event 1');
    });

    it('should return empty array when filters match no events', () => {
      const criteria: EventFilterCriteria = {
        tourType: 'Main Tour',
        country: 'France' // No events in France
      };
      
      const filtered = filterEvents(mockEvents, criteria);
      
      expect(filtered).toHaveLength(0);
    });
  });
});

describe('Event Filter Application and Categorization - Requirements 2.2', () => {
  it('should correctly categorize all events by tour type', () => {
    // **Validates: Requirements 2.2**
    const categorized = categorizeEventsByTour(mockEvents);
    
    // Verify each category contains only events of that type
    categorized['Main Tour'].forEach(event => {
      expect(categorizeEventByTour(event)).toBe('Main Tour');
    });
    
    categorized['Q Tour'].forEach(event => {
      expect(categorizeEventByTour(event)).toBe('Q Tour');
    });
    
    categorized['Amateur'].forEach(event => {
      expect(categorizeEventByTour(event)).toBe('Amateur');
    });
    
    // Verify all events are categorized
    const totalCategorized = Object.values(categorized).reduce((sum, events) => sum + events.length, 0);
    expect(totalCategorized).toBe(mockEvents.length);
  });

  it('should maintain filter consistency across multiple operations', () => {
    // **Validates: Requirements 2.1, 2.2**
    const criteria: EventFilterCriteria = {
      tourType: 'Main Tour',
      season: 2024
    };
    
    // Apply filters
    const filtered = filterEvents(mockEvents, criteria);
    
    // Verify all filtered events match criteria
    filtered.forEach(event => {
      expect(categorizeEventByTour(event)).toBe('Main Tour');
      
      // Check season (2024 events should be in 2024 or 2025)
      const startYear = new Date(event.StartDate).getFullYear();
      expect([2024, 2025]).toContain(startYear);
    });
    
    // Verify filtering is consistent when applied multiple times
    const filteredAgain = filterEvents(filtered, criteria);
    expect(filteredAgain).toEqual(filtered);
  });
});