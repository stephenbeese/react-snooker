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
    <div className="event-card" onClick={onClick}>
      <h3>{event.Name}</h3>
      <p className="tour">{event.Tour}</p>
      <p className="dates">
        {event.StartDate} - {event.EndDate}
      </p>
      {event.Venue && <p className="venue">{event.Venue}</p>}
      {event.Country && <p className="country">{event.Country}</p>}
      {event.Prize_Fund && (
        <p className="prize">Prize Fund: £{event.Prize_Fund.toLocaleString()}</p>
      )}
    </div>
  );
};
