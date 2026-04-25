/**
 * MatchResult component - Match score display
 */

import type { Match } from '../../types';

interface MatchResultProps {
  match: Match;
  onClick?: () => void;
}

export const MatchResult = ({ match, onClick }: MatchResultProps) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
        <span>{match.Date_Time ? new Date(match.Date_Time).toLocaleDateString() : 'TBD'}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          match.Status === 'R' 
            ? 'bg-green-100 text-green-800' 
            : match.Status === 'U'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {match.Status === 'R' ? 'Completed' : match.Status === 'U' ? 'Upcoming' : 'Abandoned'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 text-right">
          <div className="font-medium text-gray-900">{match.Player1_Name}</div>
          <div className="text-2xl font-bold text-gray-800">{match.Player1_Score}</div>
        </div>
        <div className="px-4 text-gray-500 font-medium">vs</div>
        <div className="flex-1 text-left">
          <div className="font-medium text-gray-900">{match.Player2_Name}</div>
          <div className="text-2xl font-bold text-gray-800">{match.Player2_Score}</div>
        </div>
      </div>
      {match.Duration && (
        <p className="text-sm text-gray-600 mt-3 text-center">Duration: {match.Duration}</p>
      )}
    </div>
  );
};
