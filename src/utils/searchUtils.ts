/**
 * Search utility functions for players, events, and matches
 */

import type { Player, Event, Match } from '../types/snooker';

/**
 * Search result types
 */
export type SearchResultType = 'player' | 'event' | 'match';

/**
 * Individual search result
 */
export interface SearchResult {
  id: number;
  type: SearchResultType;
  name: string;
  subtitle?: string;
  data: Player | Event | Match;
}

/**
 * Grouped search results
 */
export interface GroupedSearchResults {
  players: SearchResult[];
  events: SearchResult[];
  matches: SearchResult[];
  total: number;
}

/**
 * Search debounce utility
 */
export interface DebouncedSearchFunction {
  (searchTerm: string): void;
  cancel: () => void;
}

/**
 * Search players by name (case-insensitive partial matching)
 * @param players Array of players to search
 * @param searchTerm Search term to match against player names
 * @returns Array of matching players as search results
 */
export const searchPlayers = (players: Player[], searchTerm: string): SearchResult[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }
  
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  return players
    .filter(player => 
      player.Name && 
      player.Name.toLowerCase().includes(normalizedTerm)
    )
    .map(player => ({
      id: player.ID,
      type: 'player' as const,
      name: player.Name,
      subtitle: player.Nationality,
      data: player
    }));
};

/**
 * Search events by name (case-insensitive partial matching)
 * @param events Array of events to search
 * @param searchTerm Search term to match against event names
 * @returns Array of matching events as search results
 */
export const searchEvents = (events: Event[], searchTerm: string): SearchResult[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }
  
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  return events
    .filter(event => 
      event.Name && 
      event.Name.toLowerCase().includes(normalizedTerm)
    )
    .map(event => ({
      id: event.ID,
      type: 'event' as const,
      name: event.Name,
      subtitle: `${event.StartDate} - ${event.EndDate}`,
      data: event
    }));
};

/**
 * Search matches by player names (case-insensitive partial matching)
 * @param matches Array of matches to search
 * @param searchTerm Search term to match against player names in matches
 * @returns Array of matching matches as search results
 */
export const searchMatches = (matches: Match[], searchTerm: string): SearchResult[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }
  
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  return matches
    .filter(match => 
      (match.Player1_Name && match.Player1_Name.toLowerCase().includes(normalizedTerm)) ||
      (match.Player2_Name && match.Player2_Name.toLowerCase().includes(normalizedTerm))
    )
    .map(match => ({
      id: match.ID,
      type: 'match' as const,
      name: `${match.Player1_Name} vs ${match.Player2_Name}`,
      subtitle: `${match.Player1_Score} - ${match.Player2_Score}`,
      data: match
    }));
};

/**
 * Combined search across players, events, and matches with grouped results
 * @param players Array of players to search
 * @param events Array of events to search
 * @param matches Array of matches to search
 * @param searchTerm Search term to match
 * @returns Grouped search results by type
 */
export const searchAll = (
  players: Player[],
  events: Event[],
  matches: Match[],
  searchTerm: string
): GroupedSearchResults => {
  if (!searchTerm || searchTerm.trim() === '') {
    return {
      players: [],
      events: [],
      matches: [],
      total: 0
    };
  }
  
  const playerResults = searchPlayers(players, searchTerm);
  const eventResults = searchEvents(events, searchTerm);
  const matchResults = searchMatches(matches, searchTerm);
  
  return {
    players: playerResults,
    events: eventResults,
    matches: matchResults,
    total: playerResults.length + eventResults.length + matchResults.length
  };
};

/**
 * Create a debounced search function to reduce API calls
 * @param searchFunction Function to call after debounce delay
 * @param delay Delay in milliseconds (default: 300ms)
 * @returns Debounced search function with cancel method
 */
export const createDebouncedSearch = (
  searchFunction: (searchTerm: string) => void,
  delay: number = 300
): DebouncedSearchFunction => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debouncedFunction = (searchTerm: string) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set new timeout
    timeoutId = setTimeout(() => {
      searchFunction(searchTerm);
      timeoutId = null;
    }, delay);
  };
  
  // Add cancel method
  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debouncedFunction;
};

/**
 * Check if a search term matches a player name (case-insensitive partial matching)
 * This function implements the partial name matching requirement
 * @param playerName Player name to check
 * @param searchTerm Search term to match
 * @returns True if the search term is found in the player name
 */
export const isPartialNameMatch = (playerName: string, searchTerm: string): boolean => {
  if (!playerName || !searchTerm) {
    return false;
  }
  
  const normalizedPlayerName = playerName.toLowerCase().trim();
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  return normalizedPlayerName.includes(normalizedSearchTerm);
};

/**
 * Group search results by type
 * @param results Array of mixed search results
 * @returns Grouped search results by type
 */
export const groupSearchResultsByType = (results: SearchResult[]): GroupedSearchResults => {
  const grouped: GroupedSearchResults = {
    players: [],
    events: [],
    matches: [],
    total: results.length
  };
  
  results.forEach(result => {
    switch (result.type) {
      case 'player':
        grouped.players.push(result);
        break;
      case 'event':
        grouped.events.push(result);
        break;
      case 'match':
        grouped.matches.push(result);
        break;
    }
  });
  
  return grouped;
};

/**
 * Sort search results by relevance (exact matches first, then partial matches)
 * @param results Array of search results to sort
 * @param searchTerm Original search term for relevance scoring
 * @returns Sorted array of search results
 */
export const sortSearchResultsByRelevance = (results: SearchResult[], searchTerm: string): SearchResult[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return results;
  }
  
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  return [...results].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // Exact matches first
    const aExact = aName === normalizedTerm;
    const bExact = bName === normalizedTerm;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // Starts with search term second
    const aStartsWith = aName.startsWith(normalizedTerm);
    const bStartsWith = bName.startsWith(normalizedTerm);
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Alphabetical order for remaining results
    return aName.localeCompare(bName);
  });
};

/**
 * Limit search results to prevent overwhelming the UI
 * @param results Grouped search results
 * @param maxPerType Maximum results per type (default: 10)
 * @returns Limited grouped search results
 */
export const limitSearchResults = (
  results: GroupedSearchResults,
  maxPerType: number = 10
): GroupedSearchResults => {
  return {
    players: results.players.slice(0, maxPerType),
    events: results.events.slice(0, maxPerType),
    matches: results.matches.slice(0, maxPerType),
    total: Math.min(
      results.players.length,
      maxPerType
    ) + Math.min(
      results.events.length,
      maxPerType
    ) + Math.min(
      results.matches.length,
      maxPerType
    )
  };
};