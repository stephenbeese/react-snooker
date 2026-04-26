/**
 * Unit Tests for Event Detail Display Components
 * Tests correct display of event information
 * 
 * **Validates: Requirements 2.3**
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventDetailPage } from '../pages/EventDetailPage';
import { EventMatches } from '../components/pages/EventMatches';
import { EventStats } from '../components/pages/EventStats';
import type { Event, Match } from '../types';

// Mock the hooks
vi.mock('../hooks/useSnookerApi', () => ({
  useEvent: vi.fn(),
  useMatchesByEvent: vi.fn(),
}));

// Import the mocked hooks
import { useEvent, useMatchesByEvent } from '../hooks/useSnookerApi';

describe('Event Detail Display Components', () => {
  const mockEvent: Event = {
    ID: 1,
    Name: 'World Championship 2024',
    StartDate: '2024-04-20',
    EndDate: '2024-05-06',
    Venue: 'Crucible Theatre',
    Country: 'England',
    Tour: 'Main Tour',
    Sponsor: 'Betfred',
    Prize_Fund: 2395000,
    Defending_Champion: 'Luca Brecel',
    Defending_Champion_ID: 123
  };

  const mockMatches: Match[] = [
    {
      ID: 1,
      Event_ID: 1,
      Round_ID: 1,
      Match_Number: 1,
      Player1_ID: 101,
      Player1_Name: 'Ronnie O\'Sullivan',
      Player2_ID: 102,
      Player2_Name: 'John Higgins',
      Player1_Score: 13,
      Player2_Score: 7,
      Status: 'R',
      Date_Time: '2024-04-20T19:00:00Z',
      Session: 1,
      Table: 'Table 1',
      Duration: '180'
    },
    {
      ID: 2,
      Event_ID: 1,
      Round_ID: 1,
      Match_Number: 2,
      Player1_ID: 103,
      Player1_Name: 'Mark Selby',
      Player2_ID: 104,
      Player2_Name: 'Neil Robertson',
      Player1_Score: 0,
      Player2_Score: 0,
      Status: 'U',
      Date_Time: '2024-04-21T14:30:00Z',
      Session: 2,
      Table: 'Table 2'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EventDetailPage', () => {
    it('should display event name correctly', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: mockMatches,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByText('World Championship 2024')).toBeInTheDocument();
    });

    it('should display event dates correctly', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: mockMatches,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      // Check for formatted dates
      expect(screen.getByText(/4\/20\/2024 - 5\/6\/2024/)).toBeInTheDocument();
    });

    it('should display venue information', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: mockMatches,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByText('Crucible Theatre')).toBeInTheDocument();
    });

    it('should display prize fund correctly formatted', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: mockMatches,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByText('£2,395,000')).toBeInTheDocument();
    });

    it('should display defending champion', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: mockMatches,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByText('Luca Brecel')).toBeInTheDocument();
    });

    it('should display tour type', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: mockMatches,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByText('Main Tour')).toBeInTheDocument();
    });

    it('should show loading state when event is loading', () => {
      (useEvent as any).mockReturnValue({
        data: null,
        loading: true,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: null,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error message when event fails to load', () => {
      (useEvent as any).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to load event')
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: null,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByText('Unable to load event details. Please try again.')).toBeInTheDocument();
    });

    it('should switch between tabs correctly', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: mockMatches,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      // Initially should show matches tab
      expect(screen.getByText('Matches')).toHaveAttribute('aria-current', 'page');

      // Click on statistics tab
      fireEvent.click(screen.getByText('Statistics'));
      expect(screen.getByText('Statistics')).toHaveAttribute('aria-current', 'page');
    });

    it('should handle missing optional fields gracefully', () => {
      const eventWithoutOptionalFields: Event = {
        ID: 1,
        Name: 'Test Event',
        StartDate: '2024-01-01',
        EndDate: '2024-01-15',
        Tour: 'Q Tour'
      };

      (useEvent as any).mockReturnValue({
        data: eventWithoutOptionalFields,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Q Tour')).toBeInTheDocument();
      // Should not crash when optional fields are missing
    });
  });

  describe('EventMatches', () => {
    it('should display completed matches count', () => {
      render(
        <EventMatches
          eventId={1}
          matches={mockMatches}
          loading={false}
          error={null}
          onRetry={() => {}}
        />
      );

      expect(screen.getByText('Completed Matches (1)')).toBeInTheDocument();
    });

    it('should display upcoming matches count', () => {
      render(
        <EventMatches
          eventId={1}
          matches={mockMatches}
          loading={false}
          error={null}
          onRetry={() => {}}
        />
      );

      expect(screen.getByText('Upcoming Matches (1)')).toBeInTheDocument();
    });

    it('should display match summary statistics', () => {
      render(
        <EventMatches
          eventId={1}
          matches={mockMatches}
          loading={false}
          error={null}
          onRetry={() => {}}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument(); // Total matches
      expect(screen.getByText('Total Matches')).toBeInTheDocument();
    });

    it('should show no matches message when empty', () => {
      render(
        <EventMatches
          eventId={1}
          matches={[]}
          loading={false}
          error={null}
          onRetry={() => {}}
        />
      );

      expect(screen.getByText('No matches found for this event.')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(
        <EventMatches
          eventId={1}
          matches={[]}
          loading={true}
          error={null}
          onRetry={() => {}}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error state with retry button', () => {
      const mockRetry = vi.fn();
      
      render(
        <EventMatches
          eventId={1}
          matches={[]}
          loading={false}
          error={new Error('Failed to load matches')}
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText('Unable to load event matches. Please try again.')).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledOnce();
    });
  });

  describe('EventStats', () => {
    it('should display participant count', () => {
      render(
        <EventStats
          event={mockEvent}
          matches={mockMatches}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('4')).toBeInTheDocument(); // 4 unique players
      expect(screen.getByText('Participants')).toBeInTheDocument();
    });

    it('should display total matches count', () => {
      render(
        <EventStats
          event={mockEvent}
          matches={mockMatches}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument(); // Total matches
      expect(screen.getByText('Total Matches')).toBeInTheDocument();
    });

    it('should display total frames count', () => {
      render(
        <EventStats
          event={mockEvent}
          matches={mockMatches}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('20')).toBeInTheDocument(); // 13 + 7 = 20 frames from completed match
      expect(screen.getByText('Total Frames')).toBeInTheDocument();
    });

    it('should show completion progress', () => {
      render(
        <EventStats
          event={mockEvent}
          matches={mockMatches}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('1 of 2 matches')).toBeInTheDocument();
      expect(screen.getByText('1 completed')).toBeInTheDocument();
      expect(screen.getByText('1 remaining')).toBeInTheDocument();
    });

    it('should display top performers table', () => {
      const manyMatches: Match[] = [
        ...mockMatches,
        {
          ID: 3,
          Event_ID: 1,
          Round_ID: 2,
          Match_Number: 1,
          Player1_ID: 101,
          Player1_Name: 'Ronnie O\'Sullivan',
          Player2_ID: 105,
          Player2_Name: 'Judd Trump',
          Player1_Score: 6,
          Player2_Score: 4,
          Status: 'R',
          Date_Time: '2024-04-22T19:00:00Z'
        }
      ];

      render(
        <EventStats
          event={mockEvent}
          matches={manyMatches}
          loading={false}
          error={null}
        />
      );

      expect(screen.getByText('Top Performers')).toBeInTheDocument();
      // Use getAllByText to handle multiple instances of the same name
      const ronnieElements = screen.getAllByText('Ronnie O\'Sullivan');
      expect(ronnieElements.length).toBeGreaterThan(0);
    });

    it('should handle empty matches gracefully', () => {
      render(
        <EventStats
          event={mockEvent}
          matches={[]}
          loading={false}
          error={null}
        />
      );

      // Check for specific sections instead of just "0"
      expect(screen.getByText('Participants')).toBeInTheDocument();
      expect(screen.getByText('Total Matches')).toBeInTheDocument();
      expect(screen.getByText('Total Frames')).toBeInTheDocument();
      // Check that there are multiple zeros displayed
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });

    it('should show loading state', () => {
      render(
        <EventStats
          event={mockEvent}
          matches={[]}
          loading={true}
          error={null}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error state', () => {
      render(
        <EventStats
          event={mockEvent}
          matches={[]}
          loading={false}
          error={new Error('Failed to load stats')}
        />
      );

      expect(screen.getByText('Unable to load event statistics.')).toBeInTheDocument();
    });
  });

  describe('Event Information Display Requirements', () => {
    it('should display all required event information fields', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: mockMatches,
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      // Verify all required fields from Requirements 2.3 are displayed
      expect(screen.getByText('World Championship 2024')).toBeInTheDocument(); // Event name
      expect(screen.getByText(/4\/20\/2024 - 5\/6\/2024/)).toBeInTheDocument(); // Dates
      expect(screen.getByText('Crucible Theatre')).toBeInTheDocument(); // Venue
      expect(screen.getByText('£2,395,000')).toBeInTheDocument(); // Prize fund
      expect(screen.getByText('Luca Brecel')).toBeInTheDocument(); // Defending champion
    });

    it('should format prize fund with proper currency and thousands separators', () => {
      const eventWithLargePrizeFund: Event = {
        ...mockEvent,
        Prize_Fund: 1500000
      };

      (useEvent as any).mockReturnValue({
        data: eventWithLargePrizeFund,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      expect(screen.getByText('£1,500,000')).toBeInTheDocument();
    });

    it('should format dates in readable format', () => {
      (useEvent as any).mockReturnValue({
        data: mockEvent,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      // Should display dates in MM/DD/YYYY format (or locale-specific)
      const dateText = screen.getByText(/4\/20\/2024 - 5\/6\/2024/);
      expect(dateText).toBeInTheDocument();
    });

    it('should handle events without defending champion gracefully', () => {
      const eventWithoutChampion: Event = {
        ...mockEvent,
        Defending_Champion: undefined,
        Defending_Champion_ID: undefined
      };

      (useEvent as any).mockReturnValue({
        data: eventWithoutChampion,
        loading: false,
        error: null
      });
      (useMatchesByEvent as any).mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(<EventDetailPage eventId={1} />);

      // Should still render without crashing
      expect(screen.getByText('World Championship 2024')).toBeInTheDocument();
      // Defending champion section should not appear
      expect(screen.queryByText('Defending Champion:')).not.toBeInTheDocument();
    });
  });
});