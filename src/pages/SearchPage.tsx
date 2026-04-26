/**
 * SearchPage - Dedicated page for search functionality
 */

import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchResults } from '../components/pages/SearchResults';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialSearchTerm = searchParams.get('q') || '';

  const handlePlayerClick = (playerId: number) => {
    navigate(`/players/${playerId}`);
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const handleMatchClick = (matchId: number) => {
    navigate(`/matches/${matchId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Search</h1>
            <p className="mt-2 text-gray-600">
              Search for players, events, and matches across the snooker database.
            </p>
            {initialSearchTerm && (
              <p className="mt-2 text-sm text-gray-500">
                Showing results for: <span className="font-medium">"{initialSearchTerm}"</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="py-8">
        <SearchResults
          onPlayerClick={handlePlayerClick}
          onEventClick={handleEventClick}
          onMatchClick={handleMatchClick}
          initialSearchTerm={initialSearchTerm}
          maxResultsPerType={10}
        />
      </main>
    </div>
  );
};