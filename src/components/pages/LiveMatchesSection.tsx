/**
 * LiveMatchesSection component - Displays live matches for home page
 * Shows currently ongoing matches with live indicators
 */

import React from 'react';
import { useOngoingMatches } from '../../hooks/useSnookerApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { MatchResult } from '../common/MatchResult';

interface LiveMatchesSectionProps {
  className?: string;
}

export const LiveMatchesSection: React.FC<LiveMatchesSectionProps> = ({ className = '' }) => {
  const { data: liveMatches, loading, error } = useOngoingMatches();

  if (loading) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Matches</h2>
          <LoadingSpinner message="Loading live matches..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Matches</h2>
          <ErrorMessage 
            message={error.message || 'Failed to load live matches'} 
          />
        </div>
      </section>
    );
  }

  if (!liveMatches || liveMatches.length === 0) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Matches</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium text-gray-600 mb-2">No Live Matches</p>
            <p className="text-sm">Check back later for live match updates.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 mr-3">Live Matches</h2>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-red-600 font-medium">LIVE</span>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} in progress
          </span>
        </div>

        <div className="space-y-4">
          {liveMatches.slice(0, 5).map((match) => (
            <div key={match.ID} className="relative">
              {/* Live indicator overlay */}
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
                  LIVE
                </div>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <MatchResult match={match} />
                
                {/* Additional live match info */}
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  {match.Session && (
                    <p>Session: {match.Session}</p>
                  )}
                  {match.Table && (
                    <p>Table: {match.Table}</p>
                  )}
                  <p className="text-red-600 font-medium">Match in progress</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {liveMatches.length > 5 && (
          <div className="mt-4 text-center">
            <a 
              href="/live" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
            >
              View All Live Matches ({liveMatches.length}) →
            </a>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Live scores update automatically every minute
          </p>
        </div>
      </div>
    </section>
  );
};