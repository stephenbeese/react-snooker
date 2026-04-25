/**
 * EventList component - Paginated event display with categorization
 */

import { useState, useMemo } from 'react';
import type { Event } from '../../types';
import { EventCard } from '../common/EventCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { categorizeEventsByTour } from '../../utils/eventUtils';

interface EventListProps {
  events: Event[];
  loading: boolean;
  error: Error | null;
  onEventClick?: (event: Event) => void;
  onRetry?: () => void;
}

const EVENTS_PER_PAGE = 12;

export const EventList = ({ 
  events, 
  loading, 
  error, 
  onEventClick,
  onRetry 
}: EventListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categorize events by tour type
  const categorizedEvents = useMemo(() => {
    return categorizeEventsByTour(events);
  }, [events]);

  // Get events for selected category
  const displayEvents = useMemo(() => {
    if (selectedCategory === 'all') {
      return events;
    }
    return categorizedEvents[selectedCategory] || [];
  }, [events, categorizedEvents, selectedCategory]);

  if (loading) {
    return <LoadingSpinner message="Loading events..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error.message || "Unable to load events. Please try again."} 
        onRetry={onRetry}
      />
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-lg">No events found matching your criteria.</p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(displayEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = startIndex + EVENTS_PER_PAGE;
  const currentEvents = displayEvents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of event list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const renderPaginationButton = (page: number, label?: string) => (
    <button
      key={page}
      onClick={() => handlePageChange(page)}
      disabled={page === currentPage}
      className={`px-3 py-2 mx-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        page === currentPage
          ? 'bg-blue-600 text-white cursor-default'
          : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
      }`}
      aria-label={label || `Go to page ${page}`}
      aria-current={page === currentPage ? 'page' : undefined}
    >
      {label || page}
    </button>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    
    // Always show first page
    if (currentPage > 3) {
      pages.push(renderPaginationButton(1));
      if (currentPage > 4) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Show pages around current page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPaginationButton(i));
    }

    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(renderPaginationButton(totalPages));
    }

    return (
      <div className="flex justify-center items-center mt-8 mb-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go to previous page"
        >
          Previous
        </button>
        
        {pages}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Event categories">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedCategory === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={selectedCategory === 'all' ? 'page' : undefined}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => handleCategoryChange('Main Tour')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedCategory === 'Main Tour'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={selectedCategory === 'Main Tour' ? 'page' : undefined}
            >
              Main Tour ({categorizedEvents['Main Tour']?.length || 0})
            </button>
            <button
              onClick={() => handleCategoryChange('Q Tour')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedCategory === 'Q Tour'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={selectedCategory === 'Q Tour' ? 'page' : undefined}
            >
              Q Tour ({categorizedEvents['Q Tour']?.length || 0})
            </button>
            <button
              onClick={() => handleCategoryChange('Amateur')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedCategory === 'Amateur'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={selectedCategory === 'Amateur' ? 'page' : undefined}
            >
              Amateur ({categorizedEvents['Amateur']?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, displayEvents.length)} of {displayEvents.length} events
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </p>
      </div>

      {/* Event grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {currentEvents.map((event) => (
          <EventCard
            key={event.ID}
            event={event}
            onClick={onEventClick ? () => onEventClick(event) : undefined}
          />
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};