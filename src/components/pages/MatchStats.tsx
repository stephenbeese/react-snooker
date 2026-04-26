/**
 * MatchStats component - Displays match statistics
 * Shows aggregate statistics like total frames, highest break, averages, etc.
 * 
 * **Validates: Requirements 3.2, 3.5**
 */

import type { Match } from '../../types';

interface MatchStatsProps {
  match: Match;
}

export const MatchStats = ({ match }: MatchStatsProps) => {
  const frames = match.Frames || [];
  const totalFrames = frames.length;
  
  // Calculate statistics
  const player1FramesWon = match.Player1_Score;
  const player2FramesWon = match.Player2_Score;
  
  // Calculate highest break
  const highestBreak = frames.reduce((max, frame) => {
    return frame.Break && frame.Break > max ? frame.Break : max;
  }, 0);
  
  // Calculate average frame scores
  const player1TotalScore = frames.reduce((sum, frame) => sum + frame.Player1_Score, 0);
  const player2TotalScore = frames.reduce((sum, frame) => sum + frame.Player2_Score, 0);
  const player1AvgScore = totalFrames > 0 ? Math.round(player1TotalScore / totalFrames) : 0;
  const player2AvgScore = totalFrames > 0 ? Math.round(player2TotalScore / totalFrames) : 0;
  
  // Calculate frame win percentages
  const player1WinPercentage = totalFrames > 0 ? Math.round((player1FramesWon / totalFrames) * 100) : 0;
  const player2WinPercentage = totalFrames > 0 ? Math.round((player2FramesWon / totalFrames) * 100) : 0;
  
  // Count century breaks (100+)
  const centuryBreaks = frames.filter(frame => frame.Break && frame.Break >= 100).length;
  
  // Format duration
  const formatDuration = (minutes?: string) => {
    if (!minutes) return 'N/A';
    const mins = parseInt(minutes);
    if (isNaN(mins)) return minutes;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins} minutes`;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
    }}>
      {/* Total Frames */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '8px',
          fontWeight: '500',
        }}>
          Total Frames
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#111827',
        }}>
          {totalFrames}
        </div>
      </div>

      {/* Frames Won - Player 1 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f0fdf4',
        borderRadius: '12px',
        border: '1px solid #bbf7d0',
      }}>
        <div style={{
          fontSize: '14px',
          color: '#15803d',
          marginBottom: '8px',
          fontWeight: '500',
        }}>
          {match.Player1_Name} - Frames Won
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#15803d',
        }}>
          {player1FramesWon}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#15803d',
          marginTop: '4px',
        }}>
          {player1WinPercentage}% win rate
        </div>
      </div>

      {/* Frames Won - Player 2 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#eff6ff',
        borderRadius: '12px',
        border: '1px solid #bfdbfe',
      }}>
        <div style={{
          fontSize: '14px',
          color: '#1e40af',
          marginBottom: '8px',
          fontWeight: '500',
        }}>
          {match.Player2_Name} - Frames Won
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1e40af',
        }}>
          {player2FramesWon}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#1e40af',
          marginTop: '4px',
        }}>
          {player2WinPercentage}% win rate
        </div>
      </div>

      {/* Highest Break */}
      <div style={{
        padding: '20px',
        backgroundColor: highestBreak >= 100 ? '#fef3c7' : '#f9fafb',
        borderRadius: '12px',
        border: `1px solid ${highestBreak >= 100 ? '#fde68a' : '#e5e7eb'}`,
      }}>
        <div style={{
          fontSize: '14px',
          color: highestBreak >= 100 ? '#92400e' : '#6b7280',
          marginBottom: '8px',
          fontWeight: '500',
        }}>
          Highest Break
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: highestBreak >= 100 ? '#92400e' : '#111827',
        }}>
          {highestBreak > 0 ? highestBreak : 'N/A'}
        </div>
      </div>

      {/* Century Breaks */}
      <div style={{
        padding: '20px',
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
        border: '1px solid #fde68a',
      }}>
        <div style={{
          fontSize: '14px',
          color: '#92400e',
          marginBottom: '8px',
          fontWeight: '500',
        }}>
          Century Breaks
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#92400e',
        }}>
          {centuryBreaks}
        </div>
      </div>

      {/* Duration */}
      {match.Duration && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            Duration
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
          }}>
            {formatDuration(match.Duration)}
          </div>
        </div>
      )}

      {/* Average Frame Score - Player 1 */}
      {totalFrames > 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          border: '1px solid #bbf7d0',
        }}>
          <div style={{
            fontSize: '14px',
            color: '#15803d',
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            {match.Player1_Name} - Avg Score
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#15803d',
          }}>
            {player1AvgScore}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#15803d',
            marginTop: '4px',
          }}>
            per frame
          </div>
        </div>
      )}

      {/* Average Frame Score - Player 2 */}
      {totalFrames > 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: '#eff6ff',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
        }}>
          <div style={{
            fontSize: '14px',
            color: '#1e40af',
            marginBottom: '8px',
            fontWeight: '500',
          }}>
            {match.Player2_Name} - Avg Score
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1e40af',
          }}>
            {player2AvgScore}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#1e40af',
            marginTop: '4px',
          }}>
            per frame
          </div>
        </div>
      )}
    </div>
  );
};
