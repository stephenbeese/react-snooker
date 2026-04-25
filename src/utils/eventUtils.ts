/**
 * Event utility functions for categorization and filtering
 */

import type { Event } from '../types/snooker';

/**
 * Filter criteria for events
 */
export interface EventFilterCriteria {
  tourType?: string;
  season?: number;
  startDate?: string;
  endDate?: string;
  country?: string;
  venue?: string;
  minPrizeFund?: number;
}

/**
 * Date range for filtering events
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Categorize an event by tour type
 * @param event Event to categorize
 * @returns Tour category ('Main Tour', 'Q Tour', 'Amateur', or 'Other')
 */
export const categorizeEventByTour = (event: Event): string => {
  if (!event || !event.Tour) {
    return 'Other';
  }
  
  const tour = event.Tour.toLowerCase().trim();
  
  // Normalize tour names to standard categories
  if (tour === 'main tour' || tour === 'main' || tour === 'maintour') {
    return 'Main Tour';
  }
  
  if (tour === 'q tour' || tour === 'q' || tour === 'qtour' || tour === 'qualifying tour') {
    return 'Q Tour';
  }
  
  if (tour === 'amateur' || tour === 'am') {
    return 'Amateur';
  }
  
  // Return the original tour value if it doesn't match standard categories
  return event.Tour;
};

/**
 * Categorize events by tour type into groups
 * @param events Array of events to categorize
 * @returns Object with tour types as keys and arrays of events as values
 */
export const categorizeEventsByTour = (events: Event[]): Record<string, Event[]> => {
  const categories: Record<string, Event[]> = {
    'Main Tour': [],
    'Q Tour': [],
    'Amateur': [],
    'Other': []
  };
  
  events.forEach(event => {
    const category = categorizeEventByTour(event);
    if (categories[category]) {
      categories[category].push(event);
    } else {
      categories['Other'].push(event);
    }
  });
  
  return categories;
};

/**
 * Filter events by tour type
 * @param events Array of events to filter
 * @param tour Tour type to filter by
 * @returns Filtered array of events
 */
export const filterEventsByTour = (events: Event[], tour: string): Event[] => {
  if (!tour || tour.trim() === '') {
    return events;
  }
  
  return events.filter(event => {
    const eventCategory = categorizeEventByTour(event);
    return eventCategory.toLowerCase() === tour.toLowerCase();
  });
};

/**
 * Filter events by season (based on start date year)
 * @param events Array of events to filter
 * @param season Season year to filter by
 * @returns Filtered array of events
 */
export const filterEventsBySeason = (events: Event[], season: number): Event[] => {
  if (!season || season <= 0) {
    return events;
  }
  
  return events.filter(event => {
    if (!event.StartDate) {
      return false;
    }
    
    try {
      const startDate = new Date(event.StartDate);
      const eventYear = startDate.getFullYear();
      
      // Snooker seasons typically run from one year to the next
      // e.g., 2024 season runs from 2024 to 2025
      // We'll consider an event part of a season if it starts in that year or the following year
      return eventYear === season || eventYear === season + 1;
    } catch {
      return false;
    }
  });
};

/**
 * Filter events by date range
 * @param events Array of events to filter
 * @param dateRange Date range to filter by
 * @returns Filtered array of events
 */
export const filterEventsByDateRange = (events: Event[], dateRange: DateRange): Event[] => {
  if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
    return events;
  }
  
  const rangeStart = new Date(dateRange.startDate);
  const rangeEnd = new Date(dateRange.endDate);
  
  return events.filter(event => {
    if (!event.StartDate || !event.EndDate) {
      return false;
    }
    
    try {
      const eventStart = new Date(event.StartDate);
      const eventEnd = new Date(event.EndDate);
      
      // Event overlaps with date range if:
      // - Event starts before range ends AND
      // - Event ends after range starts
      return eventStart <= rangeEnd && eventEnd >= rangeStart;
    } catch {
      return false;
    }
  });
};

/**
 * Filter events by country
 * @param events Array of events to filter
 * @param country Country to filter by
 * @returns Filtered array of events
 */
export const filterEventsByCountry = (events: Event[], country: string): Event[] => {
  if (!country || country.trim() === '') {
    return events;
  }
  
  return events.filter(event => 
    event.Country && 
    event.Country.toLowerCase() === country.toLowerCase()
  );
};

/**
 * Filter events by venue
 * @param events Array of events to filter
 * @param venue Venue to filter by
 * @returns Filtered array of events
 */
export const filterEventsByVenue = (events: Event[], venue: string): Event[] => {
  if (!venue || venue.trim() === '') {
    return events;
  }
  
  return events.filter(event => 
    event.Venue && 
    event.Venue.toLowerCase().includes(venue.toLowerCase())
  );
};

/**
 * Combined filter function for events
 * @param events Array of events to filter
 * @param criteria Filter criteria object
 * @returns Filtered array of events
 */
export const filterEvents = (events: Event[], criteria: EventFilterCriteria): Event[] => {
  let filtered = [...events];
  
  // Apply tour filter
  if (criteria.tourType) {
    filtered = filterEventsByTour(filtered, criteria.tourType);
  }
  
  // Apply season filter
  if (criteria.season !== undefined) {
    filtered = filterEventsBySeason(filtered, criteria.season);
  }
  
  // Apply date range filter
  if (criteria.startDate && criteria.endDate) {
    filtered = filterEventsByDateRange(filtered, {
      startDate: criteria.startDate,
      endDate: criteria.endDate
    });
  }
  
  // Apply country filter
  if (criteria.country) {
    filtered = filterEventsByCountry(filtered, criteria.country);
  }
  
  // Apply venue filter
  if (criteria.venue) {
    filtered = filterEventsByVenue(filtered, criteria.venue);
  }
  
  // Apply minimum prize fund filter
  if (criteria.minPrizeFund !== undefined) {
    filtered = filtered.filter(event => 
      event.Prize_Fund !== undefined && 
      event.Prize_Fund >= (criteria.minPrizeFund || 0)
    );
  }
  
  return filtered;
};

/**
 * Sort events by start date (ascending)
 * @param events Array of events to sort
 * @returns Sorted array of events
 */
export const sortEventsByStartDate = (events: Event[]): Event[] => {
  return [...events].sort((a, b) => {
    if (!a.StartDate || !b.StartDate) {
      return 0;
    }
    
    try {
      const dateA = new Date(a.StartDate);
      const dateB = new Date(b.StartDate);
      return dateA.getTime() - dateB.getTime();
    } catch {
      return 0;
    }
  });
};

/**
 * Sort events by start date (descending)
 * @param events Array of events to sort
 * @returns Sorted array of events
 */
export const sortEventsByStartDateDesc = (events: Event[]): Event[] => {
  return [...events].sort((a, b) => {
    if (!a.StartDate || !b.StartDate) {
      return 0;
    }
    
    try {
      const dateA = new Date(a.StartDate);
      const dateB = new Date(b.StartDate);
      return dateB.getTime() - dateA.getTime();
    } catch {
      return 0;
    }
  });
};

/**
 * Get events that are currently ongoing
 * @param events Array of events to check
 * @returns Array of ongoing events
 */
export const getOngoingEvents = (events: Event[]): Event[] => {
  const now = new Date();
  
  return events.filter(event => {
    if (!event.StartDate || !event.EndDate) {
      return false;
    }
    
    try {
      const startDate = new Date(event.StartDate);
      const endDate = new Date(event.EndDate);
      
      return startDate <= now && now <= endDate;
    } catch {
      return false;
    }
  });
};

/**
 * Get upcoming events (starting after current date)
 * @param events Array of events to check
 * @returns Array of upcoming events
 */
export const getUpcomingEvents = (events: Event[]): Event[] => {
  const now = new Date();
  
  return events.filter(event => {
    if (!event.StartDate) {
      return false;
    }
    
    try {
      const startDate = new Date(event.StartDate);
      return startDate > now;
    } catch {
      return false;
    }
  });
};

/**
 * Get completed events (ended before current date)
 * @param events Array of events to check
 * @returns Array of completed events
 */
export const getCompletedEvents = (events: Event[]): Event[] => {
  const now = new Date();
  
  return events.filter(event => {
    if (!event.EndDate) {
      return false;
    }
    
    try {
      const endDate = new Date(event.EndDate);
      return endDate < now;
    } catch {
      return false;
    }
  });
};