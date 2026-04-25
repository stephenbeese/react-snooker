/**
 * UpcomingMatchesSection component - Displays upcoming matches for home page
 * Shows scheduled matches ordered by date
 */

import React from 'react';
import { useUpcomingMatches } from '../../hooks/useSnookerApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { MatchResult } from '../common/MatchResult';

interface UpcomingMatchesSectionProps {
  className?: string;
}

export const UpcomingMatchesSection: React.FC<UpcomingMatchesSectionProps> = ({ className = '' }) => {
  const { data: upcomingMatches, loading, error } = useUpcomingMatches();

  if (loading) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Matches</h2>
          <LoadingSpinner message="Loading upcoming matches..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Matches</h2>
          <ErrorMessage 
            message={error.message || 'Failed to load upcoming matches'} 
          />
        </div>
      </section>
    );
  }

  if (!upcomingMatches || upcomingMatches.length === 0) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Matches</h2>
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium text-gray-600 mb-2">No Upcoming Matches</p>
            <p className="text-sm">Check back later for scheduled matches.</p>
          </div>
        </div>
      </section>
    );
  }

  // Sort matches by date (earliest first)
  const sortedMatches = React.useMemo(() => {
    return [...upcomingMatches].sort((a, b) => {
      if (!a.Date_Time && !b.Date_Time) return 0;
      if (!a.Date_Time) return 1;
      if (!b.Date_Time) return -1;
      return new Date(a.Date_Time).getTime() - new Date(b.Date_Time).getTime();
    });
  }, [upcomingMatches]);

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Matches</h2>
          <span className="text-sm text-gray-500">
            {upcomingMatches.length} match{upcomingMatches.length !== 1 ? 'es' : ''} scheduled
          </span>
        </div>

        <div className="space-y-4">
          {sortedMatches.slice(0, 5).map((match) => (
            <div key={match.ID} className="relative">
              {/* Upcoming indicator */}
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  SCHEDULED
                </div>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <MatchResult match={match} />
                
                {/* Additional upcoming match info */}
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  {match.Date_Time && (
                    <p>
                      <span className="font-medium">Scheduled:</span>{' '}
                      {new Date(match.Date_Time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  {match.Session && (
                    <p>
                      <span className="font-medium">Session:</span> {match.Session}
                    </p>
                  )}
                  {match.Table && (
                    <p>
                      <span className="font-medium">Table:</span> {match.Table}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {upcomingMatches.length > 5 && (
          <div className="mt-4 text-center">
            <a 
              href="/upcoming" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
            >
              View All Upcoming Matches ({upcomingMatches.length}) →
            </a>
          </div>
        )}

        {/* Last updated indicator */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Schedule updates automatically
          </p>
        </div>
      </div>
    </section>
  );
};