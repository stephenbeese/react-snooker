/**
 * MatchResult component - Match score display
 */

import type { Match } from '../../types';

interface MatchResultProps {
  match: Match;
  onClick?: () => void;
  showEvent?: boolean;
  showDate?: boolean;
  compact?: boolean;
}

export const MatchResult = ({ 
  match, 
  onClick, 
  showEvent = false, 
  showDate = true, 
  compact = false 
}: MatchResultProps) => {
  const matchDate = match.Date_Time ? new Date(match.Date_Time).toLocaleDateString() : 'TBD';
  const statusText = match.Status === 'R' ? 'Completed' : match.Status === 'U' ? 'Upcoming' : 'Abandoned';
  
  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg ${compact ? 'p-3' : 'p-4'} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500' : ''
      }`}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      aria-label={`Match between ${match.Player1_Name} and ${match.Player2_Name}, score ${match.Player1_Score}-${match.Player2_Score}, ${statusText}`}
    >
      {(showDate || showEvent) && (
        <div className={`flex justify-between items-center ${compact ? 'mb-2' : 'mb-3'} text-sm text-gray-600`}>
          {showDate && <span>{matchDate}</span>}
          {showEvent && <span>Event ID: {match.Event_ID}</span>}
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            match.Status === 'R' 
              ? 'bg-green-100 text-green-800' 
              : match.Status === 'U'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {statusText}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-right">
          <div className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>{match.Player1_Name}</div>
          <div className={`font-bold text-gray-800 ${compact ? 'text-lg' : 'text-2xl'}`}>{match.Player1_Score}</div>
        </div>
        <div className={`px-4 text-gray-500 font-medium ${compact ? 'text-sm' : ''}`} aria-hidden="true">vs</div>
        <div className="flex-1 text-left">
          <div className={`font-medium text-gray-900 ${compact ? 'text-sm' : ''}`}>{match.Player2_Name}</div>
          <div className={`font-bold text-gray-800 ${compact ? 'text-lg' : 'text-2xl'}`}>{match.Player2_Score}</div>
        </div>
      </div>
      {match.Duration && !compact && (
        <p className="text-sm text-gray-600 mt-3 text-center">Duration: {match.Duration}</p>
      )}
      {match.Table && compact && (
        <p className="text-xs text-gray-500 mt-1 text-center">Table: {match.Table}</p>
      )}
    </div>
  );
};
