/**
 * PlayersPage component - Main players list view with filtering
 */

import { useState, useMemo, useCallback } from 'react';
import { useAllPlayers } from '../hooks/useSnookerApi';
import { PlayerList } from '../components/pages/PlayerList';
import { PlayerFilters } from '../components/pages/PlayerFilters';
import { filterPlayers, type PlayerFilterCriteria } from '../utils/playerUtils';
import type { Player } from '../types';

export const PlayersPage = () => {
  const [filterCriteria, setFilterCriteria] = useState<PlayerFilterCriteria>({});
  
  // Fetch all professional players for current season by default
  const { data: players, loading, error } = useAllPlayers(-1, 'p');

  // Apply filters to players
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    return filterPlayers(players, filterCriteria);
  }, [players, filterCriteria]);

  // Handle filter changes
  const handleFiltersChange = useCallback((criteria: PlayerFilterCriteria) => {
    setFilterCriteria(criteria);
  }, []);

  // Handle player click (placeholder for navigation to player profile)
  const handlePlayerClick = useCallback((player: Player) => {
    console.log('Player clicked:', player);
    // TODO: Navigate to player profile page
    // This would typically use React Router: navigate(`/players/${player.ID}`)
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    // The hook will automatically retry when the component re-renders
    window.location.reload();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Players</h1>
        <p className="text-gray-600">
          Browse professional snooker players and their statistics
        </p>
      </div>

      {/* Filters */}
      <PlayerFilters
        players={players || []}
        onFiltersChange={handleFiltersChange}
        loading={loading}
      />

      {/* Player list */}
      <PlayerList
        players={filteredPlayers}
        loading={loading}
        error={error}
        onPlayerClick={handlePlayerClick}
        onRetry={handleRetry}
      />
    </div>
  );
};