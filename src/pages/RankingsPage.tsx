/**
 * RankingsPage component - Main rankings view with filtering
 */

import { useState, useCallback, useEffect } from 'react';
import { useRankings } from '../hooks/useSnookerApi';
import { RankingsList } from '../components/pages/RankingsList';
import { RankingFilters } from '../components/pages/RankingFilters';
import type { Ranking, RankingType } from '../types';

export const RankingsPage = () => {
  const [rankingType, setRankingType] = useState<RankingType>('WorldRankings');
  const [season, setSeason] = useState<number>(2024);
  
  // Fetch rankings based on selected filters
  const { data: rankings, loading, error } = useRankings(rankingType, season);

  // Clear cache on mount to ensure fresh data
  useEffect(() => {
    // Clear API cache to get fresh data
    import('../api/snooker').then(api => {
      api.clearApiCache();
      console.log('🔄 Cache cleared, fresh data will be fetched');
    });
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newRankingType: RankingType, newSeason: number) => {
    setRankingType(newRankingType);
    setSeason(newSeason);
  }, []);

  // Handle ranking click (placeholder for navigation to player profile)
  const handleRankingClick = useCallback((ranking: Ranking) => {
    console.log('Ranking clicked:', ranking);
    // TODO: Navigate to player profile page
    // This would typically use React Router: navigate(`/players/${ranking.Player_ID}`)
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    // The hook will automatically retry when the component re-renders
    window.location.reload();
  }, []);

  // Determine if we should show money column based on ranking type
  const showMoney = rankingType === 'MoneyRankings' || 
                    rankingType === 'OneYearMoney' || 
                    rankingType === 'TwoYearMoney';

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
            <span style={{ fontSize: '32px' }}>🏆</span>
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
            World Rankings
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            Official world rankings and prize money standings for professional snooker players
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
              <span>↑ Moved Up</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#ef4444', 
                borderRadius: '50%' 
              }}></span>
              <span>↓ Moved Down</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#9ca3af', 
                borderRadius: '50%' 
              }}></span>
              <span>→ No Change</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '32px' }}>
          <RankingFilters
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </div>

        {/* Rankings list */}
        <RankingsList
          rankings={rankings || []}
          loading={loading}
          error={error}
          onRankingClick={handleRankingClick}
          onRetry={handleRetry}
          showMoney={showMoney}
        />
      </div>
    </div>
  );
};
