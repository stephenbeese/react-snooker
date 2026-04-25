/**
 * HomePage component - Main landing page
 * Displays watchlist, live matches, upcoming matches, featured events and recent results
 */

import React from 'react';
import { WatchlistSection } from '../components/pages/WatchlistSection';
import { LiveMatchesSection } from '../components/pages/LiveMatchesSection';
import { UpcomingMatchesSection } from '../components/pages/UpcomingMatchesSection';
import { useEventsBySeason, useRecentResults } from '../hooks/useSnookerApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EventCard } from '../components/common/EventCard';
import { MatchResult } from '../components/common/MatchResult';

export const HomePage = () => {
  const { data: events, loading: eventsLoading, error: eventsError } = useEventsBySeason();
  const { data: recentResults, loading: resultsLoading, error: resultsError } = useRecentResults(7); // Last 7 days

  // Get featured events (first 3 events)
  const featuredEvents = React.useMemo(() => {
    if (!events) return [];
    return events.slice(0, 3);
  }, [events]);

  // Get recent results (first 5)
  const recentMatchResults = React.useMemo(() => {
    if (!recentResults) return [];
    return recentResults.slice(0, 5);
  }, [recentResults]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Snooker Results
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Your comprehensive source for snooker tournaments, player statistics, 
              live matches, and personalized player tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Watchlist */}
          <div className="lg:col-span-1">
            <WatchlistSection className="mb-8" />
          </div>

          {/* Middle Column - Live Matches and Upcoming */}
          <div className="lg:col-span-1 space-y-8">
            <LiveMatchesSection />
            <UpcomingMatchesSection />
          </div>

          {/* Right Column - Featured Events and Recent Results */}
          <div className="lg:col-span-1 space-y-8">
            {/* Featured Events Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Featured Events</h2>
                  <a 
                    href="/events" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                  >
                    View All Events →
                  </a>
                </div>

                {eventsLoading && (
                  <LoadingSpinner message="Loading featured events..." />
                )}

                {eventsError && (
                  <ErrorMessage 
                    message={eventsError.message || 'Failed to load featured events'} 
                  />
                )}

                {!eventsLoading && !eventsError && featuredEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No featured events available.</p>
                  </div>
                )}

                {!eventsLoading && !eventsError && featuredEvents.length > 0 && (
                  <div className="space-y-4">
                    {featuredEvents.map((event) => (
                      <EventCard key={event.ID} event={event} />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Recent Results Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
                  <a 
                    href="/results" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                  >
                    View All Results →
                  </a>
                </div>

                {resultsLoading && (
                  <LoadingSpinner message="Loading recent results..." />
                )}

                {resultsError && (
                  <ErrorMessage 
                    message={resultsError.message || 'Failed to load recent results'} 
                  />
                )}

                {!resultsLoading && !resultsError && recentMatchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent results available.</p>
                  </div>
                )}

                {!resultsLoading && !resultsError && recentMatchResults.length > 0 && (
                  <div className="space-y-3">
                    {recentMatchResults.map((match) => (
                      <MatchResult key={match.ID} match={match} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Quick Navigation Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Explore Snooker Data
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a 
                href="/players" 
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Players</span>
              </a>

              <a 
                href="/events" 
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200 group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Events</span>
              </a>

              <a 
                href="/rankings" 
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors duration-200 group"
              >
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-yellow-200">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Rankings</span>
              </a>

              <a 
                href="/head-to-head" 
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200 group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">H2H</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
