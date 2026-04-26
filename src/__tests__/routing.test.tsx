/**
 * Routing tests - Verify all routes are properly configured
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { 
  HomePage, 
  PlayersPage, 
  PlayerProfilePage,
  EventsPage, 
  EventDetailPage,
  ResultsPage, 
  MatchDetailPage,
  RankingsPage, 
  HeadToHeadPage,
  HistoricalPage, 
  SearchPage,
  UpcomingPage
} from '../pages';

describe('Routing Configuration', () => {
  it('should render HomePage on root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // HomePage should render
    expect(screen.getByText(/Welcome to Snooker Results/i)).toBeInTheDocument();
  });

  it('should render PlayersPage on /players route', () => {
    render(
      <MemoryRouter initialEntries={['/players']}>
        <Routes>
          <Route path="/players" element={<PlayersPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // PlayersPage should render - check for unique text
    expect(screen.getByText(/Discover the world's finest snooker players/i)).toBeInTheDocument();
  });

  it('should render EventsPage on /events route', () => {
    render(
      <MemoryRouter initialEntries={['/events']}>
        <Routes>
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // EventsPage should render - check for unique text
    expect(screen.getByText(/Browse snooker tournaments and competitions/i)).toBeInTheDocument();
  });

  it('should render ResultsPage on /results route', () => {
    render(
      <MemoryRouter initialEntries={['/results']}>
        <Routes>
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // ResultsPage should render - check for unique text
    expect(screen.getByText(/Browse recent match results, scores, and tournament outcomes/i)).toBeInTheDocument();
  });

  it('should render RankingsPage on /rankings route', () => {
    render(
      <MemoryRouter initialEntries={['/rankings']}>
        <Routes>
          <Route path="/rankings" element={<RankingsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // RankingsPage should render
    expect(screen.getByRole('heading', { name: /World Rankings/i })).toBeInTheDocument();
  });

  it('should render UpcomingPage on /upcoming route', () => {
    render(
      <MemoryRouter initialEntries={['/upcoming']}>
        <Routes>
          <Route path="/upcoming" element={<UpcomingPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // UpcomingPage should render
    expect(screen.getByText(/Upcoming Matches/i)).toBeInTheDocument();
  });

  it('should render HeadToHeadPage on /head-to-head route', () => {
    render(
      <MemoryRouter initialEntries={['/head-to-head']}>
        <Routes>
          <Route path="/head-to-head" element={<HeadToHeadPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // HeadToHeadPage should render
    expect(screen.getByText(/Head-to-Head Comparison/i)).toBeInTheDocument();
  });

  it('should render HistoricalPage on /historical route', () => {
    render(
      <MemoryRouter initialEntries={['/historical']}>
        <Routes>
          <Route path="/historical" element={<HistoricalPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // HistoricalPage should render
    expect(screen.getByText(/Historical Data Explorer/i)).toBeInTheDocument();
  });

  it('should render SearchPage on /search route', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // SearchPage should render
    expect(screen.getByRole('heading', { name: /Search/i })).toBeInTheDocument();
  });

  it('should handle route parameters for PlayerProfilePage', () => {
    render(
      <MemoryRouter initialEntries={['/players/123']}>
        <Routes>
          <Route path="/players/:playerId" element={<PlayerProfilePage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // PlayerProfilePage should render (will show loading or error state)
    // We just verify the component renders without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should handle route parameters for EventDetailPage', () => {
    render(
      <MemoryRouter initialEntries={['/events/456']}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // EventDetailPage should render (will show loading or error state)
    expect(document.body).toBeInTheDocument();
  });

  it('should handle route parameters for MatchDetailPage', () => {
    render(
      <MemoryRouter initialEntries={['/matches/789']}>
        <Routes>
          <Route path="/matches/:matchId" element={<MatchDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // MatchDetailPage should render (will show loading or error state)
    expect(document.body).toBeInTheDocument();
  });

  it('should handle invalid playerId by redirecting', () => {
    render(
      <MemoryRouter initialEntries={['/players/invalid']}>
        <Routes>
          <Route path="/players/:playerId" element={<PlayerProfilePage />} />
          <Route path="/players" element={<PlayersPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should redirect to /players page
    expect(screen.getByRole('heading', { name: /Professional Players/i })).toBeInTheDocument();
  });

  it('should handle invalid eventId by redirecting', () => {
    render(
      <MemoryRouter initialEntries={['/events/invalid']}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should redirect to /events page
    expect(screen.getByRole('heading', { name: /^Events$/i })).toBeInTheDocument();
  });

  it('should handle invalid matchId by redirecting', () => {
    render(
      <MemoryRouter initialEntries={['/matches/invalid']}>
        <Routes>
          <Route path="/matches/:matchId" element={<MatchDetailPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should redirect to /results page
    expect(screen.getByRole('heading', { name: /Match Results/i })).toBeInTheDocument();
  });
});
