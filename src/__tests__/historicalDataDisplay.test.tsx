/**
 * Unit tests for historical data display functionality
 * Tests season selection and data display
 * **Validates: Requirements 11.1, 11.2**
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HistoricalEvents } from '../components/pages/HistoricalEvents';
import { HistoricalRankings } from '../components/pages/HistoricalRankings';
import type { Event, Ranking } from '../types/snooker';

// Mock the hooks
vi.mock('../hooks/useSnookerApi', () => ({
  useEventsBySeason: vi.fn(),
  useRankings: vi.fn(),
}));

import { useEventsBySeason, useRankings } from '../hooks/useSnookerApi';

describe('Historical Data Display Unit Tests', () => {
  
  const mockEvents: Event[] = [
    {
      ID: 1,
      Name: 'World Championship 2023',
      StartDate: '2023-04-15',
      EndDate: '2023-05-01',
      Venue: 'Crucible Theatre',
      Country: 'England',
      Tour: 'Main Tour',
      Sponsor: 'Betfred',
      Prize_Fund: 2395000,
      Defending_Champion: 'Ronnie O\'Sullivan',
      Defending_Champion_ID: 1
    },
    {
      ID: 2,
      Name: 'UK Championship 2023',
      StartDate: '2023-11-25',
      EndDate: '2023-12-03',
      Venue: 'Barbican Centre',
      Country: 'England',
      Tour: 'Main Tour',
      Sponsor: 'Cazoo',
      Prize_Fund: 1000000,
      Defending_Champion: 'Mark Allen',
      Defending_Champion_ID: 2
    },
    {
      ID: 3,
      Name: 'Q School Event 1',
      StartDate: '2023-05-10',
      EndDate: '2023-05-15',
      Venue: 'Ponds Forge',
      Country: 'England',
      Tour: 'Q Tour',
      Prize_Fund: 50000
    }
  ];

  const mockRankings: Ranking[] = [
    {
      Position: 1,
      Player_ID: 1,
      Player_Name: 'Ronnie O\'Sullivan',
      Nationality: 'England',
      Points: 500000,
      Money: 2000000,
      Change: 0
    },
    {
      Position: 2,
      Player_ID: 2,
      Player_Name: 'Judd Trump',
      Nationality: 'England',
      Points: 450000,
      Money: 1800000,
      Change: 1
    },
    {
      Position: 3,
      Player_ID: 3,
      Player_Name: 'Mark Selby',
      Nationality: 'England',
      Points: 400000,
      Money: 1600000,
      Change: -1
    }
  ];

  describe('HistoricalEvents Component', () => {

    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should display events for selected season', async () => {
      // Mock the hook to return events
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: mockEvents,
        loading: false,
        error: null
      });

      render(<HistoricalEvents season={2023} compareSeason={null} />);

      // Wait for events to be displayed
      await waitFor(() => {
        expect(screen.getByText(/Events in 2023\/2024/i)).toBeInTheDocument();
      });

      // Check that events are displayed
      expect(screen.getByText('World Championship 2023')).toBeInTheDocument();
      expect(screen.getByText('UK Championship 2023')).toBeInTheDocument();
    });

    test('should display loading state while fetching events', () => {
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: null,
        loading: true,
        error: null
      });

      render(<HistoricalEvents season={2023} compareSeason={null} />);

      expect(screen.getByText(/Loading events for 2023\/2024 season/i)).toBeInTheDocument();
    });

    test('should display error message when fetch fails', () => {
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to fetch events')
      });

      render(<HistoricalEvents season={2023} compareSeason={null} />);

      expect(screen.getByText(/Failed to fetch events/i)).toBeInTheDocument();
    });

    test('should display statistics for the season', async () => {
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: mockEvents,
        loading: false,
        error: null
      });

      render(<HistoricalEvents season={2023} compareSeason={null} />);

      await waitFor(() => {
        expect(screen.getByText(/Season 2023\/2024 Statistics/i)).toBeInTheDocument();
      });

      // Check statistics
      expect(screen.getByText('3')).toBeInTheDocument(); // Total events
      expect(screen.getByText('Total Events')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Main Tour events
      expect(screen.getAllByText('Main Tour')[0]).toBeInTheDocument(); // Use getAllByText for multiple occurrences
    });

    test('should display comparison data when compareSeason is provided', async () => {
      const compareEvents: Event[] = [
        {
          ID: 4,
          Name: 'World Championship 2022',
          StartDate: '2022-04-16',
          EndDate: '2022-05-02',
          Venue: 'Crucible Theatre',
          Country: 'England',
          Tour: 'Main Tour',
          Prize_Fund: 2395000
        }
      ];

      // Mock both seasons
      vi.mocked(useEventsBySeason)
        .mockReturnValueOnce({
          data: mockEvents,
          loading: false,
          error: null
        })
        .mockReturnValueOnce({
          data: compareEvents,
          loading: false,
          error: null
        });

      render(<HistoricalEvents season={2023} compareSeason={2022} />);

      await waitFor(() => {
        expect(screen.getByText(/Events in 2022\/2023 \(Comparison\)/i)).toBeInTheDocument();
      });
    });

    test('should display empty state when no events found', async () => {
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(<HistoricalEvents season={2023} compareSeason={null} />);

      await waitFor(() => {
        expect(screen.getByText(/No events found for this season/i)).toBeInTheDocument();
      });
    });

    test('should categorize events by tour type correctly', async () => {
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: mockEvents,
        loading: false,
        error: null
      });

      render(<HistoricalEvents season={2023} compareSeason={null} />);

      await waitFor(() => {
        // Check that statistics show correct categorization
        const mainTourCount = screen.getAllByText('2')[0]; // 2 Main Tour events
        const qTourCount = screen.getAllByText('1')[0]; // 1 Q Tour event
        
        expect(mainTourCount).toBeInTheDocument();
        expect(qTourCount).toBeInTheDocument();
      });
    });
  });

  describe('HistoricalRankings Component', () => {

    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should display rankings for selected season', async () => {
      vi.mocked(useRankings).mockReturnValue({
        data: mockRankings,
        loading: false,
        error: null
      });

      render(<HistoricalRankings season={2023} compareSeason={null} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Top 16 Rankings - 2023\/2024/i })).toBeInTheDocument();
      });

      // Check that rankings are displayed - use getAllByText for multiple occurrences
      expect(screen.getAllByText('Ronnie O\'Sullivan')[0]).toBeInTheDocument();
      expect(screen.getByText('Judd Trump')).toBeInTheDocument();
      expect(screen.getByText('Mark Selby')).toBeInTheDocument();
    });

    test('should display loading state while fetching rankings', () => {
      vi.mocked(useRankings).mockReturnValue({
        data: null,
        loading: true,
        error: null
      });

      render(<HistoricalRankings season={2023} compareSeason={null} />);

      expect(screen.getByText(/Loading rankings for 2023\/2024 season/i)).toBeInTheDocument();
    });

    test('should display error message when fetch fails', () => {
      vi.mocked(useRankings).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to fetch rankings')
      });

      render(<HistoricalRankings season={2023} compareSeason={null} />);

      expect(screen.getByText(/Failed to fetch rankings/i)).toBeInTheDocument();
    });

    test('should display statistics for the season', async () => {
      vi.mocked(useRankings).mockReturnValue({
        data: mockRankings,
        loading: false,
        error: null
      });

      render(<HistoricalRankings season={2023} compareSeason={null} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Season 2023\/2024 Statistics/i })).toBeInTheDocument();
      });

      // Check statistics - use getAllByText and check the first occurrence
      const totalPlayersElements = screen.getAllByText('Total Players');
      expect(totalPlayersElements[0]).toBeInTheDocument();
      
      const topPlayerElements = screen.getAllByText('Top Player');
      expect(topPlayerElements[0]).toBeInTheDocument();
    });

    test('should display comparison data when compareSeason is provided', async () => {
      const compareRankings: Ranking[] = [
        {
          Position: 1,
          Player_ID: 2,
          Player_Name: 'Judd Trump',
          Nationality: 'England',
          Points: 480000,
          Money: 1900000,
          Change: 0
        }
      ];

      // Mock both seasons
      vi.mocked(useRankings)
        .mockReturnValueOnce({
          data: mockRankings,
          loading: false,
          error: null
        })
        .mockReturnValueOnce({
          data: compareRankings,
          loading: false,
          error: null
        });

      render(<HistoricalRankings season={2023} compareSeason={2022} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Top 16 Rankings - 2022\/2023 \(Comparison\)/i })).toBeInTheDocument();
      });
    });

    test('should display empty state when no rankings found', async () => {
      vi.mocked(useRankings).mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(<HistoricalRankings season={2023} compareSeason={null} />);

      await waitFor(() => {
        expect(screen.getByText(/No rankings found for this season/i)).toBeInTheDocument();
      });
    });

    test('should display only top 16 rankings', async () => {
      // Create 20 rankings
      const manyRankings: Ranking[] = Array.from({ length: 20 }, (_, i) => ({
        Position: i + 1,
        Player_ID: i + 1,
        Player_Name: `Player ${i + 1}`,
        Nationality: 'England',
        Points: 500000 - (i * 10000),
        Money: 2000000 - (i * 50000),
        Change: 0
      }));

      vi.mocked(useRankings).mockReturnValue({
        data: manyRankings,
        loading: false,
        error: null
      });

      render(<HistoricalRankings season={2023} compareSeason={null} />);

      await waitFor(() => {
        // Should display top 16 only - check in table body rows
        const tbody = screen.getByRole('table').querySelector('tbody');
        const rows = tbody?.querySelectorAll('tr') || [];
        // Should have exactly 16 data rows (top 16 rankings)
        expect(rows.length).toBe(16);
      });
    });

    test('should allow changing ranking type', async () => {
      vi.mocked(useRankings).mockReturnValue({
        data: mockRankings,
        loading: false,
        error: null
      });

      render(<HistoricalRankings season={2023} compareSeason={null} />);

      await waitFor(() => {
        const select = screen.getByLabelText(/Ranking Type/i);
        expect(select).toBeInTheDocument();
      });
    });
  });

  describe('Season Selection', () => {
    test('should correctly format season display (YYYY/YYYY+1)', () => {
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      render(<HistoricalEvents season={2023} compareSeason={null} />);

      // Season should be displayed as 2023/2024 - use getAllByText for multiple occurrences
      expect(screen.getAllByText(/2023\/2024/)[0]).toBeInTheDocument();
    });

    test('should handle different season years correctly', () => {
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: [],
        loading: false,
        error: null
      });

      const { rerender } = render(<HistoricalEvents season={2020} compareSeason={null} />);
      expect(screen.getAllByText(/2020\/2021/)[0]).toBeInTheDocument();

      rerender(<HistoricalEvents season={2015} compareSeason={null} />);
      expect(screen.getAllByText(/2015\/2016/)[0]).toBeInTheDocument();
    });
  });

  describe('Data Accuracy', () => {
    test('should display correct event details', async () => {
      vi.mocked(useEventsBySeason).mockReturnValue({
        data: [mockEvents[0]],
        loading: false,
        error: null
      });

      render(<HistoricalEvents season={2023} compareSeason={null} />);

      await waitFor(() => {
        expect(screen.getByText('World Championship 2023')).toBeInTheDocument();
      });
    });

    test('should display correct ranking details', async () => {
      vi.mocked(useRankings).mockReturnValue({
        data: [mockRankings[0]],
        loading: false,
        error: null
      });

      render(<HistoricalRankings season={2023} compareSeason={null} />);

      await waitFor(() => {
        expect(screen.getAllByText('Ronnie O\'Sullivan')[0]).toBeInTheDocument();
        expect(screen.getByText('England')).toBeInTheDocument();
      });
    });
  });
});
