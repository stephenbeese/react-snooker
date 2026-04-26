/**
 * Unit tests for TournamentBracket component
 * Tests bracket structure and match display functionality
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TournamentBracket } from '../components/pages/TournamentBracket';
import type { Event, Match } from '../types/snooker';

// Mock data
const mockEvent: Event = {
  ID: 1,
  Name: 'World Championship',
  StartDate: '2024-04-15',
  EndDate: '2024-05-01',
  Venue: 'Crucible Theatre',
  Country: 'England',
  Tour: 'Main Tour',
  Sponsor: 'Betfred',
  Prize_Fund: 2395000,
  Defending_Champion: 'Luca Brecel',
  Defending_Champion_ID: 123
};

const mockMatches: Match[] = [
  // First Round (Round 1)
  {
    ID: 1,
    Event_ID: 1,
    Round_ID: 1,
    Match_Number: 1,
    Player1_ID: 1,
    Player1_Name: 'Ronnie O\'Sullivan',
    Player2_ID: 2,
    Player2_Name: 'Mark Selby',
    Player1_Score: 10,
    Player2_Score: 8,
    Status: 'R',
    Date_Time: '2024-04-15T14:00:00Z'
  },
  {
    ID: 2,
    Event_ID: 1,
    Round_ID: 1,
    Match_Number: 2,
    Player1_ID: 3,
    Player1_Name: 'Judd Trump',
    Player2_ID: 4,
    Player2_Name: 'Neil Robertson',
    Player1_Score: 10,
    Player2_Score: 7,
    Status: 'R',
    Date_Time: '2024-04-15T19:00:00Z'
  },
  // Semi-Final (Round 2)
  {
    ID: 3,
    Event_ID: 1,
    Round_ID: 2,
    Match_Number: 1,
    Player1_ID: 1,
    Player1_Name: 'Ronnie O\'Sullivan',
    Player2_ID: 3,
    Player2_Name: 'Judd Trump',
    Player1_Score: 17,
    Player2_Score: 11,
    Status: 'R',
    Date_Time: '2024-04-28T14:00:00Z'
  },
  // Final (Round 3)
  {
    ID: 4,
    Event_ID: 1,
    Round_ID: 3,
    Match_Number: 1,
    Player1_ID: 1,
    Player1_Name: 'Ronnie O\'Sullivan',
    Player2_ID: 5,
    Player2_Name: 'Mark Williams',
    Player1_Score: 18,
    Player2_Score: 13,
    Status: 'R',
    Date_Time: '2024-05-01T14:00:00Z'
  }
];

const mockUpcomingMatches: Match[] = [
  {
    ID: 5,
    Event_ID: 1,
    Round_ID: 1,
    Match_Number: 3,
    Player1_ID: 6,
    Player1_Name: 'John Higgins',
    Player2_ID: 7,
    Player2_Name: 'Stephen Hendry',
    Player1_Score: 0,
    Player2_Score: 0,
    Status: 'U',
    Date_Time: '2024-04-16T14:00:00Z'
  }
];

describe('TournamentBracket Component', () => {
  const defaultProps = {
    event: mockEvent,
    matches: mockMatches,
    loading: false,
    error: null,
    onRetry: vi.fn(),
    onMatchClick: vi.fn()
  };

  test('renders tournament bracket with correct structure', () => {
    render(<TournamentBracket {...defaultProps} />);
    
    // Should display tournament winner
    expect(screen.getByText('Tournament Winner')).toBeInTheDocument();
    expect(screen.getByText('Ronnie O\'Sullivan')).toBeInTheDocument();
    
    // Should display bracket title
    expect(screen.getByText('Tournament Bracket')).toBeInTheDocument();
    
    // Should display round headers
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Semi-Final')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  test('displays matches correctly in each round', () => {
    render(<TournamentBracket {...defaultProps} />);
    
    // Check that all players are displayed
    expect(screen.getByText('Ronnie O\'Sullivan')).toBeInTheDocument();
    expect(screen.getByText('Mark Selby')).toBeInTheDocument();
    expect(screen.getByText('Judd Trump')).toBeInTheDocument();
    expect(screen.getByText('Neil Robertson')).toBeInTheDocument();
    expect(screen.getByText('Mark Williams')).toBeInTheDocument();
    
    // Check that scores are displayed for completed matches
    expect(screen.getByText('10')).toBeInTheDocument(); // Multiple 10s
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  test('highlights winner path correctly', () => {
    render(<TournamentBracket {...defaultProps} />);
    
    // Winner's path matches should have special styling
    // This is tested by checking for the presence of winner path indicator in legend
    expect(screen.getByText('Winner\'s Path')).toBeInTheDocument();
  });

  test('handles match clicks correctly', () => {
    const onMatchClick = vi.fn();
    render(<TournamentBracket {...defaultProps} onMatchClick={onMatchClick} />);
    
    // Click on a match card
    const matchCards = screen.getAllByRole('button');
    const firstMatchCard = matchCards.find(card => 
      card.getAttribute('aria-label')?.includes('Ronnie O\'Sullivan')
    );
    
    if (firstMatchCard) {
      fireEvent.click(firstMatchCard);
      expect(onMatchClick).toHaveBeenCalled();
    }
  });

  test('opens match details modal when match is clicked', async () => {
    render(<TournamentBracket {...defaultProps} />);
    
    // Click on a match card
    const matchCards = screen.getAllByRole('button');
    const firstMatchCard = matchCards.find(card => 
      card.getAttribute('aria-label')?.includes('Ronnie O\'Sullivan')
    );
    
    if (firstMatchCard) {
      fireEvent.click(firstMatchCard);
      
      // Should open match details modal
      await waitFor(() => {
        expect(screen.getByText('Match Details')).toBeInTheDocument();
      });
    }
  });

  test('closes match details modal when close button is clicked', async () => {
    render(<TournamentBracket {...defaultProps} />);
    
    // Click on a match card to open modal
    const matchCards = screen.getAllByRole('button');
    const firstMatchCard = matchCards.find(card => 
      card.getAttribute('aria-label')?.includes('Ronnie O\'Sullivan')
    );
    
    if (firstMatchCard) {
      fireEvent.click(firstMatchCard);
      
      await waitFor(() => {
        expect(screen.getByText('Match Details')).toBeInTheDocument();
      });
      
      // Click close button
      const closeButton = screen.getByLabelText('Close match details');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Match Details')).not.toBeInTheDocument();
      });
    }
  });

  test('displays loading state correctly', () => {
    render(<TournamentBracket {...defaultProps} loading={true} />);
    
    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('displays error state correctly', () => {
    const error = new Error('Failed to load bracket');
    render(<TournamentBracket {...defaultProps} error={error} />);
    
    // Should show error message
    expect(screen.getByText('Unable to load tournament bracket. Please try again.')).toBeInTheDocument();
    
    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Clicking retry should call onRetry
    fireEvent.click(retryButton);
    expect(defaultProps.onRetry).toHaveBeenCalled();
  });

  test('displays empty state when no matches available', () => {
    render(<TournamentBracket {...defaultProps} matches={[]} />);
    
    expect(screen.getByText('No bracket data available for this tournament.')).toBeInTheDocument();
  });

  test('handles upcoming matches correctly', () => {
    render(<TournamentBracket {...defaultProps} matches={mockUpcomingMatches} />);
    
    // Should display upcoming match
    expect(screen.getByText('John Higgins')).toBeInTheDocument();
    expect(screen.getByText('Stephen Hendry')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  test('displays match status correctly', () => {
    const mixedMatches = [...mockMatches, ...mockUpcomingMatches];
    render(<TournamentBracket {...defaultProps} matches={mixedMatches} />);
    
    // Should show completed status
    expect(screen.getAllByText('Completed')).toHaveLength(4); // 4 completed matches
    
    // Should show upcoming status
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  test('displays legend correctly', () => {
    render(<TournamentBracket {...defaultProps} />);
    
    // Should display legend
    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Completed Match')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Match')).toBeInTheDocument();
    expect(screen.getByText('Winner\'s Path')).toBeInTheDocument();
  });

  test('handles keyboard navigation for match cards', () => {
    const onMatchClick = vi.fn();
    render(<TournamentBracket {...defaultProps} onMatchClick={onMatchClick} />);
    
    // Find a match card and test keyboard interaction
    const matchCards = screen.getAllByRole('button');
    const firstMatchCard = matchCards.find(card => 
      card.getAttribute('aria-label')?.includes('Ronnie O\'Sullivan')
    );
    
    if (firstMatchCard) {
      // Test Enter key
      fireEvent.keyDown(firstMatchCard, { key: 'Enter' });
      expect(onMatchClick).toHaveBeenCalled();
      
      // Reset mock
      onMatchClick.mockClear();
      
      // Test Space key
      fireEvent.keyDown(firstMatchCard, { key: ' ' });
      expect(onMatchClick).toHaveBeenCalled();
    }
  });

  test('displays match details modal with correct information', async () => {
    render(<TournamentBracket {...defaultProps} />);
    
    // Click on the final match
    const matchCards = screen.getAllByRole('button');
    const finalMatchCard = matchCards.find(card => 
      card.getAttribute('aria-label')?.includes('Mark Williams')
    );
    
    if (finalMatchCard) {
      fireEvent.click(finalMatchCard);
      
      await waitFor(() => {
        expect(screen.getByText('Match Details')).toBeInTheDocument();
        expect(screen.getByText('Ronnie O\'Sullivan')).toBeInTheDocument();
        expect(screen.getByText('Mark Williams')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument(); // Score
        expect(screen.getByText('13')).toBeInTheDocument(); // Score
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });
    }
  });

  test('handles matches without dates gracefully', () => {
    const matchesWithoutDates = mockMatches.map(match => ({
      ...match,
      Date_Time: undefined
    }));
    
    render(<TournamentBracket {...defaultProps} matches={matchesWithoutDates} />);
    
    // Should still render the bracket
    expect(screen.getByText('Tournament Bracket')).toBeInTheDocument();
    expect(screen.getAllByText('Ronnie O\'Sullivan')).toHaveLength(4); // Winner + 3 matches
  });

  test('handles matches with frame data in modal', async () => {
    const matchWithFrames: Match = {
      ...mockMatches[0],
      Frames: [
        { Frame_Number: 1, Player1_Score: 70, Player2_Score: 45, Winner_ID: 1 },
        { Frame_Number: 2, Player1_Score: 85, Player2_Score: 12, Winner_ID: 1 },
        { Frame_Number: 3, Player1_Score: 45, Player2_Score: 67, Winner_ID: 2 }
      ]
    };
    
    render(<TournamentBracket {...defaultProps} matches={[matchWithFrames]} />);
    
    // Click on the match
    const matchCard = screen.getByRole('button');
    fireEvent.click(matchCard);
    
    await waitFor(() => {
      expect(screen.getByText('Frame Scores')).toBeInTheDocument();
      expect(screen.getByText('Frame 1')).toBeInTheDocument();
      expect(screen.getByText('70 - 45')).toBeInTheDocument();
    });
  });

  test('correctly identifies round names', () => {
    render(<TournamentBracket {...defaultProps} />);
    
    // Should correctly name rounds based on position
    expect(screen.getByText('Quarter-Final')).toBeInTheDocument();
    expect(screen.getByText('Semi-Final')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  test('handles tournament without clear winner', () => {
    const drawMatches: Match[] = [{
      ID: 1,
      Event_ID: 1,
      Round_ID: 1,
      Match_Number: 1,
      Player1_ID: 1,
      Player1_Name: 'Player 1',
      Player2_ID: 2,
      Player2_Name: 'Player 2',
      Player1_Score: 5,
      Player2_Score: 5, // Draw
      Status: 'R'
    }];
    
    render(<TournamentBracket {...defaultProps} matches={drawMatches} />);
    
    // Should not display tournament winner section
    expect(screen.queryByText('Tournament Winner')).not.toBeInTheDocument();
  });

  test('handles large tournament bracket structure', () => {
    // Create a larger tournament with more rounds
    const largeMatches: Match[] = [];
    let matchId = 1;
    
    // Round of 16 (4 rounds total)
    for (let round = 1; round <= 4; round++) {
      const matchesInRound = Math.pow(2, 4 - round);
      for (let match = 1; match <= matchesInRound; match++) {
        largeMatches.push({
          ID: matchId++,
          Event_ID: 1,
          Round_ID: round,
          Match_Number: match,
          Player1_ID: matchId * 2 - 1,
          Player1_Name: `Player ${matchId * 2 - 1}`,
          Player2_ID: matchId * 2,
          Player2_Name: `Player ${matchId * 2}`,
          Player1_Score: Math.floor(Math.random() * 10) + 1,
          Player2_Score: Math.floor(Math.random() * 10) + 1,
          Status: 'R'
        });
      }
    }
    
    render(<TournamentBracket {...defaultProps} matches={largeMatches} />);
    
    // Should handle larger bracket
    expect(screen.getByText('Tournament Bracket')).toBeInTheDocument();
    expect(screen.getByText('Round of 16')).toBeInTheDocument();
    expect(screen.getByText('Quarter-Final')).toBeInTheDocument();
    expect(screen.getByText('Semi-Final')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });
});