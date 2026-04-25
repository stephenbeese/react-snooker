/**
 * MatchHistory component - Displays player's match history
 */

import { useState, useMemo } from 'react';
import type { Match } from '../../types/snooker';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface MatchHistoryProps {
  matches: Match[];
  playerId: number;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export const MatchHistory = ({
  matches,
  playerId,
  loading,
  error,
  onRetry
}: MatchHistoryProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'R' | 'U' | 'A'>('all');
  const matchesPerPage = 10;

  // Filter matches by status
  const filteredMatches = useMemo(() => {
    if (statusFilter === 'all') return matches;
    return matches.filter(match => match.Status === statusFilter);
  }, [matches, statusFilter]);

  // Paginate matches
  const paginatedMatches = useMemo(() => {
    const startIndex = (currentPage - 1) * matchesPerPage;
    const endIndex = startIndex + matchesPerPage;
    return filteredMatches.slice(startIndex, endIndex);
  }, [filteredMatches, currentPage, matchesPerPage]);

  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get match result for the player
  const getMatchResult = (match: Match) => {
    const isPlayer1 = match.Player1_ID === playerId;
    const playerScore = isPlayer1 ? match.Player1_Score : match.Player2_Score;
    const opponentScore = isPlayer1 ? match.Player2_Score : match.Player1_Score;
    const opponentName = isPlayer1 ? match.Player2_Name : match.Player1_Name;

    if (match.Status === 'U') {
      return { result: 'upcoming', playerScore, opponentScore, opponentName };
    }
    
    if (match.Status === 'A') {
      return { result: 'abandoned', playerScore, opponentScore, opponentName };
    }

    if (playerScore > opponentScore) {
      return { result: 'win', playerScore, opponentScore, opponentName };
    } else if (opponentScore > playerScore) {
      return { result: 'loss', playerScore, opponentScore, opponentName };
    } else {
      return { result: 'draw', playerScore, opponentScore, opponentName };
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'R': return 'bg-green-100 text-green-800';
      case 'U': return 'bg-blue-100 text-blue-800';
      case 'A': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get result badge color
  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'win': return 'bg-green-100 text-green-800';
      case 'loss': return 'bg-red-100 text-red-800';
      case 'draw': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'abandoned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Match History</h2>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Match History</h2>
        <ErrorMessage
          message="Unable to load match history."
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
          Match History ({filteredMatches.length} matches)
        </h2>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'R' | 'U' | 'A');
              setCurrentPage(1); // Reset to first page when filtering
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Matches</option>
            <option value="R">Completed</option>
            <option value="U">Upcoming</option>
            <option value="A">Abandoned</option>
          </select>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No matches found for the selected criteria.
        </div>
      ) : (
        <>
          {/* Matches List */}
          <div className="space-y-4">
            {paginatedMatches.map((match) => {
              const matchResult = getMatchResult(match);
              
              return (
                <div
                  key={match.ID}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          vs {matchResult.opponentName}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultBadgeColor(matchResult.result)}`}>
                          {matchResult.result.charAt(0).toUpperCase() + matchResult.result.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(match.Status)}`}>
                          {match.Status === 'R' ? 'Completed' : match.Status === 'U' ? 'Upcoming' : 'Abandoned'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Date: {formatDate(match.Date_Time)}</div>
                        <div>Event ID: {match.Event_ID}</div>
                        {match.Session && <div>Session: {match.Session}</div>}
                        {match.Table && <div>Table: {match.Table}</div>}
                        {match.Duration && <div>Duration: {match.Duration}</div>}
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-0 sm:ml-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {matchResult.playerScore} - {matchResult.opponentScore}
                        </div>
                        {match.Frames && match.Frames.length > 0 && (
                          <div className="text-sm text-gray-500">
                            {match.Frames.length} frames played
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * matchesPerPage) + 1} to{' '}
                {Math.min(currentPage * matchesPerPage, filteredMatches.length)} of{' '}
                {filteredMatches.length} matches
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};