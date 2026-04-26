/**
 * Unit Tests for LiveMatchesSection Component
 * Tests live indicator display and auto-refresh functionality
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Match } from '../types';

// Mock the hooks
vi.mock('../hooks/useSnookerApi', () => ({
  useOngoingMatches: vi.fn(),
  clearCacheEntry: vi.fn(),
}));

// Import the mocked hooks
import { useOngoingMatches, clearCacheEntry } from '../hooks/useSnookerApi';

// Import component
import { LiveMatchesSection } from '../components/pages/LiveMatchesSection';

describe('LiveMatchesSection Component', () => {
  const mockLiveMatches: Match[] = [
    {
      ID: 1,
      Event_ID: 100,
      Round_ID: 5,
      Match_Number: 1,
      Player1_ID: 101,
      Player1_Name: 'Ronnie O\'Sullivan',
      Player2_ID: 102,
      Player2_Name: 'John Higgins',
      Player1_Score: 2,
      Player2_Score: 1,
      Status: 'R',
      Date_Time: '2024-04-20T19:00:00Z',
      Session: 1,
      Table: 'Table 1',
    },
    {
      ID: 2,
      Event_ID: 100,
      Round_ID: 5,
      Match_Number: 2,
      Player1_ID: 103,
      Player1_Name: 'Mark Selby',
      Player2_ID: 104,
      Player2_Name: 'Neil Robertson',
      Player1_Score: 1,
      Player2_Score: 2,
      Status: 'R',
      Date_Time: '2024-04-20T19:00:00Z',
      Session: 2,
      Table: 'Table 2',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Loading State', () => {
    it('should display loading spinner when data is loading', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading live matches...')).toBeInTheDocument();
    });

    it('should display "Live Matches" heading during loading', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('Live Matches')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when data fails to load', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to load live matches'),
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('Failed to load live matches')).toBeInTheDocument();
    });

    it('should display default error message when error has no message', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        loading: false,
        error: {},
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('Failed to load live matches')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no live matches (Requirement 4.1)', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('No Live Matches')).toBeInTheDocument();
      expect(screen.getByText('Check back later for live match updates.')).toBeInTheDocument();
    });

    it('should display empty state when data is null', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('No Live Matches')).toBeInTheDocument();
    });
  });

  describe('Live Matches Display', () => {
    it('should display live matches section when matches are in progress (Requirement 4.1)', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('Live Matches')).toBeInTheDocument();
      expect(screen.getByText('2 matches in progress')).toBeInTheDocument();
    });

    it('should display live indicator with visual badge (Requirement 4.2)', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Check for LIVE text indicators
      const liveIndicators = screen.getAllByText('LIVE');
      expect(liveIndicators.length).toBeGreaterThan(0);
    });

    it('should display current score for live matches (Requirement 4.3)', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Check for scores - use getAllByText since scores appear multiple times
      const score2 = screen.getAllByText('2');
      expect(score2.length).toBeGreaterThan(0);
      const score1 = screen.getAllByText('1');
      expect(score1.length).toBeGreaterThan(0);
    });

    it('should display player names for live matches', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('Ronnie O\'Sullivan')).toBeInTheDocument();
      expect(screen.getByText('John Higgins')).toBeInTheDocument();
      expect(screen.getByText('Mark Selby')).toBeInTheDocument();
      expect(screen.getByText('Neil Robertson')).toBeInTheDocument();
    });

    it('should display session information when available (Requirement 4.5)', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('Session: 1')).toBeInTheDocument();
      expect(screen.getByText('Session: 2')).toBeInTheDocument();
    });

    it('should display table information when available', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('Table: Table 1')).toBeInTheDocument();
      expect(screen.getByText('Table: Table 2')).toBeInTheDocument();
    });

    it('should display "Match in progress" indicator', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      const inProgressIndicators = screen.getAllByText('Match in progress');
      expect(inProgressIndicators).toHaveLength(2);
    });

    it('should limit display to 5 matches when more are available', () => {
      const manyMatches: Match[] = Array.from({ length: 10 }, (_, i) => ({
        ID: i + 1,
        Event_ID: 100,
        Round_ID: 5,
        Match_Number: i + 1,
        Player1_ID: 101 + i * 2,
        Player1_Name: `Player ${i * 2 + 1}`,
        Player2_ID: 102 + i * 2,
        Player2_Name: `Player ${i * 2 + 2}`,
        Player1_Score: 1,
        Player2_Score: 0,
        Status: 'R',
        Date_Time: '2024-04-20T19:00:00Z',
      }));

      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: manyMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Should show "View All Live Matches" link
      expect(screen.getByText('View All Live Matches (10) →')).toBeInTheDocument();
    });

    it('should not show "View All" link when 5 or fewer matches', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.queryByText(/View All Live Matches/)).not.toBeInTheDocument();
    });

    it('should display singular "match" when only one match in progress', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [mockLiveMatches[0]],
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('1 match in progress')).toBeInTheDocument();
    });

    it('should handle matches without session information', () => {
      const matchesWithoutSession: Match[] = [
        {
          ...mockLiveMatches[0],
          Session: undefined,
        },
      ];

      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: matchesWithoutSession,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Should still render without crashing
      expect(screen.getByText('Ronnie O\'Sullivan')).toBeInTheDocument();
      expect(screen.queryByText(/Session:/)).not.toBeInTheDocument();
    });

    it('should handle matches without table information', () => {
      const matchesWithoutTable: Match[] = [
        {
          ...mockLiveMatches[0],
          Table: undefined,
        },
      ];

      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: matchesWithoutTable,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Should still render without crashing
      expect(screen.getByText('Ronnie O\'Sullivan')).toBeInTheDocument();
      expect(screen.queryByText(/Table:/)).not.toBeInTheDocument();
    });
  });

  describe('Auto-Refresh Functionality (Requirement 4.4)', () => {
    it('should display auto-refresh indicator message', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      expect(screen.getByText('Live scores update automatically every minute')).toBeInTheDocument();
    });

    it('should set up auto-refresh interval when live matches exist', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Verify that clearCacheEntry is not called immediately
      expect(clearCacheEntry).not.toHaveBeenCalled();

      // Fast-forward time by 1 minute (60000ms)
      vi.advanceTimersByTime(60000);

      // Verify clearCacheEntry was called
      expect(clearCacheEntry).toHaveBeenCalledTimes(1);
    });

    it('should call clearCacheEntry with correct cache key', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Fast-forward time by 1 minute
      vi.advanceTimersByTime(60000);

      expect(clearCacheEntry).toHaveBeenCalledWith('getOngoingMatches:t=7');
    });

    it('should refresh multiple times at configured intervals', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Fast-forward time by 3 minutes
      vi.advanceTimersByTime(180000);

      expect(clearCacheEntry).toHaveBeenCalledTimes(3);
    });

    it('should not set up auto-refresh when no live matches', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      // Fast-forward time by 1 minute
      vi.advanceTimersByTime(60000);

      // clearCacheEntry should not be called
      expect(clearCacheEntry).not.toHaveBeenCalled();
    });

    it('should clean up interval on component unmount', async () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      const { unmount } = render(<LiveMatchesSection />);

      // Unmount the component
      unmount();

      // Fast-forward time by 1 minute
      vi.advanceTimersByTime(60000);

      // clearCacheEntry should not be called after unmount
      expect(clearCacheEntry).not.toHaveBeenCalled();
    });

    it('should use custom refresh interval when provided', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      // Use 30 second refresh interval
      render(<LiveMatchesSection refreshInterval={30000} />);

      // Fast-forward time by 30 seconds
      vi.advanceTimersByTime(30000);

      expect(clearCacheEntry).toHaveBeenCalledTimes(1);

      // Fast-forward another 30 seconds
      vi.advanceTimersByTime(30000);

      expect(clearCacheEntry).toHaveBeenCalledTimes(2);
    });

    it('should restart interval when live matches change', () => {
      const { rerender } = render(<LiveMatchesSection />);

      // Initially no matches
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        loading: false,
        error: null,
      });

      rerender(<LiveMatchesSection />);

      // Fast-forward time
      vi.advanceTimersByTime(60000);

      // Should not have called clearCacheEntry
      expect(clearCacheEntry).not.toHaveBeenCalled();

      // Now add live matches
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      rerender(<LiveMatchesSection />);

      // Fast-forward time by 1 minute
      vi.advanceTimersByTime(60000);

      // Now it should have called clearCacheEntry
      expect(clearCacheEntry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className when provided', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      const { container } = render(<LiveMatchesSection className="custom-class" />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });

    it('should have proper section structure', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      const { container } = render(<LiveMatchesSection />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-200');
    });

    it('should display red border for live match indicators', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      const { container } = render(<LiveMatchesSection />);

      const liveBorders = container.querySelectorAll('.border-red-500');
      expect(liveBorders.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockLiveMatches,
        loading: false,
        error: null,
      });

      render(<LiveMatchesSection />);

      const heading = screen.getByRole('heading', { name: /Live Matches/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible loading state', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<LiveMatchesSection />);

      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toBeInTheDocument();
    });

    it('should have accessible error state', () => {
      (useOngoingMatches as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to load'),
      });

      render(<LiveMatchesSection />);

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
    });
  });
});
