/**
 * EventsPage component - Main events list view with filtering
 */

import { useState, useMemo, useCallback } from 'react';
import { useEventsBySeason } from '../hooks/useSnookerApi';
import { EventList } from '../components/pages/EventList';
import { EventFilters } from '../components/pages/EventFilters';
import { filterEvents, type EventFilterCriteria } from '../utils/eventUtils';
import type { Event } from '../types';

export const EventsPage = () => {
  const [filterCriteria, setFilterCriteria] = useState<EventFilterCriteria>({});
  
  // Fetch all events for current season by default
  const { data: events, loading, error } = useEventsBySeason(-1);

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return filterEvents(events, filterCriteria);
  }, [events, filterCriteria]);

  // Handle filter changes
  const handleFiltersChange = useCallback((criteria: EventFilterCriteria) => {
    setFilterCriteria(criteria);
  }, []);

  // Handle event click (placeholder for navigation to event detail)
  const handleEventClick = useCallback((event: Event) => {
    console.log('Event clicked:', event);
    // TODO: Navigate to event detail page
    // This would typically use React Router: navigate(`/events/${event.ID}`)
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    // The hook will automatically retry when the component re-renders
    window.location.reload();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
        <p className="text-gray-600">
          Browse snooker tournaments and competitions by tour type and season
        </p>
      </div>

      {/* Filters */}
      <EventFilters
        events={events || []}
        onFiltersChange={handleFiltersChange}
        loading={loading}
      />

      {/* Event list */}
      <EventList
        events={filteredEvents}
        loading={loading}
        error={error}
        onEventClick={handleEventClick}
        onRetry={handleRetry}
      />
    </div>
  );
};