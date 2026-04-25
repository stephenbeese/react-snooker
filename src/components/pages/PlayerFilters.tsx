/**
 * PlayerFilters component - Nationality, ranking, and season filters
 */

import { useState, useEffect } from 'react';
import type { Player, PlayerStatus } from '../../types';
import type { PlayerFilterCriteria } from '../../utils/playerUtils';

interface PlayerFiltersProps {
  players: Player[];
  onFiltersChange: (criteria: PlayerFilterCriteria) => void;
  loading?: boolean;
}

export const PlayerFilters = ({ players, onFiltersChange, loading }: PlayerFiltersProps) => {
  const [filters, setFilters] = useState<PlayerFilterCriteria>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique nationalities from players
  const nationalities = Array.from(
    new Set(
      players
        .map(player => player.Nationality)
        .filter(nationality => nationality && nationality.trim() !== '')
    )
  ).sort();

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleNationalityChange = (nationality: string) => {
    setFilters(prev => ({
      ...prev,
      nationality: nationality === '' ? undefined : nationality
    }));
  };

  const handleRankingChange = (field: 'minRanking' | 'maxRanking', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    setFilters(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === '' ? undefined : (status as 'P' | 'A')
    }));
  };

  const handleSeasonChange = (season: string) => {
    const numValue = season === '' ? undefined : parseInt(season, 10);
    setFilters(prev => ({
      ...prev,
      season: numValue
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
        <h3 className="text-lg font-medium text-gray-800">Filter Players</h3>
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
          {/* Nationality filter */}
          <div>
            <label htmlFor="nationality-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Nationality
            </label>
            <select
              id="nationality-filter"
              value={filters.nationality || ''}
              onChange={(e) => handleNationalityChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Nationalities</option>
              {nationalities.map(nationality => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum ranking filter */}
          <div>
            <label htmlFor="min-ranking-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Min Ranking
            </label>
            <input
              id="min-ranking-filter"
              type="number"
              min="1"
              max="1000"
              value={filters.minRanking || ''}
              onChange={(e) => handleRankingChange('minRanking', e.target.value)}
              disabled={loading}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Maximum ranking filter */}
          <div>
            <label htmlFor="max-ranking-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Max Ranking
            </label>
            <input
              id="max-ranking-filter"
              type="number"
              min="1"
              max="1000"
              value={filters.maxRanking || ''}
              onChange={(e) => handleRankingChange('maxRanking', e.target.value)}
              disabled={loading}
              placeholder="e.g., 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Player status filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Players</option>
              <option value="P">Professional</option>
              <option value="A">Amateur</option>
            </select>
          </div>
        </div>

        {/* Season filter (full width) */}
        <div className="mt-4">
          <label htmlFor="season-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Season
          </label>
          <select
            id="season-filter"
            value={filters.season || ''}
            onChange={(e) => handleSeasonChange(e.target.value)}
            disabled={loading}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Current Season</option>
            <option value="2024">2024/2025</option>
            <option value="2023">2023/2024</option>
            <option value="2022">2022/2023</option>
            <option value="2021">2021/2022</option>
            <option value="2020">2020/2021</option>
          </select>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-2">
              {filters.nationality && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Nationality: {filters.nationality}
                  <button
                    onClick={() => handleNationalityChange('')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove nationality filter: ${filters.nationality}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.minRanking && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Min Rank: {filters.minRanking}
                  <button
                    onClick={() => handleRankingChange('minRanking', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove minimum ranking filter: ${filters.minRanking}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.maxRanking && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Max Rank: {filters.maxRanking}
                  <button
                    onClick={() => handleRankingChange('maxRanking', '')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove maximum ranking filter: ${filters.maxRanking}`}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Status: {filters.status === 'P' ? 'Professional' : 'Amateur'}
                  <button
                    onClick={() => handleStatusChange('')}
                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Remove status filter: ${filters.status === 'P' ? 'Professional' : 'Amateur'}`}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};