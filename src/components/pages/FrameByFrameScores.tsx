/**
 * FrameByFrameScores component - Displays frame-by-frame breakdown of a match
 * Shows individual frame scores and highlights winners
 * 
 * **Validates: Requirement 3.3**
 */

import type { Frame } from '../../types';

interface FrameByFrameScoresProps {
  frames?: Frame[];
  player1Name: string;
  player2Name: string;
}

export const FrameByFrameScores = ({ frames, player1Name, player2Name }: FrameByFrameScoresProps) => {
  if (!frames || frames.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 16px',
        color: '#6b7280',
      }}>
        <p style={{ fontSize: '16px' }}>
          No frame-by-frame scores available for this match.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gap: '16px',
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '100px 1fr 100px 100px 1fr 150px',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        color: '#374151',
      }}>
        <div>Frame</div>
        <div style={{ textAlign: 'right' }}>{player1Name}</div>
        <div style={{ textAlign: 'center' }}>Score</div>
        <div style={{ textAlign: 'center' }}>Score</div>
        <div style={{ textAlign: 'left' }}>{player2Name}</div>
        <div style={{ textAlign: 'center' }}>Highest Break</div>
      </div>

      {/* Frame Rows */}
      {frames.map((frame) => {
        // Determine winner by score
        const p1Wins = frame.Player1_Score > frame.Player2_Score;
        const p2Wins = frame.Player2_Score > frame.Player1_Score;

        return (
          <div
            key={frame.Frame_Number}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 100px 100px 1fr 150px',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            {/* Frame Number */}
            <div style={{
              fontWeight: '600',
              color: '#111827',
              fontSize: '14px',
            }}>
              Frame {frame.Frame_Number}
            </div>

            {/* Player 1 Name */}
            <div style={{
              textAlign: 'right',
              fontSize: '14px',
              color: p1Wins ? '#10b981' : '#6b7280',
              fontWeight: p1Wins ? '600' : '400',
            }}>
              {player1Name}
            </div>

            {/* Player 1 Score */}
            <div style={{
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: p1Wins ? '#10b981' : '#6b7280',
            }}>
              {frame.Player1_Score}
            </div>

            {/* Player 2 Score */}
            <div style={{
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: p2Wins ? '#10b981' : '#6b7280',
            }}>
              {frame.Player2_Score}
            </div>

            {/* Player 2 Name */}
            <div style={{
              textAlign: 'left',
              fontSize: '14px',
              color: p2Wins ? '#10b981' : '#6b7280',
              fontWeight: p2Wins ? '600' : '400',
            }}>
              {player2Name}
            </div>

            {/* Highest Break */}
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#374151',
            }}>
              {frame.Break ? (
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: frame.Break >= 100 ? '#fef3c7' : '#f3f4f6',
                  color: frame.Break >= 100 ? '#92400e' : '#374151',
                  borderRadius: '9999px',
                  fontWeight: '600',
                }}>
                  Break: {frame.Break}
                </span>
              ) : (
                <span style={{ color: '#9ca3af' }}>-</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
