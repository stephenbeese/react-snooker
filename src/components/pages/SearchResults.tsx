/**
 * SearchResults component - Display search results grouped by type
 */

import { useState, useEffect, useCallback } from 'react';
import { SearchBar } from '../common/SearchBar';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { PlayerCard } from '../common/PlayerCard';
import { EventCard } from '../common/EventCard';
import { MatchResult } from '../common/MatchResult';
import { useAllPlayers, useEventsBySeason, useRecentResults } from '../../hooks/useSnookerApi';
import { searchAll, limitSearchResults } from '../../utils/searchUtils';
import type { GroupedSearchResults, SearchResult } from '../../utils/searchUtils';
import type { Player, Event, Match } from '../../types/snooker';

interface SearchResultsProps {
  onPlayerClick?: (playerId: number) => void;
  onEventClick?: (eventId: number) => void;
  onMatchClick?: (matchId: number) => void;
  initialSearchTerm?: string;
  maxResultsPerType?: number;
}

export const SearchResults = ({
  onPlayerClick,
  onEventClick,
  onMatchClick,
  initialSearchTerm = '',
  maxResultsPerType = 10
}: SearchResultsProps) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState<GroupedSearchResults>({
    players: [],
    events: [],
    matches: [],
    total: 0
  });
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  const [searchDuration, setSearchDuration] = useState<number | null>(null);

  // Fetch data for searching
  const { data: players, loading: playersLoading, error: playersError } = useAllPlayers();
  const { data: events, loading: eventsLoading, error: eventsError } = useEventsBySeason();
  const { data: matches, loading: matchesLoading, error: matchesError } = useRecentResults(30); // Last 30 days

  const isLoading = playersLoading || eventsLoading || matchesLoading;
  const hasError = playersError || eventsError || matchesError;

  // Perform search when data is available and search term changes
  const performSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults({
        players: [],
        events: [],
        matches: [],
        total: 0
      });
      setSearchDuration(null);
      return;
    }

    if (!players || !events || !matches) {
      return;
    }

    const startTime = performance.now();
    setSearchStartTime(startTime);

    // Convert Player objects to have Name field for compatibility
    const playersWithNames = players.map(player => ({
      ...player,
      Name: player.Name || `${player.FirstName} ${player.LastName}`.trim()
    }));

    const results = searchAll(playersWithNames, events, matches, term);
    const limitedResults = limitSearchResults(results, maxResultsPerType);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    setSearchResults(limitedResults);
    setSearchDuration(duration);
  }, [players, events, matches, maxResultsPerType]);

  // Perform search when search term or data changes
  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);

  // Handle search input
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Navigation handlers
  const handlePlayerClick = useCallback((result: SearchResult) => {
    const player = result.data as Player;
    onPlayerClick?.(player.ID);
  }, [onPlayerClick]);

  const handleEventClick = useCallback((result: SearchResult) => {
    const event = result.data as Event;
    onEventClick?.(event.ID);
  }, [onEventClick]);

  const handleMatchClick = useCallback((result: SearchResult) => {
    const match = result.data as Match;
    onMatchClick?.(match.ID);
  }, [onMatchClick]);

  // Render search result item
  const renderSearchResult = (result: SearchResult) => {
    switch (result.type) {
      case 'player':
        const player = result.data as Player;
        return (
          <div
            key={`player-${result.id}`}
            onClick={() => handlePlayerClick(result)}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <PlayerCard player={player} />
          </div>
        );
      
      case 'event':
        const event = result.data as Event;
        return (
          <div
            key={`event-${result.id}`}
            onClick={() => handleEventClick(result)}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <EventCard event={event} />
          </div>
        );
      
      case 'match':
        const match = result.data as Match;
        return (
          <div
            key={`match-${result.id}`}
            onClick={() => handleMatchClick(result)}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <MatchResult match={match} />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render results section
  const renderResultsSection = (title: string, results: SearchResult[], type: string) => {
    if (results.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
          {title} ({results.length})
        </h3>
        <div className="space-y-2">
          {results.map(renderSearchResult)}
        </div>
        {results.length === maxResultsPerType && (
          <p className="text-sm text-gray-500 mt-2">
            Showing first {maxResultsPerType} results. Refine your search for more specific results.
          </p>
        )}
      </div>
    );
  };

  if (hasError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search players, events, and matches..."
            debounceMs={300}
          />
        </div>
        <ErrorMessage 
          message="Unable to load search data. Please try again later." 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search players, events, and matches..."
          debounceMs={300}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Search Results */}
      {!isLoading && searchTerm.trim() && (
        <div>
          {/* Search Summary */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results for "{searchTerm}"
              </h2>
              {searchDuration !== null && (
                <span className="text-sm text-gray-500">
                  {searchResults.total} results in {searchDuration.toFixed(0)}ms
                </span>
              )}
            </div>
            {searchResults.total === 0 && (
              <p className="text-gray-600 mt-2">
                No results found. Try a different search term.
              </p>
            )}
          </div>

          {/* Performance Warning */}
          {searchDuration !== null && searchDuration > 500 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Search took {searchDuration.toFixed(0)}ms (target: &lt;500ms). 
                Consider refining your search term for better performance.
              </p>
            </div>
          )}

          {/* Grouped Results */}
          {searchResults.total > 0 && (
            <div>
              {renderResultsSection('Players', searchResults.players, 'player')}
              {renderResultsSection('Events', searchResults.events, 'event')}
              {renderResultsSection('Matches', searchResults.matches, 'match')}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !searchTerm.trim() && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search Snooker Data</h3>
          <p className="text-gray-600 mb-4">
            Enter a search term to find players, events, and matches.
          </p>
          <div className="text-sm text-gray-500">
            <p>• Search for player names (e.g., "Ronnie O'Sullivan")</p>
            <p>• Search for events (e.g., "World Championship")</p>
            <p>• Search for matches by player names</p>
          </div>
        </div>
      )}
    </div>
  );
};