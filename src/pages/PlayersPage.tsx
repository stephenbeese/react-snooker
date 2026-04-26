/**
 * PlayersPage component - Main players list view with filtering
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAllPlayers } from '../hooks/useSnookerApi';
import { PlayerList } from '../components/pages/PlayerList';
import { PlayerFilters } from '../components/pages/PlayerFilters';
import { filterPlayers, type PlayerFilterCriteria } from '../utils/playerUtils';
import type { Player } from '../types';

export const PlayersPage = () => {
  const [filterCriteria, setFilterCriteria] = useState<PlayerFilterCriteria>({});
  
  // Fetch all professional players for current season by default
  const { data: players, loading, error } = useAllPlayers(2024, 'p');

  // Clear cache on mount to ensure fresh data
  useEffect(() => {
    // Clear API cache to get fresh data
    import('../api/snooker').then(api => {
      api.clearApiCache();
      console.log('🔄 Cache cleared, fresh data will be fetched');
    });
  }, []);

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px',
      }}>
        {/* Modern page header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            marginBottom: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }}>
            <span style={{ fontSize: '32px' }}>🎱</span>
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #111827 0%, #1e40af 50%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            lineHeight: '1.2',
          }}>
            Professional Players
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            Discover the world's finest snooker players, their achievements, and career statistics
          </p>
          
          <div style={{
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            fontSize: '14px',
            color: '#9ca3af',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#10b981', 
                borderRadius: '50%' 
              }}></span>
              <span>Professional Players</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#f59e0b', 
                borderRadius: '50%' 
              }}></span>
              <span>Amateur Players</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '32px' }}>
          <PlayerFilters
            players={players || []}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </div>

        {/* Player list */}
        <PlayerList
          players={filteredPlayers}
          loading={loading}
          error={error}
          onPlayerClick={handlePlayerClick}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};