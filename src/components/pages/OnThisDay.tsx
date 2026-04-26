/**
 * OnThisDay component - Show notable matches from current date in history
 * Matches month and day regardless of year
 */

import { useState, useMemo, useEffect } from 'react';
import { useRecentResults } from '../../hooks/useSnookerApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { MatchResult } from '../common/MatchResult';
import { matchesHistoricalDate } from '../../utils/matchUtils';
import type { Match } from '../../types';

export const OnThisDay = () => {
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Fetch recent results from last 365 days to get historical data
  // Note: In a real implementation, we'd need a dedicated API endpoint for historical data
  // For now, we'll use the recent results endpoint as a demonstration
  const { data: matches, loading, error } = useRecentResults(365);

  // Filter matches that match the target date (month and day)
  const matchingMatches = useMemo(() => {
    if (!matches) return [];
    
    return matches.filter(match => {
      if (!match.Date_Time) return false;
      return matchesHistoricalDate(match, targetDate);
    });
  }, [matches, targetDate]);

  // Group matches by year
  const matchesByYear = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    
    matchingMatches.forEach(match => {
      if (!match.Date_Time) return;
      
      const matchDate = new Date(match.Date_Time);
      const year = matchDate.getFullYear();
      
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(match);
    });
    
    // Sort years in descending order
    const sortedYears = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a);
    
    const sortedGrouped: Record<number, Match[]> = {};
    sortedYears.forEach(year => {
      sortedGrouped[year] = grouped[year];
    });
    
    return sortedGrouped;
  }, [matchingMatches]);

  // Get available years
  const availableYears = useMemo(() => {
    return Object.keys(matchesByYear).map(Number).sort((a, b) => b - a);
  }, [matchesByYear]);

  // Filter matches by selected year if applicable
  const displayMatches = useMemo(() => {
    if (selectedYear === null) {
      return matchingMatches;
    }
    return matchesByYear[selectedYear] || [];
  }, [selectedYear, matchingMatches, matchesByYear]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setTargetDate(newDate);
    setSelectedYear(null); // Reset year filter when date changes
  };

  const handleYearFilter = (year: number | null) => {
    setSelectedYear(year);
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long'
    });
  };

  const formatDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingSpinner message="Loading historical matches..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <ErrorMessage message={error.message || 'Failed to load historical matches'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              On This Day in Snooker History
            </h2>
            <p className="text-gray-600">
              Discover notable matches that took place on {formatDateDisplay(targetDate)}
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="date-picker" className="text-sm font-medium text-gray-700">
              Select Date:
            </label>
            <input
              id="date-picker"
              type="date"
              value={formatDateInput(targetDate)}
              onChange={handleDateChange}
              className="block w-full md:w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Year Filter */}
        {availableYears.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Filter by Year:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleYearFilter(null)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedYear === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Years ({matchingMatches.length})
              </button>
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearFilter(year)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedYear === year
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {year} ({matchesByYear[year]?.length || 0})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matches Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedYear ? `Matches from ${selectedYear}` : 'All Historical Matches'}
          </h3>

          {displayMatches.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">No matches found</p>
              <p className="text-sm">
                No notable matches were played on {formatDateDisplay(targetDate)}
                {selectedYear ? ` in ${selectedYear}` : ' in our records'}.
              </p>
              <p className="text-sm mt-2 text-gray-400">
                Try selecting a different date to explore snooker history.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayMatches.map((match) => (
                <div key={match.ID} className="border-l-4 border-indigo-500 pl-4">
                  <MatchResult match={match} />
                  {match.Date_Time && (
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(match.Date_Time).getFullYear()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {matchingMatches.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statistics for {formatDateDisplay(targetDate)}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{matchingMatches.length}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{availableYears.length}</div>
              <div className="text-sm text-gray-600">Different Years</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {availableYears.length > 0 ? Math.min(...availableYears) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Earliest Year</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
