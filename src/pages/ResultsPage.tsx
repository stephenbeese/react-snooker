/**
 * ResultsPage component - Main results view with filtering
 */

import { useState, useMemo, useCallback } from 'react';
import { useRecentResults } from '../hooks/useSnookerApi';
import { ResultsList } from '../components/pages/ResultsList';
import { ResultFilters } from '../components/pages/ResultFilters';
import { filterMatches, sortMatchesByDateDesc, type MatchFilterCriteria } from '../utils/matchUtils';
import type { Match } from '../types';

export const ResultsPage = () => {
  const [filterCriteria, setFilterCriteria] = useState<MatchFilterCriteria>({});
  
  // Fetch recent results (last 30 days by default)
  const { data: matches, loading, error } = useRecentResults(30);

  // Apply filters and sort by date (most recent first)
  const filteredAndSortedMatches = useMemo(() => {
    if (!matches) return [];
    
    // First filter the matches
    const filtered = filterMatches(matches, filterCriteria);
    
    // Then sort by date descending (most recent first)
    return sortMatchesByDateDesc(filtered);
  }, [matches, filterCriteria]);

  // Handle filter changes
  const handleFiltersChange = useCallback((criteria: MatchFilterCriteria) => {
    setFilterCriteria(criteria);
  }, []);

  // Handle match click (placeholder for navigation to match detail)
  const handleMatchClick = useCallback((match: Match) => {
    console.log('Match clicked:', match);
    // TODO: Navigate to match detail page
    // This would typically use React Router: navigate(`/matches/${match.ID}`)
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            marginBottom: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }}>
            <span style={{ fontSize: '32px' }}>🏆</span>
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #111827 0%, #059669 50%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            lineHeight: '1.2',
          }}>
            Match Results
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            Browse recent match results, scores, and tournament outcomes
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
              <span>Completed Matches</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%' 
              }}></span>
              <span>Upcoming Matches</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#6b7280', 
                borderRadius: '50%' 
              }}></span>
              <span>Abandoned Matches</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '32px' }}>
          <ResultFilters
            matches={matches || []}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </div>

        {/* Results list */}
        <ResultsList
          matches={filteredAndSortedMatches}
          loading={loading}
          error={error}
          onMatchClick={handleMatchClick}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};
