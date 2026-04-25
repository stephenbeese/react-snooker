/**
 * Layout Demo component - Demonstrates usage of all layout components
 * This component shows how to integrate all layout components together
 */

import { useState } from 'react';
import { Layout } from './Layout';

export const LayoutDemo = () => {
  const [searchResults, setSearchResults] = useState<string>('');

  const handleSearch = (term: string) => {
    setSearchResults(term ? `Search results for: "${term}"` : '');
  };

  return (
    <Layout onSearch={handleSearch}>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to Snooker Results</h1>
          <p className="text-xl text-green-100">
            Your comprehensive source for snooker tournament results, player statistics, and live match updates.
          </p>
        </div>

        {/* Search Results */}
        {searchResults && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Search Results</h2>
            <p className="text-blue-700">{searchResults}</p>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tournament Results</h3>
            <p className="text-gray-600">
              Stay up-to-date with the latest tournament results and match scores from professional snooker events.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Player Statistics</h3>
            <p className="text-gray-600">
              Explore comprehensive player profiles, rankings, and performance analytics for all professional players.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Matches</h3>
            <p className="text-gray-600">
              Follow live match scores and updates as they happen during ongoing tournaments and events.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-3">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rankings</h3>
            <p className="text-gray-600">
              View current world rankings, prize money standings, and track ranking changes over time.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-3">⚔️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Head-to-Head</h3>
            <p className="text-gray-600">
              Compare players with detailed head-to-head statistics and historical match records.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl mb-3">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Matches</h3>
            <p className="text-gray-600">
              Plan your viewing schedule with comprehensive upcoming match information and schedules.
            </p>
          </div>
        </div>

        {/* Layout Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Layout Components Demo</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              This page demonstrates the complete layout system with all responsive components:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Header:</strong> Contains logo, search bar, and navigation (hamburger menu on mobile)</li>
              <li><strong>Sidebar:</strong> Collapsible navigation panel (desktop only, hidden on mobile/tablet)</li>
              <li><strong>Main Content:</strong> This area with proper spacing and responsive grid layouts</li>
              <li><strong>Footer:</strong> Links, information, and branding with multi-column responsive layout</li>
            </ul>
            <div className="mt-4 p-4 bg-white rounded border">
              <h3 className="font-semibold mb-2">Try the responsive features:</h3>
              <ul className="text-sm space-y-1">
                <li>• Resize your browser window to see responsive behavior</li>
                <li>• Use the search bar in the header</li>
                <li>• On desktop: Toggle the sidebar collapse button</li>
                <li>• On mobile: Try the hamburger menu</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Technologies Used</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React 19.2.5 with TypeScript</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Responsive design with mobile-first approach</li>
                <li>• Proper TypeScript interfaces</li>
                <li>• Accessibility features (ARIA labels, semantic HTML)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mobile hamburger menu</li>
                <li>• Collapsible desktop sidebar</li>
                <li>• Integrated search functionality</li>
                <li>• Smooth animations and transitions</li>
                <li>• Touch-friendly mobile interface</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};