/**
 * EventCard component - Event display card
 */

import type { Event } from '../../types';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.Name}</h3>
      <p className="text-sm font-medium text-blue-600 mb-2">{event.Tour}</p>
      <p className="text-sm text-gray-600 mb-1">
        {new Date(event.StartDate).toLocaleDateString()} - {new Date(event.EndDate).toLocaleDateString()}
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
