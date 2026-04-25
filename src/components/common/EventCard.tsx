/**
 * EventCard component - Event display card
 */

import type { Event } from '../../types';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const startDate = new Date(event.StartDate).toLocaleDateString();
  const endDate = new Date(event.EndDate).toLocaleDateString();
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      aria-label={`View details for ${event.Name} tournament, ${event.Tour}, from ${startDate} to ${endDate}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.Name}</h3>
      <p className="text-sm font-medium text-blue-600 mb-2">{event.Tour}</p>
      <p className="text-sm text-gray-600 mb-1">
        {startDate} - {endDate}
      </p>
      {event.Venue && <p className="text-sm text-gray-600 mb-1">{event.Venue}</p>}
      {event.Country && <p className="text-sm text-gray-600 mb-1">{event.Country}</p>}
      {event.Prize_Fund && (
        <p className="text-sm font-medium text-green-600">
          Prize Fund: £{event.Prize_Fund.toLocaleString()}
        </p>
      )}
    </div>
  );
};
