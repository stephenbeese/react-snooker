/**
 * PlayerCard component - Modern player display card
 */

import type { Player } from '../../types';
import { WatchlistButton } from './WatchlistButton';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  showWatchlistButton?: boolean;
}

export const PlayerCard = ({ player, onClick, showWatchlistButton = true }: PlayerCardProps) => {
  // Generate a placeholder image URL if no image is available
  const getPlayerImageUrl = (player: Player): string => {
    if (player.Image_Url) {
      return player.Image_Url;
    }
    // Use a placeholder service with the player's name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(player.Name || 'Unknown')}&size=200&background=1f2937&color=ffffff&bold=true`;
  };

  // Get flag emoji for nationality
  const getFlagEmoji = (nationality: string): string => {
    const flagMap: Record<string, string> = {
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      'Northern Ireland': '🇬🇧',
      'Ireland': '🇮🇪',
      'Australia': '🇦🇺',
      'China': '🇨🇳',
      'Hong Kong': '🇭🇰',
      'Thailand': '🇹🇭',
      'Belgium': '🇧🇪',
      'Germany': '🇩🇪',
      'Malta': '🇲🇹',
      'Canada': '🇨🇦',
      'USA': '🇺🇸',
      'Brazil': '🇧🇷',
      'Iran': '🇮🇷',
      'India': '🇮🇳',
      'Pakistan': '🇵🇰',
      'Singapore': '🇸🇬',
      'Malaysia': '🇲🇾',
      'Cyprus': '🇨🇾',
      'Switzerland': '🇨🇭',
      'France': '🇫🇷',
      'Israel': '🇮🇱',
      'South Africa': '🇿🇦',
    };
    return flagMap[nationality] || '🌍';
  };

  return (
    <div 
      className="player-card"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      aria-label={`View details for ${player.Name || 'Unknown Player'} from ${player.Nationality}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        minHeight: '280px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.borderColor = '#3b82f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.borderColor = '#e2e8f0';
      }}
    >
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10,
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: '500',
          background: player.Status === 'P' ? '#d1fae5' : '#fef3c7',
          color: player.Status === 'P' ? '#065f46' : '#92400e',
          border: `1px solid ${player.Status === 'P' ? '#a7f3d0' : '#fde68a'}`,
        }}>
          {player.Status === 'P' ? '🏆 Pro' : '🎯 Amateur'}
        </span>
      </div>

      {/* Player Image */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid #ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'border-color 0.3s ease',
        }}>
          <img 
            src={getPlayerImageUrl(player)} 
            alt={`${player.Name || 'Unknown Player'} profile photo`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // Fallback to a different placeholder if the first one fails
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.Name || 'Unknown')}&size=200&background=6366f1&color=ffffff&bold=true`;
            }}
          />
        </div>
        
        {/* Ranking Badge (if available) */}
        {player.ID <= 16 && (
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'linear-gradient(to right, #fbbf24, #d97706)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '50%',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}>
              #{player.ID}
            </span>
          </div>
        )}
      </div>

      {/* Player Info */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#111827',
          margin: 0,
          lineHeight: '1.4',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {player.Name || 'Unknown Player'}
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#6b7280',
        }}>
          <span style={{ fontSize: '18px' }}>{getFlagEmoji(player.Nationality)}</span>
          <span style={{ fontWeight: '500' }}>{player.Nationality}</span>
        </div>

        {/* Additional Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '8px',
        }}>
          {player.Born && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🎂</span>
              <span>{new Date().getFullYear() - parseInt(player.Born.split('-')[0])} yrs</span>
            </div>
          )}
          {player.Turned_Pro && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⭐</span>
              <span>Pro since {player.Turned_Pro}</span>
            </div>
          )}
        </div>
      </div>

      {/* Watchlist Button */}
      {showWatchlistButton && (
        <div style={{ marginTop: '12px', width: '100%' }}>
          <WatchlistButton 
            playerId={player.ID} 
            playerName={player.Name}
            className="w-full text-sm py-2"
          />
        </div>
      )}
    </div>
  );
};
