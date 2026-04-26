/**
 * EventDetailPage component - Individual event details view
 */

import { useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useEvent, useMatchesByEvent } from '../hooks/useSnookerApi';
import { EventMatches } from '../components/pages/EventMatches';
import { EventStats } from '../components/pages/EventStats';
import { TournamentBracket } from '../components/pages/TournamentBracket';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import type { Event } from '../types';

export const EventDetailPage = () => {
  const { eventId: eventIdParam } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState<'bracket' | 'matches' | 'stats'>('bracket');
  
  // Parse eventId from URL parameter
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;
  
  // Redirect if eventId is invalid
  if (!eventId || isNaN(eventId)) {
    return <Navigate to="/events" replace />;
  }
  
  // Fetch event details and matches
  const { data: event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { data: matches, loading: matchesLoading, error: matchesError } = useMatchesByEvent(eventId);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorMessage
          message="Unable to load event details. Please try again."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const startDate = new Date(event.StartDate).toLocaleDateString();
  const endDate = new Date(event.EndDate).toLocaleDateString();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.Name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Tour:</span>
                <span className="ml-2 text-blue-600 font-medium">{event.Tour}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Dates:</span>
                <span className="ml-2 text-gray-600">{startDate} - {endDate}</span>
              </div>
              {event.Venue && (
                <div>
                  <span className="font-medium text-gray-700">Venue:</span>
                  <span className="ml-2 text-gray-600">{event.Venue}</span>
                </div>
              )}
              {event.Country && (
                <div>
                  <span className="font-medium text-gray-700">Country:</span>
                  <span className="ml-2 text-gray-600">{event.Country}</span>
                </div>
              )}
              {event.Prize_Fund && (
                <div>
                  <span className="font-medium text-gray-700">Prize Fund:</span>
                  <span className="ml-2 text-green-600 font-medium">
                    £{event.Prize_Fund.toLocaleString()}
                  </span>
                </div>
              )}
              {event.Defending_Champion && (
                <div>
                  <span className="font-medium text-gray-700">Defending Champion:</span>
                  <span className="ml-2 text-gray-600">{event.Defending_Champion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Event sections">
            <button
              onClick={() => setActiveTab('bracket')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bracket'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'bracket' ? 'page' : undefined}
            >
              Bracket
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'matches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'matches' ? 'page' : undefined}
            >
              Matches
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'stats' ? 'page' : undefined}
            >
              Statistics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'bracket' && (
            <TournamentBracket
              event={event}
              matches={matches || []}
              loading={matchesLoading}
              error={matchesError}
              onRetry={handleRetry}
              onMatchClick={(match) => {
                console.log('Match clicked:', match);
                // Could navigate to match detail page or show more details
              }}
            />
          )}
          {activeTab === 'matches' && (
            <EventMatches
              eventId={eventId}
              matches={matches || []}
              loading={matchesLoading}
              error={matchesError}
              onRetry={handleRetry}
            />
          )}
          {activeTab === 'stats' && (
            <EventStats
              event={event}
              matches={matches || []}
              loading={matchesLoading}
              error={matchesError}
            />
          )}
        </div>
      </div>
    </div>
  );
};