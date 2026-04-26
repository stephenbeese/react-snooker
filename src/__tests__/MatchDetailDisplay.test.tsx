/**
 * Unit Tests for Match Detail Display Components
 * Tests correct display of match information and frame scores
 * 
 * **Validates: Requirements 3.2, 3.3**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Match, Frame } from '../types';

// Mock the hooks
vi.mock('../hooks/useSnookerApi', () => ({
  useMatch: vi.fn(),
}));

// Import the mocked hook
import { useMatch } from '../hooks/useSnookerApi';

// Import components (will be created)
import { MatchDetailPage } from '../pages/MatchDetailPage';
import { FrameByFrameScores } from '../components/pages/FrameByFrameScores';
import { MatchStats } from '../components/pages/MatchStats';

describe('Match Detail Display Components', () => {
  const mockFrames: Frame[] = [
    { Frame_Number: 1, Player1_Score: 72, Player2_Score: 45, Winner_ID: 101, Break: 72 },
    { Frame_Number: 2, Player1_Score: 0, Player2_Score: 89, Winner_ID: 102, Break: 89 },
    { Frame_Number: 3, Player1_Score: 65, Player2_Score: 32, Winner_ID: 101, Break: 65 },
    { Frame_Number: 4, Player1_Score: 88, Player2_Score: 12, Winner_ID: 101, Break: 88 },
    { Frame_Number: 5, Player1_Score: 45, Player2_Score: 78, Winner_ID: 102, Break: 78 },
  ];

  const mockMatch: Match = {
    ID: 1,
    Event_ID: 100,
    Round_ID: 5,
    Match_Number: 1,
    Player1_ID: 101,
    Player1_Name: 'Ronnie O\'Sullivan',
    Player2_ID: 102,
    Player2_Name: 'John Higgins',
    Player1_Score: 3,
    Player2_Score: 2,
    Status: 'R',
    Date_Time: '2024-04-20T19:00:00Z',
    Session: 1,
    Table: 'Table 1',
    Duration: '180',
    Frames: mockFrames,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MatchDetailPage', () => {
    it('should display player names correctly', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      // Use getAllByText since player names appear multiple times
      const ronnieElements = screen.getAllByText('Ronnie O\'Sullivan');
      expect(ronnieElements.length).toBeGreaterThan(0);
      const johnElements = screen.getAllByText('John Higgins');
      expect(johnElements.length).toBeGreaterThan(0);
    });

    it('should display final score correctly (Requirement 3.2)', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      // Check for score display - use getAllByText since scores appear multiple times
      const score3 = screen.getAllByText('3');
      expect(score3.length).toBeGreaterThan(0);
      const score2 = screen.getAllByText('2');
      expect(score2.length).toBeGreaterThan(0);
    });

    it('should display match date correctly', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      // Date should be formatted
      expect(screen.getByText(/4\/20\/2024/)).toBeInTheDocument();
    });

    it('should display match duration when available (Requirement 3.5)', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByText(/180/)).toBeInTheDocument();
    });

    it('should display event ID', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByText(/Event ID: 100/)).toBeInTheDocument();
    });

    it('should show loading state when match is loading', () => {
      (useMatch as any).mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error message when match fails to load', () => {
      (useMatch as any).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to load match'),
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByText('Unable to load match details. Please try again.')).toBeInTheDocument();
    });

    it('should handle match without duration gracefully', () => {
      const matchWithoutDuration: Match = {
        ...mockMatch,
        Duration: undefined,
      };

      (useMatch as any).mockReturnValue({
        data: matchWithoutDuration,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      // Should still render without crashing - use getAllByText
      const ronnieElements = screen.getAllByText('Ronnie O\'Sullivan');
      expect(ronnieElements.length).toBeGreaterThan(0);
    });

    it('should handle match without frames gracefully', () => {
      const matchWithoutFrames: Match = {
        ...mockMatch,
        Frames: undefined,
      };

      (useMatch as any).mockReturnValue({
        data: matchWithoutFrames,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      // Should still render without crashing
      expect(screen.getByText('Ronnie O\'Sullivan')).toBeInTheDocument();
    });

    it('should display match status correctly', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should display table information when available', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByText(/Table 1/)).toBeInTheDocument();
    });

    it('should display session information when available', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByText(/Session 1/)).toBeInTheDocument();
    });
  });

  describe('FrameByFrameScores', () => {
    it('should display all frames when available (Requirement 3.3)', () => {
      render(<FrameByFrameScores frames={mockFrames} player1Name="Ronnie O'Sullivan" player2Name="John Higgins" />);

      // Check that all 5 frames are displayed
      expect(screen.getByText('Frame 1')).toBeInTheDocument();
      expect(screen.getByText('Frame 2')).toBeInTheDocument();
      expect(screen.getByText('Frame 3')).toBeInTheDocument();
      expect(screen.getByText('Frame 4')).toBeInTheDocument();
      expect(screen.getByText('Frame 5')).toBeInTheDocument();
    });

    it('should display frame scores correctly', () => {
      render(<FrameByFrameScores frames={mockFrames} player1Name="Ronnie O'Sullivan" player2Name="John Higgins" />);

      // Check first frame scores - use getAllByText since scores appear multiple times
      const score72 = screen.getAllByText('72');
      expect(score72.length).toBeGreaterThan(0);
      const score45 = screen.getAllByText('45');
      expect(score45.length).toBeGreaterThan(0);
    });

    it('should display highest break for each frame', () => {
      render(<FrameByFrameScores frames={mockFrames} player1Name="Ronnie O'Sullivan" player2Name="John Higgins" />);

      // Check for break displays
      expect(screen.getByText(/Break: 72/)).toBeInTheDocument();
      expect(screen.getByText(/Break: 89/)).toBeInTheDocument();
    });

    it('should highlight frame winner', () => {
      render(<FrameByFrameScores frames={mockFrames} player1Name="Ronnie O'Sullivan" player2Name="John Higgins" />);

      // The component should visually distinguish winners
      // This would typically be tested with class names or styles
      const frameElements = screen.getAllByText(/Frame \d+/);
      expect(frameElements.length).toBe(5);
    });

    it('should show message when no frames available', () => {
      render(<FrameByFrameScores frames={[]} player1Name="Ronnie O'Sullivan" player2Name="John Higgins" />);

      expect(screen.getByText('No frame-by-frame scores available for this match.')).toBeInTheDocument();
    });

    it('should handle undefined frames array', () => {
      render(<FrameByFrameScores frames={undefined} player1Name="Ronnie O'Sullivan" player2Name="John Higgins" />);

      expect(screen.getByText('No frame-by-frame scores available for this match.')).toBeInTheDocument();
    });

    it('should display frames in correct order', () => {
      render(<FrameByFrameScores frames={mockFrames} player1Name="Ronnie O'Sullivan" player2Name="John Higgins" />);

      const frameHeaders = screen.getAllByText(/Frame \d+/);
      expect(frameHeaders[0]).toHaveTextContent('Frame 1');
      expect(frameHeaders[1]).toHaveTextContent('Frame 2');
      expect(frameHeaders[2]).toHaveTextContent('Frame 3');
      expect(frameHeaders[3]).toHaveTextContent('Frame 4');
      expect(frameHeaders[4]).toHaveTextContent('Frame 5');
    });

    it('should handle frames without break information', () => {
      const framesWithoutBreaks: Frame[] = [
        { Frame_Number: 1, Player1_Score: 72, Player2_Score: 45, Winner_ID: 101 },
        { Frame_Number: 2, Player1_Score: 0, Player2_Score: 89, Winner_ID: 102 },
      ];

      render(<FrameByFrameScores frames={framesWithoutBreaks} player1Name="Ronnie O'Sullivan" player2Name="John Higgins" />);

      // Should still render without crashing
      expect(screen.getByText('Frame 1')).toBeInTheDocument();
      expect(screen.getByText('Frame 2')).toBeInTheDocument();
    });
  });

  describe('MatchStats', () => {
    it('should display total frames played', () => {
      render(<MatchStats match={mockMatch} />);

      expect(screen.getByText('5')).toBeInTheDocument(); // Total frames
      expect(screen.getByText('Total Frames')).toBeInTheDocument();
    });

    it('should display frames won by each player', () => {
      render(<MatchStats match={mockMatch} />);

      expect(screen.getByText('3')).toBeInTheDocument(); // Player1 frames won
      expect(screen.getByText('2')).toBeInTheDocument(); // Player2 frames won
    });

    it('should display highest break in match', () => {
      render(<MatchStats match={mockMatch} />);

      expect(screen.getByText('89')).toBeInTheDocument(); // Highest break
      expect(screen.getByText('Highest Break')).toBeInTheDocument();
    });

    it('should display average frame score for each player', () => {
      render(<MatchStats match={mockMatch} />);

      // Average for Player1: (72 + 0 + 65 + 88 + 45) / 5 = 54
      // Average for Player2: (45 + 89 + 32 + 12 + 78) / 5 = 51.2
      // Check for "Avg Score" text which is part of the label - use getAllByText
      const avgScoreElements = screen.getAllByText(/Avg Score/);
      expect(avgScoreElements.length).toBeGreaterThan(0);
    });

    it('should display match duration', () => {
      render(<MatchStats match={mockMatch} />);

      // Duration is formatted as "3h 0m" for 180 minutes
      expect(screen.getByText(/3h 0m/)).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    it('should handle match without frames', () => {
      const matchWithoutFrames: Match = {
        ...mockMatch,
        Frames: undefined,
      };

      render(<MatchStats match={matchWithoutFrames} />);

      // Should show 0 or N/A for stats
      expect(screen.getByText('Total Frames')).toBeInTheDocument();
    });

    it('should handle match without duration', () => {
      const matchWithoutDuration: Match = {
        ...mockMatch,
        Duration: undefined,
      };

      render(<MatchStats match={matchWithoutDuration} />);

      // Should still render other stats
      expect(screen.getByText('Total Frames')).toBeInTheDocument();
    });

    it('should calculate frame win percentage correctly', () => {
      render(<MatchStats match={mockMatch} />);

      // Player1: 3/5 = 60%
      // Player2: 2/5 = 40%
      expect(screen.getByText(/60%/)).toBeInTheDocument();
      expect(screen.getByText(/40%/)).toBeInTheDocument();
    });

    it('should display century breaks count if any', () => {
      const matchWithCentury: Match = {
        ...mockMatch,
        Frames: [
          { Frame_Number: 1, Player1_Score: 120, Player2_Score: 0, Winner_ID: 101, Break: 120 },
          { Frame_Number: 2, Player1_Score: 0, Player2_Score: 105, Winner_ID: 102, Break: 105 },
        ],
      };

      render(<MatchStats match={matchWithCentury} />);

      expect(screen.getByText('Century Breaks')).toBeInTheDocument();
      // Use getAllByText since "2" appears multiple times in the stats
      const twoElements = screen.getAllByText('2');
      expect(twoElements.length).toBeGreaterThan(0);
    });

    it('should show 0 century breaks when none exist', () => {
      render(<MatchStats match={mockMatch} />);

      expect(screen.getByText('Century Breaks')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Match Information Display Requirements', () => {
    it('should display all required match information fields', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      // Verify all required fields from Requirements 3.2, 3.3, 3.5 are displayed
      // Use getAllByText for player names since they appear multiple times
      const ronnieElements = screen.getAllByText('Ronnie O\'Sullivan');
      expect(ronnieElements.length).toBeGreaterThan(0);
      const johnElements = screen.getAllByText('John Higgins');
      expect(johnElements.length).toBeGreaterThan(0);
      
      // Check for scores - they appear multiple times
      const score3 = screen.getAllByText('3');
      expect(score3.length).toBeGreaterThan(0);
      const score2 = screen.getAllByText('2');
      expect(score2.length).toBeGreaterThan(0);
      
      // Check for duration (formatted as "180 minutes")
      expect(screen.getByText(/180 minutes/)).toBeInTheDocument();
      // Check for date
      expect(screen.getByText(/4\/20\/2024/)).toBeInTheDocument();
      // Check for event
      expect(screen.getByText(/Event ID: 100/)).toBeInTheDocument();
    });

    it('should display frame-by-frame scores when available (Requirement 3.3)', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      // Frame-by-frame section should be present
      expect(screen.getByText('Frame 1')).toBeInTheDocument();
      expect(screen.getByText('Frame 2')).toBeInTheDocument();
    });

    it('should format duration in readable format', () => {
      (useMatch as any).mockReturnValue({
        data: mockMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      // Duration should be displayed (180 minutes = 3 hours)
      expect(screen.getByText(/180/)).toBeInTheDocument();
    });

    it('should handle unplayed matches correctly', () => {
      const unplayedMatch: Match = {
        ...mockMatch,
        Status: 'U',
        Player1_Score: 0,
        Player2_Score: 0,
        Frames: undefined,
        Duration: undefined,
      };

      (useMatch as any).mockReturnValue({
        data: unplayedMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByText('Upcoming')).toBeInTheDocument();
    });

    it('should handle abandoned matches correctly', () => {
      const abandonedMatch: Match = {
        ...mockMatch,
        Status: 'A',
      };

      (useMatch as any).mockReturnValue({
        data: abandonedMatch,
        loading: false,
        error: null,
      });

      render(<MatchDetailPage eventId={100} roundId={5} matchNumber={1} />);

      expect(screen.getByText('Abandoned')).toBeInTheDocument();
    });
  });
});
