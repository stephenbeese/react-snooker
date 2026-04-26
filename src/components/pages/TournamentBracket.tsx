/**
 * TournamentBracket component - Interactive tournament bracket display
 * Supports single-elimination format with player seeding and match progression
 */

import { useState, useMemo, useCallback } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Match, Event, Round } from '../../types';

interface TournamentBracketProps {
  event: Event;
  matches: Match[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  onMatchClick?: (match: Match) => void;
}

interface BracketMatch {
  match: Match;
  round: number;
  position: number;
  isWinnerPath: boolean;
}

interface BracketRound {
  roundNumber: number;
  roundName: string;
  matches: BracketMatch[];
}

// Helper function to get round name based on position and total rounds
const getRoundName = (roundIndex: number, totalRounds: number): string => {
  const roundsFromEnd = totalRounds - roundIndex - 1;
  
  switch (roundsFromEnd) {
    case 0: return 'Final';
    case 1: return 'Semi-Final';
    case 2: return 'Quarter-Final';
    case 3: return 'Round of 16';
    case 4: return 'Round of 32';
    case 5: return 'Round of 64';
    case 6: return 'Round of 128';
    default: return `Round ${roundIndex + 1}`;
  }
};

export const TournamentBracket = ({
  event,
  matches,
  loading,
  error,
  onRetry,
  onMatchClick
}: TournamentBracketProps) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Process matches into bracket structure
  const bracketData = useMemo(() => {
    if (!matches || matches.length === 0) return { rounds: [], winner: null };

    // Group matches by round
    const roundGroups = new Map<number, Match[]>();
    matches.forEach(match => {
      const roundId = match.Round_ID || 0;
      if (!roundGroups.has(roundId)) {
        roundGroups.set(roundId, []);
      }
      roundGroups.get(roundId)!.push(match);
    });

    // Sort rounds by round number (assuming higher round ID = later round)
    const sortedRounds = Array.from(roundGroups.entries())
      .sort(([a], [b]) => a - b)
      .map(([roundId, roundMatches]) => ({
        roundId,
        matches: roundMatches.sort((a, b) => (a.Match_Number || 0) - (b.Match_Number || 0))
      }));

    // Find the winner (player who won the final match)
    let winner: { playerId: number; playerName: string } | null = null;
    if (sortedRounds.length > 0) {
      const finalRound = sortedRounds[sortedRounds.length - 1];
      const finalMatch = finalRound.matches.find(match => match.Status === 'R');
      if (finalMatch) {
        if (finalMatch.Player1_Score > finalMatch.Player2_Score) {
          winner = { playerId: finalMatch.Player1_ID, playerName: finalMatch.Player1_Name };
        } else if (finalMatch.Player2_Score > finalMatch.Player1_Score) {
          winner = { playerId: finalMatch.Player2_ID, playerName: finalMatch.Player2_Name };
        }
      }
    }

    // Trace winner's path through the bracket
    const winnerPath = new Set<number>();
    if (winner) {
      // Work backwards from final to first round to find winner's path
      let currentPlayerId = winner.playerId;
      for (let i = sortedRounds.length - 1; i >= 0; i--) {
        const round = sortedRounds[i];
        const winnerMatch = round.matches.find(match => {
          if (match.Status !== 'R') return false;
          const player1Won = match.Player1_Score > match.Player2_Score;
          const player2Won = match.Player2_Score > match.Player1_Score;
          
          return (player1Won && match.Player1_ID === currentPlayerId) ||
                 (player2Won && match.Player2_ID === currentPlayerId);
        });
        
        if (winnerMatch) {
          winnerPath.add(winnerMatch.ID);
          // For next iteration, find who the winner beat in this match
          if (winnerMatch.Player1_ID === currentPlayerId) {
            // Winner was player1, so they came from a previous match as player1
            // Keep currentPlayerId the same for tracing back
          } else {
            // Winner was player2, so they came from a previous match as player2
            // Keep currentPlayerId the same for tracing back
          }
        }
      }
    }

    // Create bracket rounds with positioning
    const rounds: BracketRound[] = sortedRounds.map((round, roundIndex) => {
      const roundName = getRoundName(roundIndex, sortedRounds.length);
      
      const bracketMatches: BracketMatch[] = round.matches.map((match, matchIndex) => ({
        match,
        round: roundIndex,
        position: matchIndex,
        isWinnerPath: winnerPath.has(match.ID)
      }));

      return {
        roundNumber: roundIndex,
        roundName,
        matches: bracketMatches
      };
    });

    return { rounds, winner };
  }, [matches]);

  // Handle match click
  const handleMatchClick = useCallback((match: Match) => {
    setSelectedMatch(match);
    onMatchClick?.(match);
  }, [onMatchClick]);

  // Close match details
  const handleCloseDetails = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message="Unable to load tournament bracket. Please try again."
        onRetry={onRetry}
      />
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bracket data available for this tournament.</p>
      </div>
    );
  }

  const { rounds, winner } = bracketData;

  if (rounds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tournament bracket is not yet available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tournament Winner */}
      {winner && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="text-2xl">🏆</div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Tournament Winner</h3>
              <p className="text-yellow-700">{winner.playerName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bracket Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tournament Bracket</h3>
        
        <div className="overflow-x-auto">
          <div className="flex space-x-8 min-w-max">
            {rounds.map((round) => (
              <div key={round.roundNumber} className="flex flex-col space-y-4 min-w-[200px]">
                {/* Round Header */}
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 bg-gray-50 rounded px-3 py-1">
                    {round.roundName}
                  </h4>
                </div>
                
                {/* Round Matches */}
                <div className="space-y-3">
                  {round.matches.map((bracketMatch) => (
                    <MatchCard
                      key={bracketMatch.match.ID}
                      bracketMatch={bracketMatch}
                      onClick={() => handleMatchClick(bracketMatch.match)}
                      isSelected={selectedMatch?.ID === bracketMatch.match.ID}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={handleCloseDetails}
        />
      )}

      {/* Bracket Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600">Completed Match</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-gray-600">Upcoming Match</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
            <span className="text-gray-600">Winner's Path</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Match Card Component
interface MatchCardProps {
  bracketMatch: BracketMatch;
  onClick: () => void;
  isSelected: boolean;
}

const MatchCard = ({ bracketMatch, onClick, isSelected }: MatchCardProps) => {
  const { match, isWinnerPath } = bracketMatch;
  const isCompleted = match.Status === 'R';
  const isUpcoming = match.Status === 'U';

  // Determine winner for completed matches
  let player1Won = false;
  let player2Won = false;
  if (isCompleted) {
    player1Won = match.Player1_Score > match.Player2_Score;
    player2Won = match.Player2_Score > match.Player1_Score;
  }

  const cardClasses = [
    'border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md',
    isSelected ? 'ring-2 ring-blue-500 border-blue-300' : '',
    isWinnerPath ? 'border-2 border-yellow-400 bg-yellow-50' : '',
    isCompleted ? 'bg-green-50 border-green-200' : '',
    isUpcoming ? 'bg-blue-50 border-blue-200' : '',
    !isCompleted && !isUpcoming ? 'bg-gray-50 border-gray-200' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Match between ${match.Player1_Name} and ${match.Player2_Name}`}
    >
      {/* Player 1 */}
      <div className={`flex justify-between items-center py-1 ${player1Won ? 'font-semibold text-green-700' : ''}`}>
        <span className="text-sm truncate">{match.Player1_Name}</span>
        <span className="text-sm ml-2">{isCompleted ? match.Player1_Score : ''}</span>
      </div>
      
      {/* Divider */}
      <div className="border-t border-gray-200 my-1"></div>
      
      {/* Player 2 */}
      <div className={`flex justify-between items-center py-1 ${player2Won ? 'font-semibold text-green-700' : ''}`}>
        <span className="text-sm truncate">{match.Player2_Name}</span>
        <span className="text-sm ml-2">{isCompleted ? match.Player2_Score : ''}</span>
      </div>

      {/* Match Status */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {isCompleted && 'Completed'}
        {isUpcoming && 'Upcoming'}
        {!isCompleted && !isUpcoming && 'TBD'}
      </div>
    </div>
  );
};

// Match Details Modal Component
interface MatchDetailsModalProps {
  match: Match;
  onClose: () => void;
}

const MatchDetailsModal = ({ match, onClose }: MatchDetailsModalProps) => {
  const isCompleted = match.Status === 'R';
  const player1Won = isCompleted && match.Player1_Score > match.Player2_Score;
  const player2Won = isCompleted && match.Player2_Score > match.Player1_Score;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Match Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close match details"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Players and Score */}
          <div className="space-y-3">
            <div className={`flex justify-between items-center p-3 rounded ${player1Won ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <span className={`font-medium ${player1Won ? 'text-green-700' : ''}`}>
                {match.Player1_Name}
              </span>
              <span className={`text-lg font-bold ${player1Won ? 'text-green-700' : ''}`}>
                {isCompleted ? match.Player1_Score : '-'}
              </span>
            </div>
            
            <div className={`flex justify-between items-center p-3 rounded ${player2Won ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <span className={`font-medium ${player2Won ? 'text-green-700' : ''}`}>
                {match.Player2_Name}
              </span>
              <span className={`text-lg font-bold ${player2Won ? 'text-green-700' : ''}`}>
                {isCompleted ? match.Player2_Score : '-'}
              </span>
            </div>
          </div>

          {/* Match Information */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                match.Status === 'R' ? 'text-green-600' : 
                match.Status === 'U' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {match.Status === 'R' ? 'Completed' : 
                 match.Status === 'U' ? 'Upcoming' : 'TBD'}
              </span>
            </div>
            
            {match.Date_Time && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(match.Date_Time).toLocaleDateString()}</span>
              </div>
            )}
            
            {match.Session && (
              <div className="flex justify-between">
                <span className="text-gray-600">Session:</span>
                <span>{match.Session}</span>
              </div>
            )}
            
            {match.Table && (
              <div className="flex justify-between">
                <span className="text-gray-600">Table:</span>
                <span>{match.Table}</span>
              </div>
            )}
            
            {match.Duration && (
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span>{match.Duration}</span>
              </div>
            )}
          </div>

          {/* Frame-by-frame scores if available */}
          {match.Frames && match.Frames.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Frame Scores</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {match.Frames.map((frame) => (
                  <div key={frame.Frame_Number} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>Frame {frame.Frame_Number}</span>
                    <span>{frame.Player1_Score} - {frame.Player2_Score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};