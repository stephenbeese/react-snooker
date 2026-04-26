/**
 * RankingsList component - Paginated rankings display
 */

import { useState } from 'react';
import type { Ranking } from '../../types';
import { RankingRow } from '../common/RankingRow';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface RankingsListProps {
  rankings: Ranking[];
  loading: boolean;
  error: Error | null;
  onRankingClick?: (ranking: Ranking) => void;
  onRetry?: () => void;
  showMoney?: boolean;
}

const RANKINGS_PER_PAGE = 50;

export const RankingsList = ({ 
  rankings, 
  loading, 
  error, 
  onRankingClick,
  onRetry,
  showMoney = false
}: RankingsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return <LoadingSpinner message="Loading rankings..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error.message || "Unable to load rankings. Please try again."} 
        onRetry={onRetry}
      />
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-lg">No rankings found.</p>
      </div>
    );
  }

  // Calculate pagination
  const sortedRankings = [...rankings].sort((a, b) => a.Position - b.Position);
  const totalPages = Math.ceil(sortedRankings.length / RANKINGS_PER_PAGE);
  const startIndex = (currentPage - 1) * RANKINGS_PER_PAGE;
  const endIndex = startIndex + RANKINGS_PER_PAGE;
  const currentRankings = sortedRankings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of rankings list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationButton = (page: number, label?: string) => (
    <button
      key={page}
      onClick={() => handlePageChange(page)}
      disabled={page === currentPage}
      className={`px-3 py-2 mx-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        page === currentPage
          ? 'bg-blue-600 text-white cursor-default'
          : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
      }`}
      aria-label={label || `Go to page ${page}`}
      aria-current={page === currentPage ? 'page' : undefined}
    >
      {label || page}
    </button>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    
    // Always show first page
    if (currentPage > 3) {
      pages.push(renderPaginationButton(1));
      if (currentPage > 4) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Show pages around current page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPaginationButton(i));
    }

    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(renderPaginationButton(totalPages));
    }

    return (
      <div className="flex justify-center items-center mt-8 mb-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go to previous page"
        >
          Previous
        </button>
        
        {pages}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Results summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedRankings.length)} of {sortedRankings.length} rankings
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </p>
      </div>

      {/* Rankings table */}
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Nationality
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Points
                </th>
                {showMoney && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Prize Money
                  </th>
                )}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRankings.map((ranking) => (
                <RankingRow
                  key={ranking.Player_ID}
                  ranking={ranking}
                  onClick={onRankingClick ? () => onRankingClick(ranking) : undefined}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};
