/**
 * EventFilters component - Tour type and season filters
 */

import { useState, useEffect } from 'react';
import type { Event } from '../../types';
import type { EventFilterCriteria } from '../../utils/eventUtils';

interface EventFiltersProps {
  events: Event[];
  onFiltersChange: (criteria: EventFilterCriteria) => void;
  loading?: boolean;
}

export const EventFilters = ({ events, onFiltersChange, loading }: EventFiltersProps) => {
  const [filters, setFilters] = useState<EventFilterCriteria>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique tour types from events
  const tourTypes = Array.from(
    new Set(
      events
        .map(event => event.Tour)
        .filter(tour => tour && tour.trim() !== '')
    )
  ).sort();

  // Extract unique countries from events
  const countries = Array.from(
    new Set(
      events
        .map(event => event.Country)
        .filter(country => country && country.trim() !== '')
    )
  ).sort();

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleTourTypeChange = (tourType: string) => {
    setFilters(prev => ({
      ...prev,
      tourType: tourType === '' ? undefined : tourType
    }));
  };

  const handleCountryChange = (country: string) => {
    setFilters(prev => ({
      ...prev,
      country: country === '' ? undefined : country
    }));
  };

  const handleSeasonChange = (season: string) => {
    const numValue = season === '' ? undefined : parseInt(season, 10);
    setFilters(prev => ({
      ...prev,
      season: numValue
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
        <h3 className="text-lg font-medium text-gray-800">Filter Events</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tour type filter */}
          <div>
            <label htmlFor="tour-type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Tour Type
            </label>
            <select
              id="tour-type-filter"
              value={filters.tourType || ''}
              onChange={(e) => handleTourTypeChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Tours</option>
              {tourTypes.map(tourType => (
                <option key={tourType} value={tourType}>
                  {tourType}
                </option>
              ))}
            </select>
          </div>

          {/* Country filter */}
          <div>
            <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              id="country-filter"
              value={filters.country || ''}
              onChange={(e) => handleCountryChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Season filter */}
          <div>
            <label htmlFor="season-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              id="season-filter"
              value={filters.season || ''}
              onChange={(e) => handleSeasonChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Current Season</option>
              <option value="2024">2024/2025</option>
              <option value="2023">2023/2024</option>
              <option value="2022">2022/2023</option>
              <option value="2021">2021/2022</option>
              <option value="2020">2020/2021</option>
            </select>
          </div>

          {/* Prize fund range (placeholder for future enhancement) */}
          <div>
            <label htmlFor="prize-fund-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Min Prize Fund
            </label>
            <input
              id="prize-fund-filter"
              type="number"
              min="0"
              step="1000"
              value={filters.minPrizeFund || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                minPrizeFund: e.target.value === '' ? undefined : parseInt(e.target.value, 10)
              }))}
              disabled={loading}
              placeholder="e.g., 100000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Date range filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date From
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
              End Date Until
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
              {filters.tourType && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Tour: {filters.tourType}
                  <button
                    onClick={() => handleTourTypeChange('')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove tour type filter: ${filters.tourType}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.country && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Country: {filters.country}
                  <button
                    onClick={() => handleCountryChange('')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove country filter: ${filters.country}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.season && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Season: {filters.season}/{filters.season + 1}
                  <button
                    onClick={() => handleSeasonChange('')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove season filter: ${filters.season}/${filters.season + 1}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.minPrizeFund && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Min Prize: £{filters.minPrizeFund.toLocaleString()}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, minPrizeFund: undefined }))}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove minimum prize fund filter: £${filters.minPrizeFund?.toLocaleString()}`}
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
                  Until: {filters.endDate}
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