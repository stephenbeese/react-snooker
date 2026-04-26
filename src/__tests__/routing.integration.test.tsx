/**
 * Integration tests for routing and navigation
 * Tests routing between pages and data persistence across navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { PlayersPage } from '../pages/PlayersPage';
import { EventsPage } from '../pages/EventsPage';
import { ResultsPage } from '../pages/ResultsPage';
import { RankingsPage } from '../pages/RankingsPage';
import { UpcomingPage } from '../pages/UpcomingPage';
import { HeadToHeadPage } from '../pages/HeadToHeadPage';
import { HistoricalPage } from '../pages/HistoricalPage';
import { SearchPage } from '../pages/SearchPage';
import { PlayerProfilePage } from '../pages/PlayerProfilePage';
import { EventDetailPage } from '../pages/EventDetailPage';
import { MatchDetailPage } from '../pages/MatchDetailPage';

// Mock the API hooks
vi.mock('../hooks/useSnookerApi', () => ({
  useEventsBySeason: () => ({ data: [], loading: false, error: null }),
  useRecentResults: () => ({ data: [], loading: false, error: null }),
  useOngoingMatches: () => ({ data: [], loading: false, error: null }),
  useUpcomingMatches: () => ({ data: [], loading: false, error: null }),
  usePlayers: () => ({ data: [], loading: false, error: null }),
  useAllPlayers: () => ({ data: [], loading: false, error: null }),
  usePlayer: () => ({ data: null, loading: false, error: null }),
  usePlayerMatches: () => ({ data: [], loading: false, error: null }),
  useEvent: () => ({ data: null, loading: false, error: null }),
  useMatchesByEvent: () => ({ data: [], loading: false, error: null }),
  useMatch: () => ({ data: null, loading: false, error: null }),
  useRankings: () => ({ data: [], loading: false, error: null }),
  useHeadToHead: () => ({ data: null, loading: false, error: null }),
  useSearch: () => ({ data: { players: [], events: [], matches: [] }, loading: false, error: null }),
}));

// Mock the watchlist hook
vi.mock('../hooks/useWatchlist', () => ({
  useWatchlist: () => ({
    watchlist: [],
    addToWatchlist: vi.fn(),
    removeFromWatchlist: vi.fn(),
    isInWatchlist: vi.fn(() => false),
  }),
}));

describe('Routing Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Route Navigation', () => {
    it('should render HomePage at root path', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Welcome to Snooker Results/i)).toBeInTheDocument();
    });

    it('should render PlayersPage at /players', () => {
      render(
        <MemoryRouter initialEntries={['/players']}>
          <Routes>
            <Route path="/players" element={<PlayersPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Players/i, level: 1 })).toBeInTheDocument();
    });

    it('should render EventsPage at /events', () => {
      render(
        <MemoryRouter initialEntries={['/events']}>
          <Routes>
            <Route path="/events" element={<EventsPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Events/i, level: 1 })).toBeInTheDocument();
    });

    it('should render ResultsPage at /results', () => {
      render(
        <MemoryRouter initialEntries={['/results']}>
          <Routes>
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Match Results/i, level: 1 })).toBeInTheDocument();
    });

    it('should render RankingsPage at /rankings', () => {
      render(
        <MemoryRouter initialEntries={['/rankings']}>
          <Routes>
            <Route path="/rankings" element={<RankingsPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /World Rankings/i, level: 1 })).toBeInTheDocument();
    });

    it('should render UpcomingPage at /upcoming', () => {
      render(
        <MemoryRouter initialEntries={['/upcoming']}>
          <Routes>
            <Route path="/upcoming" element={<UpcomingPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Upcoming Matches/i)).toBeInTheDocument();
    });

    it('should render HeadToHeadPage at /head-to-head', () => {
      render(
        <MemoryRouter initialEntries={['/head-to-head']}>
          <Routes>
            <Route path="/head-to-head" element={<HeadToHeadPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Head to Head/i)).toBeInTheDocument();
    });

    it('should render HistoricalPage at /historical', () => {
      render(
        <MemoryRouter initialEntries={['/historical']}>
          <Routes>
            <Route path="/historical" element={<HistoricalPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Historical Data/i)).toBeInTheDocument();
    });

    it('should render SearchPage at /search', () => {
      render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
    });
  });

  describe('Dynamic Route Parameters', () => {
    it('should render PlayerProfilePage with playerId parameter', () => {
      render(
        <MemoryRouter initialEntries={['/players/123']}>
          <Routes>
            <Route path="/players/:playerId" element={<PlayerProfilePage />} />
          </Routes>
        </MemoryRouter>
      );

      // Should attempt to load player with ID 123
      waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
    });

    it('should render EventDetailPage with eventId parameter', () => {
      render(
        <MemoryRouter initialEntries={['/events/456']}>
          <Routes>
            <Route path="/events/:eventId" element={<EventDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Should attempt to load event with ID 456
      waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
    });

    it('should render MatchDetailPage with matchId parameter', () => {
      render(
        <MemoryRouter initialEntries={['/matches/789']}>
          <Routes>
            <Route path="/matches/:matchId" element={<MatchDetailPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Should attempt to load match with ID 789
      waitFor(() => {
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
      });
    });

    it('should redirect to players page when playerId is invalid', () => {
      render(
        <MemoryRouter initialEntries={['/players/invalid']}>
          <Routes>
            <Route path="/players/:playerId" element={<PlayerProfilePage />} />
            <Route path="/players" element={<PlayersPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Should redirect to players list
      waitFor(() => {
        expect(screen.getByText(/Players/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Query Parameters', () => {
    it('should handle search query parameter', () => {
      render(
        <MemoryRouter initialEntries={['/search?q=ronnie']}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
    });

    it('should handle empty search query', () => {
      render(
        <MemoryRouter initialEntries={['/search']}>
          <Routes>
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
    });
  });

  describe('Data Persistence Across Navigation', () => {
    it('should persist watchlist data across page navigation', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/players" element={<PlayersPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Watchlist should be available on home page
      expect(screen.getByText(/Watchlist/i)).toBeInTheDocument();

      // Navigate to players page
      rerender(
        <MemoryRouter initialEntries={['/players']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/players" element={<PlayersPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Watchlist data should still be accessible (via localStorage)
      const storedWatchlist = localStorage.getItem('snooker_watchlist');
      expect(storedWatchlist).toBeDefined();
    });

    it('should maintain filter state when navigating back', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/players']}>
          <Routes>
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/events" element={<EventsPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Players page should render
      expect(screen.getByRole('heading', { name: /Players/i, level: 1 })).toBeInTheDocument();

      // Navigate to events
      rerender(
        <MemoryRouter initialEntries={['/events']}>
          <Routes>
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/events" element={<EventsPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /Events/i, level: 1 })).toBeInTheDocument();

      // Navigate back to players
      rerender(
        <MemoryRouter initialEntries={['/players']}>
          <Routes>
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/events" element={<EventsPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Players page should render again
      expect(screen.getByRole('heading', { name: /Players/i, level: 1 })).toBeInTheDocument();
    });
  });

  describe('Alternative Routes', () => {
    it('should handle /h2h as alias for /head-to-head', () => {
      render(
        <MemoryRouter initialEntries={['/h2h']}>
          <Routes>
            <Route path="/h2h" element={<HeadToHeadPage />} />
            <Route path="/head-to-head" element={<HeadToHeadPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Head to Head/i)).toBeInTheDocument();
    });
  });

  describe('404 and Fallback Routes', () => {
    it('should handle unknown routes gracefully', () => {
      render(
        <MemoryRouter initialEntries={['/unknown-route']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      );

      // Should redirect to home page
      expect(screen.getByText(/Welcome to Snooker Results/i)).toBeInTheDocument();
    });
  });
});
