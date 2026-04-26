/**
 * HistoricalPage component - Historical data browsing
 * Allows users to explore past seasons, view historical rankings, events, and notable matches
 */

import { useState, useMemo } from 'react';
import { HistoricalEvents } from '../components/pages/HistoricalEvents';
import { HistoricalRankings } from '../components/pages/HistoricalRankings';
import { FinalsHistory } from '../components/pages/FinalsHistory';
import { OnThisDay } from '../components/pages/OnThisDay';

type HistoricalView = 'events' | 'rankings' | 'finals' | 'onthisday';

export const HistoricalPage = () => {
  const [selectedSeason, setSelectedSeason] = useState<number>(2023);
  const [activeView, setActiveView] = useState<HistoricalView>('events');
  const [compareSeason, setCompareSeason] = useState<number | null>(null);

  // Generate season options (2000-2024)
  const seasonOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const seasons: number[] = [];
    for (let year = currentYear - 1; year >= 2000; year--) {
      seasons.push(year);
    }
    return seasons;
  }, []);

  const handleSeasonChange = (season: number) => {
    setSelectedSeason(season);
  };

  const handleCompareSeasonChange = (season: number | null) => {
    setCompareSeason(season);
  };

  const handleViewChange = (view: HistoricalView) => {
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Historical Data Explorer
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Browse past seasons, explore tournament history, and discover notable matches from snooker's rich heritage.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Season Selector and View Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Season Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="season-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Select Season:
                  </label>
                  <select
                    id="season-select"
                    value={selectedSeason}
                    onChange={(e) => handleSeasonChange(Number(e.target.value))}
                    className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    {seasonOptions.map((season) => (
                      <option key={season} value={season}>
                        {season}/{season + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compare Season Selector */}
                {activeView === 'events' || activeView === 'rankings' ? (
                  <div className="flex items-center gap-3">
                    <label htmlFor="compare-season-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Compare with:
                    </label>
                    <select
                      id="compare-season-select"
                      value={compareSeason ?? ''}
                      onChange={(e) => handleCompareSeasonChange(e.target.value ? Number(e.target.value) : null)}
                      className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">None</option>
                      {seasonOptions
                        .filter((season) => season !== selectedSeason)
                        .map((season) => (
                          <option key={season} value={season}>
                            {season}/{season + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : null}
              </div>

              {/* View Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewChange('events')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'events'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => handleViewChange('rankings')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'rankings'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rankings
                </button>
                <button
                  onClick={() => handleViewChange('finals')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'finals'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Finals History
                </button>
                <button
                  onClick={() => handleViewChange('onthisday')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'onthisday'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  On This Day
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {activeView === 'events' && (
            <HistoricalEvents 
              season={selectedSeason} 
              compareSeason={compareSeason}
            />
          )}
          {activeView === 'rankings' && (
            <HistoricalRankings 
              season={selectedSeason} 
              compareSeason={compareSeason}
            />
          )}
          {activeView === 'finals' && (
            <FinalsHistory season={selectedSeason} />
          )}
          {activeView === 'onthisday' && (
            <OnThisDay />
          )}
        </div>
      </div>
    </div>
  );
};
