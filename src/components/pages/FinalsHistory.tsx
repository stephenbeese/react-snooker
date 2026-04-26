/**
 * FinalsHistory component - Display tournament winners for a selected period
 * Shows all finals from major tournaments in the selected season
 */

import { useMemo } from 'react';
import { useEventsBySeason } from '../../hooks/useSnookerApi';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Event } from '../../types';

interface FinalsHistoryProps {
  season: number;
}

export const FinalsHistory = ({ season }: FinalsHistoryProps) => {
  const { data: events, loading, error } = useEventsBySeason(season);

  // Filter for major tournaments (Main Tour events)
  const majorEvents = useMemo(() => {
    if (!events) return [];
    return events
      .filter(event => event.Tour === 'Main Tour')
      .sort((a, b) => {
        const dateA = new Date(a.StartDate).getTime();
        const dateB = new Date(b.StartDate).getTime();
        return dateA - dateB; // Chronological order
      });
  }, [events]);

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    
    majorEvents.forEach(event => {
      const date = new Date(event.StartDate);
      const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    });
    
    return grouped;
  }, [majorEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <LoadingSpinner message={`Loading finals history for ${season}/${season + 1} season...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <ErrorMessage message={error.message || 'Failed to load finals history'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Finals History - {season}/{season + 1}
        </h2>
        <p className="text-gray-600">
          Tournament winners and defending champions from the Main Tour
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            {majorEvents.length} Main Tour Events
          </span>
        </div>
      </div>

      {/* Finals Timeline */}
      {majorEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center text-gray-500">
            <p>No finals history available for this season.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
            <div key={month} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  {month}
                </h3>
                
                <div className="space-y-4">
                  {monthEvents.map((event) => (
                    <div 
                      key={event.ID}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {event.Name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(event.StartDate)} - {formatDate(event.EndDate)}
                            </span>
                            {event.Venue && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {event.Venue}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-start md:items-end gap-2">
                          {event.Defending_Champion && (
                            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-medium text-yellow-800">
                                {event.Defending_Champion}
                              </span>
                            </div>
                          )}
                          {event.Prize_Fund && (
                            <span className="text-sm text-gray-500">
                              Prize: £{event.Prize_Fund.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
