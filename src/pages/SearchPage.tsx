/**
 * SearchPage - Dedicated page for search functionality
 */

import { SearchResults } from '../components/pages/SearchResults';

interface SearchPageProps {
  initialSearchTerm?: string;
}

export const SearchPage = ({ initialSearchTerm }: SearchPageProps) => {
  const handlePlayerClick = (playerId: number) => {
    console.log('Navigate to player:', playerId);
    // In a real app, this would navigate to the player profile page
  };

  const handleEventClick = (eventId: number) => {
    console.log('Navigate to event:', eventId);
    // In a real app, this would navigate to the event detail page
  };

  const handleMatchClick = (matchId: number) => {
    console.log('Navigate to match:', matchId);
    // In a real app, this would navigate to the match detail page
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