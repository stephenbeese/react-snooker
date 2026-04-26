/**
 * ResultFilters component - Event, player, and date range filters
 */

import { useState, useEffect } from 'react';
import type { Match } from '../../types';
import type { MatchFilterCriteria } from '../../utils/matchUtils';

interface ResultFiltersProps {
  matches: Match[];
  onFiltersChange: (criteria: MatchFilterCriteria) => void;
  loading?: boolean;
}

export const ResultFilters = ({ matches, onFiltersChange, loading }: ResultFiltersProps) => {
  const [filters, setFilters] = useState<MatchFilterCriteria>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique event IDs from matches
  const eventIds = Array.from(
    new Set(
      matches
        .map(match => match.Event_ID)
        .filter(eventId => eventId > 0)
    )
  ).sort((a, b) => a - b);

  // Extract unique player names and IDs from matches
  const players = Array.from(
    new Map(
      matches.flatMap(match => [
        [match.Player1_ID, match.Player1_Name],
        [match.Player2_ID, match.Player2_Name]
      ])
    ).entries()
  )
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleEventChange = (eventId: string) => {
    const numValue = eventId === '' ? undefined : parseInt(eventId, 10);
    setFilters(prev => ({
      ...prev,
      eventId: numValue
    }));
  };

  const handlePlayerChange = (playerId: string) => {
    const numValue = playerId === '' ? undefined : parseInt(playerId, 10);
    setFilters(prev => ({
      ...prev,
      playerId: numValue
    }));
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Filter Results</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden text-blue-600 hover:text-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            aria-expanded={isExpanded}
            aria-controls="filter-content"
            aria-label={isExpanded ? "Hide filters" : "Show filters"}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Filter content */}
      <div 
        id="filter-content"
        className={`${isExpanded ? 'block' : 'hidden'} md:block`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Event filter */}
          <div>
            <label htmlFor="event-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Event
            </label>
            <select
              id="event-filter"
              value={filters.eventId || ''}
              onChange={(e) => handleEventChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Events</option>
              {eventIds.map(eventId => (
                <option key={eventId} value={eventId}>
                  Event {eventId}
                </option>
              ))}
            </select>
          </div>

          {/* Player filter */}
          <div>
            <label htmlFor="player-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Player
            </label>
            <select
              id="player-filter"
              value={filters.playerId || ''}
              onChange={(e) => handlePlayerChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Players</option>
              {players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                status: e.target.value === '' ? undefined : e.target.value as 'R' | 'U' | 'A'
              }))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Statuses</option>
              <option value="R">Completed</option>
              <option value="U">Upcoming</option>
              <option value="A">Abandoned</option>
            </select>
          </div>
        </div>

        {/* Date range filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              id="start-date-filter"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="end-date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              id="end-date-filter"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.eventId && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Event: {filters.eventId}
                  <button
                    onClick={() => handleEventChange('')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove event filter: ${filters.eventId}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.playerId && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Player: {players.find(p => p.id === filters.playerId)?.name || filters.playerId}
                  <button
                    onClick={() => handlePlayerChange('')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove player filter`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Status: {filters.status === 'R' ? 'Completed' : filters.status === 'U' ? 'Upcoming' : 'Abandoned'}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: undefined }))}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove status filter`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  From: {filters.startDate}
                  <button
                    onClick={() => handleDateRangeChange('startDate', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove start date filter: ${filters.startDate}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  To: {filters.endDate}
                  <button
                    onClick={() => handleDateRangeChange('endDate', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove end date filter: ${filters.endDate}`}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
