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
    <div className="match-result" onClick={onClick}>
      <div className="match-header">
        <span>{match.Date_Time}</span>
        <span>{match.Status === 'R' ? 'Completed' : 'Upcoming'}</span>
      </div>
      <div className="match-score">
        <div className="player">
          <span className="name">{match.Player1_Name}</span>
          <span className="score">{match.Player1_Score}</span>
        </div>
        <span className="vs">vs</span>
        <div className="player">
          <span className="name">{match.Player2_Name}</span>
          <span className="score">{match.Player2_Score}</span>
        </div>
      </div>
      {match.Duration && (
        <p className="duration">Duration: {match.Duration}</p>
      )}
    </div>
  );
};
