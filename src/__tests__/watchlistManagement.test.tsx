/**
 * Unit tests for watchlist management functionality
 * Tests add/remove operations, display, and integration with components
 * **Validates: Requirements 10.1, 10.2**
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WatchlistButton } from '../components/common/WatchlistButton';
import { WatchlistDisplay } from '../components/common/WatchlistDisplay';
import { WatchlistSection } from '../components/pages/WatchlistSection';
import { PlayerCard } from '../components/common/PlayerCard';
import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  clearWatchlist,
  loadWatchlist,
  saveWatchlist,
} from '../utils/watchlistUtils';
import type { Player } from '../types';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock global localStorage
vi.stubGlobal('localStorage', localStorageMock);

// Mock the API hooks
vi.mock('../hooks/useSnookerApi', () => ({
  useAllPlayers: () => ({
    data: mockPlayers,
    loading: false,
    error: null,
  }),
  useRecentResults: () => ({
    data: mockMatches,
    loading: false,
    error: null,
  }),
  useUpcomingMatches: () => ({
    data: mockMatches,
    loading: false,
    error: null,
  }),
}));

// Mock player data
const mockPlayers: Player[] = [
  {
    ID: 1,
    FirstName: 'Ronnie',
    LastName: "O'Sullivan",
    Name: "Ronnie O'Sullivan",
    Nationality: 'England',
    Status: 'P',
    Type: 1,
    Born: '1975-12-05',
    Image_Url: 'https://example.com/ronnie.jpg',
  },
  {
    ID: 2,
    FirstName: 'Judd',
    LastName: 'Trump',
    Name: 'Judd Trump',
    Nationality: 'England',
    Status: 'P',
    Type: 1,
    Born: '1989-08-20',
    Image_Url: 'https://example.com/judd.jpg',
  },
  {
    ID: 3,
    FirstName: 'Mark',
    LastName: 'Selby',
    Name: 'Mark Selby',
    Nationality: 'England',
    Status: 'P',
    Type: 1,
    Born: '1983-06-19',
  },
];

const mockMatches = [
  {
    ID: 1,
    Event_ID: 100,
    Round_ID: 1,
    Match_Number: 1,
    Player1_ID: 1,
    Player1_Name: "Ronnie O'Sullivan",
    Player2_ID: 2,
    Player2_Name: 'Judd Trump',
    Player1_Score: 6,
    Player2_Score: 4,
    Status: 'R' as const,
    Date_Time: '2024-01-15T14:00:00Z',
  },
  {
    ID: 2,
    Event_ID: 100,
    Round_ID: 1,
    Match_Number: 2,
    Player1_ID: 3,
    Player1_Name: 'Mark Selby',
    Player2_ID: 1,
    Player2_Name: "Ronnie O'Sullivan",
    Player1_Score: 0,
    Player2_Score: 0,
    Status: 'U' as const,
    Date_Time: '2024-01-20T14:00:00Z',
  },
];

describe('Watchlist Management Unit Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorageMock.clear();
  });

  describe('Watchlist Utility Functions', () => {
    test('should add player to empty watchlist', () => {
      const playerId = 1;
      const result = addToWatchlist(playerId);

      expect(result).toContain(playerId);
      expect(result.length).toBe(1);
      expect(isInWatchlist(playerId)).toBe(true);
    });

    test('should add multiple players to watchlist', () => {
      addToWatchlist(1);
      addToWatchlist(2);
      const result = addToWatchlist(3);

      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result.length).toBe(3);
    });

    test('should not add duplicate player to watchlist', () => {
      addToWatchlist(1);
      const result = addToWatchlist(1);

      expect(result.length).toBe(1);
      expect(result.filter(id => id === 1).length).toBe(1);
    });

    test('should remove player from watchlist', () => {
      addToWatchlist(1);
      addToWatchlist(2);
      addToWatchlist(3);

      const result = removeFromWatchlist(2);

      expect(result).not.toContain(2);
      expect(result).toContain(1);
      expect(result).toContain(3);
      expect(result.length).toBe(2);
      expect(isInWatchlist(2)).toBe(false);
    });

    test('should handle removing non-existent player gracefully', () => {
      addToWatchlist(1);
      addToWatchlist(2);

      const result = removeFromWatchlist(999);

      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result.length).toBe(2);
    });

    test('should clear entire watchlist', () => {
      addToWatchlist(1);
      addToWatchlist(2);
      addToWatchlist(3);

      clearWatchlist();
      const result = loadWatchlist();

      expect(result.length).toBe(0);
      expect(isInWatchlist(1)).toBe(false);
      expect(isInWatchlist(2)).toBe(false);
      expect(isInWatchlist(3)).toBe(false);
    });

    test('should persist watchlist to localStorage', () => {
      const playerIds = [1, 2, 3];
      saveWatchlist(playerIds);

      const stored = localStorage.getItem('snooker_watchlist');
      expect(stored).toBe(JSON.stringify(playerIds));

      const loaded = loadWatchlist();
      expect(loaded).toEqual(playerIds);
    });

    test('should load empty array when localStorage is empty', () => {
      const result = loadWatchlist();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle invalid player IDs gracefully', () => {
      expect(() => addToWatchlist(NaN)).toThrow('Invalid player ID');
      expect(() => addToWatchlist(-1)).not.toThrow(); // Negative numbers are technically valid
      expect(() => removeFromWatchlist(NaN)).toThrow('Invalid player ID');
    });

    test('should filter out invalid IDs when loading from localStorage', () => {
      // Manually set invalid data in localStorage
      localStorage.setItem('snooker_watchlist', JSON.stringify([1, 'invalid', 2, null, 3, NaN]));

      const result = loadWatchlist();

      expect(result).toEqual([1, 2, 3]);
      expect(result.length).toBe(3);
    });
  });

  describe('WatchlistButton Component', () => {
    test('should render "Add to Watchlist" button when player not in watchlist', () => {
      render(<WatchlistButton playerId={1} playerName="Test Player" />);

      const button = screen.getByRole('button', { name: /add to watchlist/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Add to Watchlist');
    });

    test('should render "Remove from Watchlist" button when player in watchlist', () => {
      addToWatchlist(1);

      render(<WatchlistButton playerId={1} playerName="Test Player" />);

      const button = screen.getByRole('button', { name: /remove from watchlist/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Remove from Watchlist');
    });

    test('should add player to watchlist when clicking "Add" button', async () => {
      render(<WatchlistButton playerId={1} playerName="Test Player" />);

      const button = screen.getByRole('button', { name: /add to watchlist/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(isInWatchlist(1)).toBe(true);
      });

      // Button text should change
      expect(screen.getByRole('button', { name: /remove from watchlist/i })).toBeInTheDocument();
    });

    test('should remove player from watchlist when clicking "Remove" button', async () => {
      addToWatchlist(1);

      render(<WatchlistButton playerId={1} playerName="Test Player" />);

      const button = screen.getByRole('button', { name: /remove from watchlist/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(isInWatchlist(1)).toBe(false);
      });

      // Button text should change
      expect(screen.getByRole('button', { name: /add to watchlist/i })).toBeInTheDocument();
    });

    test('should display player name in button title', () => {
      render(<WatchlistButton playerId={1} playerName="Ronnie O'Sullivan" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', expect.stringContaining("Ronnie O'Sullivan"));
    });

    test('should apply custom className', () => {
      render(<WatchlistButton playerId={1} className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('WatchlistDisplay Component', () => {
    test('should display empty state when watchlist is empty', () => {
      render(<WatchlistDisplay />);

      expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument();
      expect(screen.getByText(/add players to keep track/i)).toBeInTheDocument();
    });

    test('should display watchlist count in header', () => {
      addToWatchlist(1);
      addToWatchlist(2);

      render(<WatchlistDisplay />);

      expect(screen.getByText(/my watchlist \(2\)/i)).toBeInTheDocument();
    });

    test('should display "Clear All" button when watchlist has items', () => {
      addToWatchlist(1);

      render(<WatchlistDisplay />);

      const clearButton = screen.getByRole('button', { name: /clear entire watchlist/i });
      expect(clearButton).toBeInTheDocument();
    });

    test('should not display "Clear All" button when watchlist is empty', () => {
      render(<WatchlistDisplay />);

      const clearButton = screen.queryByRole('button', { name: /clear entire watchlist/i });
      expect(clearButton).not.toBeInTheDocument();
    });

    test('should clear watchlist when clicking "Clear All" button', async () => {
      addToWatchlist(1);
      addToWatchlist(2);

      render(<WatchlistDisplay />);

      const clearButton = screen.getByRole('button', { name: /clear entire watchlist/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument();
      });
    });

    test('should hide header when showHeader is false', () => {
      addToWatchlist(1);

      render(<WatchlistDisplay showHeader={false} />);

      expect(screen.queryByText(/my watchlist/i)).not.toBeInTheDocument();
    });

    test('should limit displayed items when maxItems is set', () => {
      addToWatchlist(1);
      addToWatchlist(2);
      addToWatchlist(3);
      addToWatchlist(4);

      render(<WatchlistDisplay maxItems={2} />);

      expect(screen.getByText(/and 2 more players/i)).toBeInTheDocument();
    });
  });

  describe('PlayerCard Component with Watchlist Integration', () => {
    test('should render PlayerCard with WatchlistButton by default', () => {
      render(<PlayerCard player={mockPlayers[0]} />);

      expect(screen.getByRole('button', { name: /add to watchlist/i })).toBeInTheDocument();
    });

    test('should hide WatchlistButton when showWatchlistButton is false', () => {
      render(<PlayerCard player={mockPlayers[0]} showWatchlistButton={false} />);

      expect(screen.queryByRole('button', { name: /watchlist/i })).not.toBeInTheDocument();
    });

    test('should display player name and nationality', () => {
      render(<PlayerCard player={mockPlayers[0]} />);

      expect(screen.getByText("Ronnie O'Sullivan")).toBeInTheDocument();
      expect(screen.getByText('England')).toBeInTheDocument();
    });

    test('should add player to watchlist from PlayerCard', async () => {
      render(<PlayerCard player={mockPlayers[0]} />);

      const button = screen.getByRole('button', { name: /add to watchlist/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(isInWatchlist(mockPlayers[0].ID)).toBe(true);
      });
    });

    test('should call onClick handler when card is clicked', () => {
      const handleClick = vi.fn();
      render(<PlayerCard player={mockPlayers[0]} onClick={handleClick} />);

      // Find the card container (not the button)
      const card = screen.getByRole('button', { name: /view details for/i });
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('WatchlistSection Component', () => {
    test('should render WatchlistSection with empty state', () => {
      render(<WatchlistSection />);

      expect(screen.getByText(/your watchlist is empty/i)).toBeInTheDocument();
    });

    test('should display watchlist players when watchlist has items', () => {
      addToWatchlist(1);
      addToWatchlist(2);

      render(<WatchlistSection />);

      expect(screen.getByText(/my watchlist \(2\)/i)).toBeInTheDocument();
    });

    test('should display "View All Players" link when watchlist has items', () => {
      addToWatchlist(1);

      render(<WatchlistSection />);

      const link = screen.getByText(/view all players/i);
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/players');
    });

    test('should display watchlist with multiple players', () => {
      // Add 3 players to watchlist (we have 3 mock players)
      addToWatchlist(1);
      addToWatchlist(2);
      addToWatchlist(3);

      render(<WatchlistSection />);

      // Should show all 3 players since we only have 3 in the mock
      expect(screen.getByText(/my watchlist \(3\)/i)).toBeInTheDocument();
      
      // Use getAllByText since names appear in both PlayerCard and MatchResult
      const ronnieElements = screen.getAllByText("Ronnie O'Sullivan");
      expect(ronnieElements.length).toBeGreaterThan(0);
      
      const juddElements = screen.getAllByText('Judd Trump');
      expect(juddElements.length).toBeGreaterThan(0);
      
      const markElements = screen.getAllByText('Mark Selby');
      expect(markElements.length).toBeGreaterThan(0);
    });
  });

  describe('Watchlist Integration Tests', () => {
    test('should maintain watchlist state across component re-renders', () => {
      const { rerender } = render(<WatchlistButton playerId={1} />);

      // Add to watchlist
      const addButton = screen.getByRole('button', { name: /add to watchlist/i });
      fireEvent.click(addButton);

      // Re-render component
      rerender(<WatchlistButton playerId={1} />);

      // Should still show "Remove" button
      expect(screen.getByRole('button', { name: /remove from watchlist/i })).toBeInTheDocument();
    });

    test('should sync watchlist state between multiple components', async () => {
      render(
        <>
          <WatchlistButton playerId={1} />
          <WatchlistDisplay />
        </>
      );

      // Verify initial empty state
      expect(screen.getByText(/my watchlist \(0\)/i)).toBeInTheDocument();

      // Add player via button
      const addButton = screen.getByRole('button', { name: /add to watchlist/i });
      fireEvent.click(addButton);

      // Wait for state update - the button should change
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /remove from watchlist/i })).toBeInTheDocument();
      });

      // Verify watchlist was updated in localStorage
      expect(isInWatchlist(1)).toBe(true);
      const watchlist = loadWatchlist();
      expect(watchlist).toContain(1);
    });

    test('should handle rapid add/remove operations', async () => {
      render(<WatchlistButton playerId={1} />);

      const button = screen.getByRole('button');

      // Rapidly click add/remove
      fireEvent.click(button); // Add
      fireEvent.click(button); // Remove
      fireEvent.click(button); // Add
      fireEvent.click(button); // Remove

      await waitFor(() => {
        expect(isInWatchlist(1)).toBe(false);
      });
    });

    test('should persist watchlist across page reloads (localStorage)', () => {
      // Add players to watchlist
      addToWatchlist(1);
      addToWatchlist(2);
      addToWatchlist(3);

      // Simulate page reload by loading from localStorage
      const reloadedWatchlist = loadWatchlist();

      expect(reloadedWatchlist).toEqual([1, 2, 3]);
      expect(reloadedWatchlist.length).toBe(3);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle corrupted localStorage data gracefully', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('snooker_watchlist', 'invalid json {]');

      const result = loadWatchlist();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    test('should handle localStorage quota exceeded', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw error
      expect(() => saveWatchlist([1, 2, 3])).not.toThrow();

      // Restore original
      localStorage.setItem = originalSetItem;
    });

    test('should handle missing player data gracefully', () => {
      const incompletePlayer: Player = {
        ID: 999,
        FirstName: 'Unknown',
        LastName: 'Player',
        Name: 'Unknown Player',
        Nationality: 'Unknown',
        Status: 'P',
        Type: 1,
      };

      render(<PlayerCard player={incompletePlayer} />);

      expect(screen.getByText('Unknown Player')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add to watchlist/i })).toBeInTheDocument();
    });

    test('should handle zero player ID', () => {
      expect(() => addToWatchlist(0)).not.toThrow();
      expect(isInWatchlist(0)).toBe(true);
    });

    test('should handle negative player ID', () => {
      expect(() => addToWatchlist(-1)).not.toThrow();
      expect(isInWatchlist(-1)).toBe(true);
    });

    test('should handle very large watchlist', () => {
      // Add 1000 players
      const largeWatchlist = Array.from({ length: 1000 }, (_, i) => i + 1);
      saveWatchlist(largeWatchlist);

      const loaded = loadWatchlist();

      expect(loaded.length).toBe(1000);
      expect(loaded[0]).toBe(1);
      expect(loaded[999]).toBe(1000);
    });
  });
});
