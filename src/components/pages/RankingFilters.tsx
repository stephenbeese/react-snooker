/**
 * RankingFilters component - Tour type and season filters for rankings
 */

import { useState, useEffect } from 'react';
import type { RankingType } from '../../types';

interface RankingFiltersProps {
  onFiltersChange: (rankingType: RankingType, season: number) => void;
  loading?: boolean;
}

export const RankingFilters = ({ onFiltersChange, loading }: RankingFiltersProps) => {
  const [rankingType, setRankingType] = useState<RankingType>('WorldRankings');
  const [season, setSeason] = useState<number>(2024);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(rankingType, season);
  }, [rankingType, season, onFiltersChange]);

  const handleRankingTypeChange = (type: string) => {
    setRankingType(type as RankingType);
  };

  const handleSeasonChange = (seasonValue: string) => {
    setSeason(parseInt(seasonValue, 10));
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Filter Rankings</h3>
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

      {/* Filter content */}
      <div 
        id="filter-content"
        className={`${isExpanded ? 'block' : 'hidden'} md:block`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ranking type filter */}
          <div>
            <label htmlFor="ranking-type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Ranking Type
            </label>
            <select
              id="ranking-type-filter"
              value={rankingType}
              onChange={(e) => handleRankingTypeChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="WorldRankings">World Rankings</option>
              <option value="MoneyRankings">Prize Money (Current Season)</option>
              <option value="OneYearMoney">Prize Money (One Year)</option>
              <option value="TwoYearMoney">Prize Money (Two Year Rolling)</option>
            </select>
          </div>

          {/* Season filter */}
          <div>
            <label htmlFor="season-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              id="season-filter"
              value={season}
              onChange={(e) => handleSeasonChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="2024">2024/2025</option>
              <option value="2023">2023/2024</option>
              <option value="2022">2022/2023</option>
              <option value="2021">2021/2022</option>
              <option value="2020">2020/2021</option>
            </select>
          </div>
        </div>

        {/* Active filters summary */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Current View:</h4>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {rankingType === 'WorldRankings' && 'World Rankings'}
              {rankingType === 'MoneyRankings' && 'Prize Money (Current Season)'}
              {rankingType === 'OneYearMoney' && 'Prize Money (One Year)'}
              {rankingType === 'TwoYearMoney' && 'Prize Money (Two Year Rolling)'}
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Season: {season}/{season + 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
