/**
 * PlayerList component - Paginated player display
 */

import { useState } from 'react';
import type { Player } from '../../types';
import { PlayerCard } from '../common/PlayerCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface PlayerListProps {
  players: Player[];
  loading: boolean;
  error: Error | null;
  onPlayerClick?: (player: Player) => void;
  onRetry?: () => void;
}

const PLAYERS_PER_PAGE = 20;

export const PlayerList = ({ 
  players, 
  loading, 
  error, 
  onPlayerClick,
  onRetry 
}: PlayerListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return <LoadingSpinner message="Loading players..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error.message || "Unable to load players. Please try again."} 
        onRetry={onRetry}
      />
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-lg">No players found matching your criteria.</p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(players.length / PLAYERS_PER_PAGE);
  const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
  const endIndex = startIndex + PLAYERS_PER_PAGE;
  const currentPlayers = players.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of player list
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
          Showing {startIndex + 1}-{Math.min(endIndex, players.length)} of {players.length} players
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </p>
      </div>

      {/* Player grid - Modern responsive layout */}
      <div className="players-grid">
        {currentPlayers.map((player) => (
          <PlayerCard
            key={player.ID}
            player={player}
            onClick={onPlayerClick ? () => onPlayerClick(player) : undefined}
          />
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};