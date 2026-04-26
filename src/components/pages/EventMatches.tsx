/**
 * EventMatches component - Shows all matches for an event
 */

import { useMemo } from 'react';
import { MatchResult } from '../common/MatchResult';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { Match } from '../../types';

interface EventMatchesProps {
  eventId: number;
  matches: Match[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export const EventMatches = ({ 
  eventId, 
  matches, 
  loading, 
  error, 
  onRetry 
}: EventMatchesProps) => {
  // Group matches by round and sort by match number
  const groupedMatches = useMemo(() => {
    if (!matches || matches.length === 0) return {};

    const groups: Record<string, Match[]> = {};
    
    matches.forEach(match => {
      // Use Round_ID as the grouping key, or create a default group
      const roundKey = match.Round_ID ? `Round ${match.Round_ID}` : 'Matches';
      
      if (!groups[roundKey]) {
        groups[roundKey] = [];
      }
      groups[roundKey].push(match);
    });

    // Sort matches within each group by match number
    Object.keys(groups).forEach(roundKey => {
      groups[roundKey].sort((a, b) => (a.Match_Number || 0) - (b.Match_Number || 0));
    });

    return groups;
  }, [matches]);

  // Get completed and upcoming matches
  const { completedMatches, upcomingMatches } = useMemo(() => {
    const completed = matches.filter(match => match.Status === 'R');
    const upcoming = matches.filter(match => match.Status === 'U');
    
    return {
      completedMatches: completed.sort((a, b) => {
        if (a.Date_Time && b.Date_Time) {
          return new Date(b.Date_Time).getTime() - new Date(a.Date_Time).getTime();
        }
        return 0;
      }),
      upcomingMatches: upcoming.sort((a, b) => {
        if (a.Date_Time && b.Date_Time) {
          return new Date(a.Date_Time).getTime() - new Date(b.Date_Time).getTime();
        }
        return 0;
      })
    };
  }, [matches]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message="Unable to load event matches. Please try again."
        onRetry={onRetry}
      />
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No matches found for this event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Matches ({upcomingMatches.length})
          </h3>
          <div className="space-y-3">
            {upcomingMatches.map(match => (
              <MatchResult
                key={`${match.Event_ID}-${match.Round_ID}-${match.Match_Number}`}
                match={match}
                showEvent={false}
                showDate={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Completed Matches ({completedMatches.length})
          </h3>
          <div className="space-y-3">
            {completedMatches.map(match => (
              <MatchResult
                key={`${match.Event_ID}-${match.Round_ID}-${match.Match_Number}`}
                match={match}
                showEvent={false}
                showDate={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Matches by Round (if we have round information) */}
      {Object.keys(groupedMatches).length > 1 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Matches by Round
          </h3>
          <div className="space-y-6">
            {Object.entries(groupedMatches).map(([roundName, roundMatches]) => (
              <div key={roundName}>
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  {roundName} ({roundMatches.length} matches)
                </h4>
                <div className="space-y-2 pl-4">
                  {roundMatches.map(match => (
                    <MatchResult
                      key={`${match.Event_ID}-${match.Round_ID}-${match.Match_Number}`}
                      match={match}
                      showEvent={false}
                      showDate={true}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Statistics Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Match Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
            <div className="text-gray-600">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedMatches.length}</div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{upcomingMatches.length}</div>
            <div className="text-gray-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {Object.keys(groupedMatches).length}
            </div>
            <div className="text-gray-600">Rounds</div>
          </div>
        </div>
      </div>
    </div>
  );
};