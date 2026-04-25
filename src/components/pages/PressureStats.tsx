/**
 * PressureStats component - Displays pressure situation performance analytics
 * Shows deciding frames and comeback match statistics for a player
 */

import { useMemo } from 'react';
import type { Match } from '../../types/snooker';
import { calculatePressurePerformance, getPressureSituationsByType, getPressurePerformanceSummary } from '../../utils/performanceUtils';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface PressureStatsProps {
  matches: Match[];
  playerId: number;
  playerName: string;
  loading: boolean;
  error: Error | null;
}

export const PressureStats = ({
  matches,
  playerId,
  playerName,
  loading,
  error
}: PressureStatsProps) => {
  // Calculate pressure performance
  const pressurePerformance = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    return calculatePressurePerformance(matches, playerId);
  }, [matches, playerId]);

  // Get situation breakdowns
  const decidingSituations = useMemo(() => {
    if (!pressurePerformance) return [];
    return getPressureSituationsByType(pressurePerformance, 'deciding_frame');
  }, [pressurePerformance]);

  const comebackSituations = useMemo(() => {
    if (!pressurePerformance) return [];
    return getPressureSituationsByType(pressurePerformance, 'comeback_match');
  }, [pressurePerformance]);

  const performanceSummary = useMemo(() => {
    if (!pressurePerformance) return '';
    return getPressurePerformanceSummary(pressurePerformance);
  }, [pressurePerformance]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pressure Situation Performance</h2>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pressure Situation Performance</h2>
        <ErrorMessage message="Unable to load pressure statistics." />
      </div>
    );
  }

  if (!pressurePerformance || pressurePerformance.totalPressureSituations === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pressure Situation Performance</h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600">No pressure situations recorded for {playerName}</p>
          <p className="text-sm text-gray-500 mt-1">
            Pressure situations include deciding frames and comeback matches
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Pressure Situation Performance</h2>
      
      {/* Overall Performance Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Performance Summary</h3>
        <p className="text-blue-800">{performanceSummary}</p>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overall Pressure Performance */}
        <div className="text-center">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {pressurePerformance.pressureWinPercentage}%
            </div>
            <div className="text-sm text-gray-600">Overall Pressure Win Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {pressurePerformance.pressureSituationsWon}/{pressurePerformance.totalPressureSituations} situations
            </div>
          </div>
        </div>

        {/* Deciding Frames */}
        <div className="text-center">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {pressurePerformance.decidingFrames.winPercentage}%
            </div>
            <div className="text-sm text-gray-600">Deciding Frames</div>
            <div className="text-xs text-gray-500 mt-1">
              {pressurePerformance.decidingFrames.won}/{pressurePerformance.decidingFrames.total} frames
            </div>
          </div>
        </div>

        {/* Comeback Matches */}
        <div className="text-center">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {pressurePerformance.comebackMatches.winPercentage}%
            </div>
            <div className="text-sm text-gray-600">Comeback Matches</div>
            <div className="text-xs text-gray-500 mt-1">
              {pressurePerformance.comebackMatches.won}/{pressurePerformance.comebackMatches.total} matches
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deciding Frames Details */}
        {pressurePerformance.decidingFrames.total > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Deciding Frames ({pressurePerformance.decidingFrames.total})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {decidingSituations.slice(0, 10).map((situation, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1 mr-2">
                    {situation.description}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    situation.playerWon 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {situation.playerWon ? 'Won' : 'Lost'}
                  </span>
                </div>
              ))}
              {decidingSituations.length > 10 && (
                <div className="text-xs text-gray-500 text-center pt-2">
                  ... and {decidingSituations.length - 10} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comeback Matches Details */}
        {pressurePerformance.comebackMatches.total > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Comeback Matches ({pressurePerformance.comebackMatches.total})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comebackSituations.slice(0, 10).map((situation, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1 mr-2">
                    {situation.description}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    Won
                  </span>
                </div>
              ))}
              {comebackSituations.length > 10 && (
                <div className="text-xs text-gray-500 text-center pt-2">
                  ... and {comebackSituations.length - 10} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Performance Insights</h3>
        <div className="text-sm text-gray-700 space-y-1">
          {pressurePerformance.pressureWinPercentage >= 70 && (
            <p>• Excellent under pressure - consistently performs well in crucial moments</p>
          )}
          {pressurePerformance.pressureWinPercentage >= 50 && pressurePerformance.pressureWinPercentage < 70 && (
            <p>• Good pressure performance - handles crucial situations reasonably well</p>
          )}
          {pressurePerformance.pressureWinPercentage < 50 && pressurePerformance.totalPressureSituations >= 5 && (
            <p>• Room for improvement in pressure situations - may benefit from mental game work</p>
          )}
          {pressurePerformance.decidingFrames.winPercentage > pressurePerformance.comebackMatches.winPercentage && (
            <p>• Stronger in deciding frames than comeback scenarios</p>
          )}
          {pressurePerformance.comebackMatches.winPercentage > pressurePerformance.decidingFrames.winPercentage && (
            <p>• Shows resilience - better at mounting comebacks than winning deciding frames</p>
          )}
          {pressurePerformance.totalPressureSituations < 5 && (
            <p>• Limited pressure situation data - more matches needed for reliable analysis</p>
          )}
        </div>
      </div>
    </div>
  );
};