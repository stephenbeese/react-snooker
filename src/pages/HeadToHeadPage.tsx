/**
 * HeadToHeadPage component - Head-to-head comparison view
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useMemo, useEffect } from 'react';
import { useAllPlayers, useHeadToHead } from '../hooks/useSnookerApi';
import { useEventsBySeason } from '../hooks/useSnookerApi';
import { PlayerSelector } from '../components/pages/PlayerSelector';
import { H2HStats } from '../components/pages/H2HStats';
import { H2HChart } from '../components/pages/H2HChart';
import { H2HMatchHistory } from '../components/pages/H2HMatchHistory';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { 
  calculateH2HWinPercentage, 
  groupH2HByEventType 
} from '../utils/h2hUtils';

export const HeadToHeadPage = () => {
  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch all players for selection
  const { data: players, loading: playersLoading, error: playersError } = useAllPlayers(2024, 'p');

  // Fetch head-to-head data when both players are selected
  const { 
    data: h2hMatches, 
    loading: h2hLoading, 
    error: h2hError 
  } = useHeadToHead(
    player1Id || 0, 
    player2Id || 0,
    -1 // All seasons
  );

  // Fetch events for event type breakdown
  const { data: events } = useEventsBySeason(-1); // All seasons

  // Calculate H2H statistics
  const h2hStats = useMemo(() => {
    if (!h2hMatches || !player1Id || !player2Id) return null;
    return calculateH2HWinPercentage(h2hMatches, player1Id, player2Id);
  }, [h2hMatches, player1Id, player2Id]);

  // Calculate event type breakdown
  const eventTypeBreakdown = useMemo(() => {
    if (!h2hMatches || !events || !player1Id || !player2Id) return [];
    return groupH2HByEventType(h2hMatches, events, player1Id, player2Id);
  }, [h2hMatches, events, player1Id, player2Id]);

  // Handle player selection
  const handlePlayersSelected = (p1Id: number, p2Id: number) => {
    setPlayer1Id(p1Id);
    setPlayer2Id(p2Id);
    setShowComparison(true);
  };

  // Reset comparison
  const handleReset = () => {
    setPlayer1Id(null);
    setPlayer2Id(null);
    setShowComparison(false);
  };

  // Get player names
  const player1Name = players?.find(p => p.ID === player1Id)?.Name || 'Player 1';
  const player2Name = players?.find(p => p.ID === player2Id)?.Name || 'Player 2';

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
        {/* Page Header */}
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
            <span style={{ fontSize: '32px' }}>⚔️</span>
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
            Head-to-Head Comparison
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            Compare the historical records between any two professional players
          </p>
        </div>

        {/* Error Handling */}
        {playersError && (
          <ErrorMessage 
            message="Unable to load players. Please try again."
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Player Selection */}
        {!showComparison && (
          <PlayerSelector
            players={players || []}
            onPlayersSelected={handlePlayersSelected}
            loading={playersLoading}
          />
        )}

        {/* Comparison Results */}
        {showComparison && player1Id && player2Id && (
          <div className="space-y-6">
            {/* Reset Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                ← Select Different Players
              </button>
            </div>

            {/* Loading State */}
            {h2hLoading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {/* Error State */}
            {h2hError && (
              <ErrorMessage 
                message="Unable to load head-to-head data. Please try again."
                onRetry={() => window.location.reload()}
              />
            )}

            {/* H2H Statistics */}
            {!h2hLoading && !h2hError && h2hStats && (
              <>
                <H2HStats stats={h2hStats} />

                {/* Event Type Breakdown Chart */}
                {eventTypeBreakdown.length > 0 && (
                  <H2HChart
                    eventTypeBreakdown={eventTypeBreakdown}
                    player1Name={player1Name}
                    player2Name={player2Name}
                  />
                )}

                {/* Match History */}
                {h2hMatches && h2hMatches.length > 0 && (
                  <H2HMatchHistory
                    matches={h2hMatches}
                    player1Id={player1Id}
                    player2Id={player2Id}
                    player1Name={player1Name}
                    player2Name={player2Name}
                  />
                )}

                {/* No Matches Found */}
                {h2hMatches && h2hMatches.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-6xl mb-4">🤷</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Matches Found
                    </h3>
                    <p className="text-gray-600">
                      These players have not faced each other in recorded matches.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
