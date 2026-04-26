/**
 * MatchDetailPage component - Individual match details view
 * Displays final score, match duration, date, event, and frame-by-frame breakdown
 * 
 * **Validates: Requirements 3.2, 3.3, 3.5**
 */

import { useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useMatch } from '../hooks/useSnookerApi';
import { FrameByFrameScores } from '../components/pages/FrameByFrameScores';
import { MatchStats } from '../components/pages/MatchStats';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const MatchDetailPage = () => {
  const { matchId: matchIdParam } = useParams<{ matchId: string }>();
  
  // Parse matchId from URL parameter
  const matchId = matchIdParam ? parseInt(matchIdParam, 10) : null;
  
  // Redirect if matchId is invalid
  if (!matchId || isNaN(matchId)) {
    return <Navigate to="/results" replace />;
  }
  
  // For now, we'll use placeholder values for eventId, roundId, and matchNumber
  // In a real implementation, these would come from the match data or be part of the URL
  const eventId = 1; // This should be derived from match data
  const roundId = 1; // This should be derived from match data
  const matchNumber = matchId; // Using matchId as matchNumber for now
  // Fetch match details
  const { data: match, loading, error } = useMatch(eventId, roundId, matchNumber);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (loading) {
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
          <LoadingSpinner message="Loading match details..." />
        </div>
      </div>
    );
  }

  if (error || !match) {
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
          <ErrorMessage
            message="Unable to load match details. Please try again."
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  const matchDate = match.Date_Time ? new Date(match.Date_Time).toLocaleDateString() : 'TBD';
  const matchTime = match.Date_Time ? new Date(match.Date_Time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  const statusText = match.Status === 'R' ? 'Completed' : match.Status === 'U' ? 'Upcoming' : 'Abandoned';
  const statusColor = match.Status === 'R' ? '#10b981' : match.Status === 'U' ? '#3b82f6' : '#6b7280';

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
        {/* Match Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '32px',
          marginBottom: '32px',
        }}>
          {/* Status Badge */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: `${statusColor}15`,
              color: statusColor,
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: statusColor,
              }}></span>
              {statusText}
            </span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Event ID: {match.Event_ID}
            </span>
          </div>

          {/* Players and Score */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '32px',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            {/* Player 1 */}
            <div style={{ textAlign: 'right' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px',
              }}>
                {match.Player1_Name}
              </h2>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: match.Player1_Score > match.Player2_Score ? '#10b981' : '#6b7280',
              }}>
                {match.Player1_Score}
              </div>
            </div>

            {/* VS Divider */}
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#9ca3af',
              padding: '0 16px',
            }}>
              vs
            </div>

            {/* Player 2 */}
            <div style={{ textAlign: 'left' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px',
              }}>
                {match.Player2_Name}
              </h2>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: match.Player2_Score > match.Player1_Score ? '#10b981' : '#6b7280',
              }}>
                {match.Player2_Score}
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Date</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {matchDate} {matchTime && `at ${matchTime}`}
              </div>
            </div>
            {match.Duration && (
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Duration</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  {match.Duration} minutes
                </div>
              </div>
            )}
            {match.Table && (
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Table</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  {match.Table}
                </div>
              </div>
            )}
            {match.Session && (
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Session</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                  Session {match.Session}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Match Statistics */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '24px',
          }}>
            Match Statistics
          </h3>
          <MatchStats match={match} />
        </div>

        {/* Frame-by-Frame Scores */}
        {match.Frames && match.Frames.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '32px',
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '24px',
            }}>
              Frame-by-Frame Scores
            </h3>
            <FrameByFrameScores
              frames={match.Frames}
              player1Name={match.Player1_Name}
              player2Name={match.Player2_Name}
            />
          </div>
        )}
      </div>
    </div>
  );
};
