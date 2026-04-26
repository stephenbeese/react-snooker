/**
 * HistoricalRankings component - Display rankings from a selected historical season
 * Supports season comparison functionality
 */

import { useState, useMemo } from 'react';
import { useRankings } from '../../hooks/useSnookerApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { RankingRow } from '../common/RankingRow';
import type { Ranking, RankingType } from '../../types';

interface HistoricalRankingsProps {
  season: number;
  compareSeason: number | null;
}

export const HistoricalRankings = ({ season, compareSeason }: HistoricalRankingsProps) => {
  const [rankingType, setRankingType] = useState<RankingType>('WorldRankings');
  
  const { data: rankings, loading, error } = useRankings(rankingType, season);
  const { 
    data: compareRankings, 
    loading: compareLoading, 
    error: compareError 
  } = useRankings(rankingType, compareSeason ?? 2024);

  // Get top 16 rankings
  const topRankings = useMemo(() => {
    if (!rankings) return [];
    return rankings.slice(0, 16);
  }, [rankings]);

  const topCompareRankings = useMemo(() => {
    if (!compareRankings || !compareSeason) return [];
    return compareRankings.slice(0, 16);
  }, [compareRankings, compareSeason]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!rankings || rankings.length === 0) return null;
    
    const totalPlayers = rankings.length;
    const topPlayer = rankings[0];
    const totalPoints = rankings.reduce((sum, r) => sum + (r.Points || 0), 0);
    const avgPoints = totalPoints / totalPlayers;
    
    return {
      totalPlayers,
      topPlayer: topPlayer?.Player_Name || 'N/A',
      topPoints: topPlayer?.Points || 0,
      avgPoints: Math.round(avgPoints),
    };
  }, [rankings]);

  const compareStatsData = useMemo(() => {
    if (!compareRankings || !compareSeason || compareRankings.length === 0) return null;
    
    const totalPlayers = compareRankings.length;
    const topPlayer = compareRankings[0];
    const totalPoints = compareRankings.reduce((sum, r) => sum + (r.Points || 0), 0);
    const avgPoints = totalPoints / totalPlayers;
    
    return {
      totalPlayers,
      topPlayer: topPlayer?.Player_Name || 'N/A',
      topPoints: topPlayer?.Points || 0,
      avgPoints: Math.round(avgPoints),
    };
  }, [compareRankings, compareSeason]);

  const handleRankingTypeChange = (newType: RankingType) => {
    setRankingType(newType);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingSpinner message={`Loading rankings for ${season}/${season + 1} season...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <ErrorMessage message={error.message || 'Failed to load historical rankings'} />
      </div>
    );
  }

  const showMoney = rankingType === 'MoneyRankings' || 
                    rankingType === 'OneYearMoney' || 
                    rankingType === 'TwoYearMoney';

  return (
    <div className="space-y-6">
      {/* Ranking Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label htmlFor="ranking-type" className="block text-sm font-medium text-gray-700 mb-2">
          Ranking Type:
        </label>
        <select
          id="ranking-type"
          value={rankingType}
          onChange={(e) => handleRankingTypeChange(e.target.value as RankingType)}
          className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
        >
          <option value="WorldRankings">World Rankings</option>
          <option value="MoneyRankings">Money Rankings</option>
          <option value="OneYearMoney">One Year Money</option>
          <option value="TwoYearMoney">Two Year Money</option>
        </select>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Season {season}/{season + 1} Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPlayers}</div>
              <div className="text-sm text-gray-600">Total Players</div>
              {compareStatsData && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.totalPlayers > compareStatsData.totalPlayers ? '↑' : stats.totalPlayers < compareStatsData.totalPlayers ? '↓' : '→'} 
                  {' '}{Math.abs(stats.totalPlayers - compareStatsData.totalPlayers)} vs {compareSeason}/{compareSeason! + 1}
                </div>
              )}
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-lg font-bold text-green-600 truncate">{stats.topPlayer}</div>
              <div className="text-sm text-gray-600">Top Player</div>
              {compareStatsData && (
                <div className="text-xs text-gray-500 mt-1 truncate">
                  vs {compareStatsData.topPlayer}
                </div>
              )}
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.topPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Top Points</div>
              {compareStatsData && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.topPoints > compareStatsData.topPoints ? '↑' : stats.topPoints < compareStatsData.topPoints ? '↓' : '→'} 
                  {' '}{Math.abs(stats.topPoints - compareStatsData.topPoints).toLocaleString()}
                </div>
              )}
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.avgPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Avg Points</div>
              {compareStatsData && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.avgPoints > compareStatsData.avgPoints ? '↑' : stats.avgPoints < compareStatsData.avgPoints ? '↓' : '→'} 
                  {' '}{Math.abs(stats.avgPoints - compareStatsData.avgPoints).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Top 16 Rankings - {season}/{season + 1}
          </h2>

          {topRankings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No rankings found for this season.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nationality
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    {showMoney && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Money
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topRankings.map((ranking) => (
                    <RankingRow 
                      key={ranking.Player_ID} 
                      ranking={ranking} 
                      showMoney={showMoney}
                      onClick={() => {}}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Section */}
      {compareSeason && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Top 16 Rankings - {compareSeason}/{compareSeason + 1} (Comparison)
            </h2>

            {compareLoading && (
              <LoadingSpinner message={`Loading rankings for ${compareSeason}/${compareSeason + 1} season...`} />
            )}

            {compareError && (
              <ErrorMessage message={compareError.message || 'Failed to load comparison rankings'} />
            )}

            {!compareLoading && !compareError && topCompareRankings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No rankings found for this season.</p>
              </div>
            )}

            {!compareLoading && !compareError && topCompareRankings.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nationality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      {showMoney && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Money
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topCompareRankings.map((ranking) => (
                      <RankingRow 
                        key={ranking.Player_ID} 
                        ranking={ranking} 
                        showMoney={showMoney}
                        onClick={() => {}}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
