/**
 * HistoricalEvents component - Display events from a selected historical season
 * Supports season comparison functionality
 */

import { useMemo } from 'react';
import { useEventsBySeason } from '../../hooks/useSnookerApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EventCard } from '../common/EventCard';
import type { Event } from '../../types';

interface HistoricalEventsProps {
  season: number;
  compareSeason: number | null;
}

export const HistoricalEvents = ({ season, compareSeason }: HistoricalEventsProps) => {
  const { data: events, loading, error } = useEventsBySeason(season);
  const { 
    data: compareEvents, 
    loading: compareLoading, 
    error: compareError 
  } = useEventsBySeason(compareSeason ?? -1);

  // Filter and sort events
  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) => {
      const dateA = new Date(a.StartDate).getTime();
      const dateB = new Date(b.StartDate).getTime();
      return dateB - dateA; // Most recent first
    });
  }, [events]);

  const sortedCompareEvents = useMemo(() => {
    if (!compareEvents || !compareSeason) return [];
    return [...compareEvents].sort((a, b) => {
      const dateA = new Date(a.StartDate).getTime();
      const dateB = new Date(b.StartDate).getTime();
      return dateB - dateA;
    });
  }, [compareEvents, compareSeason]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!events) return null;
    
    const totalEvents = events.length;
    const mainTourEvents = events.filter(e => e.Tour === 'Main Tour').length;
    const qTourEvents = events.filter(e => e.Tour === 'Q Tour').length;
    const amateurEvents = events.filter(e => e.Tour === 'Amateur').length;
    
    return {
      total: totalEvents,
      mainTour: mainTourEvents,
      qTour: qTourEvents,
      amateur: amateurEvents,
    };
  }, [events]);

  const compareStats = useMemo(() => {
    if (!compareEvents || !compareSeason) return null;
    
    const totalEvents = compareEvents.length;
    const mainTourEvents = compareEvents.filter(e => e.Tour === 'Main Tour').length;
    const qTourEvents = compareEvents.filter(e => e.Tour === 'Q Tour').length;
    const amateurEvents = compareEvents.filter(e => e.Tour === 'Amateur').length;
    
    return {
      total: totalEvents,
      mainTour: mainTourEvents,
      qTour: qTourEvents,
      amateur: amateurEvents,
    };
  }, [compareEvents, compareSeason]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingSpinner message={`Loading events for ${season}/${season + 1} season...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <ErrorMessage message={error.message || 'Failed to load historical events'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Section */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Season {season}/{season + 1} Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Events</div>
              {compareStats && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.total > compareStats.total ? '↑' : stats.total < compareStats.total ? '↓' : '→'} 
                  {' '}{Math.abs(stats.total - compareStats.total)} vs {compareSeason}/{compareSeason! + 1}
                </div>
              )}
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.mainTour}</div>
              <div className="text-sm text-gray-600">Main Tour</div>
              {compareStats && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.mainTour > compareStats.mainTour ? '↑' : stats.mainTour < compareStats.mainTour ? '↓' : '→'} 
                  {' '}{Math.abs(stats.mainTour - compareStats.mainTour)} vs {compareSeason}/{compareSeason! + 1}
                </div>
              )}
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.qTour}</div>
              <div className="text-sm text-gray-600">Q Tour</div>
              {compareStats && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.qTour > compareStats.qTour ? '↑' : stats.qTour < compareStats.qTour ? '↓' : '→'} 
                  {' '}{Math.abs(stats.qTour - compareStats.qTour)} vs {compareSeason}/{compareSeason! + 1}
                </div>
              )}
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.amateur}</div>
              <div className="text-sm text-gray-600">Amateur</div>
              {compareStats && (
                <div className="text-xs text-gray-500 mt-1">
                  {stats.amateur > compareStats.amateur ? '↑' : stats.amateur < compareStats.amateur ? '↓' : '→'} 
                  {' '}{Math.abs(stats.amateur - compareStats.amateur)} vs {compareSeason}/{compareSeason! + 1}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Events in {season}/{season + 1}
          </h2>

          {sortedEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No events found for this season.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEvents.map((event) => (
                <EventCard key={event.ID} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Section */}
      {compareSeason && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Events in {compareSeason}/{compareSeason + 1} (Comparison)
            </h2>

            {compareLoading && (
              <LoadingSpinner message={`Loading events for ${compareSeason}/${compareSeason + 1} season...`} />
            )}

            {compareError && (
              <ErrorMessage message={compareError.message || 'Failed to load comparison events'} />
            )}

            {!compareLoading && !compareError && sortedCompareEvents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No events found for this season.</p>
              </div>
            )}

            {!compareLoading && !compareError && sortedCompareEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCompareEvents.map((event) => (
                  <EventCard key={event.ID} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
