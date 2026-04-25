/**
 * PlayerProfilePage component - Individual player details view
 * Displays player name, nationality, ranking, season statistics, match history, and form chart
 */

import { useState, useMemo } from 'react';
import { usePlayer, usePlayerMatches } from '../hooks/useSnookerApi';
import { PlayerStats } from '../components/pages/PlayerStats';
import { MatchHistory } from '../components/pages/MatchHistory';
import { FormChart } from '../components/pages/FormChart';
import { PressureStats } from '../components/pages/PressureStats';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { WatchlistButton } from '../components/common/WatchlistButton';
import { calculatePlayerForm, calculateFrameWinPercentage } from '../utils/playerUtils';

interface PlayerProfilePageProps {
  playerId: number;
}

export const PlayerProfilePage = ({ playerId }: PlayerProfilePageProps) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(-1); // -1 for current season
  
  // Fetch player data
  const { data: player, loading: playerLoading, error: playerError } = usePlayer(playerId);
  
  // Fetch player matches for the selected season
  const { data: matches, loading: matchesLoading, error: matchesError } = usePlayerMatches(
    playerId,
    selectedSeason
  );

  // Calculate derived data
  const playerForm = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    return calculatePlayerForm(matches, playerId, 10);
  }, [matches, playerId]);

  const frameWinPercentage = useMemo(() => {
    if (!matches || matches.length === 0) return 0;
    return calculateFrameWinPercentage(matches, playerId);
  }, [matches, playerId]);

  // Handle retry on error
  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (playerLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state
  if (playerError || !player) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorMessage
          message="Unable to load player profile. Please try again."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Player Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {/* Player Image */}
            {player.Image_Url && (
              <img
                src={player.Image_Url}
                alt={player.Name}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            
            {/* Player Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {player.Name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center">
                  <span className="font-medium">Nationality:</span>
                  <span className="ml-1">{player.Nationality}</span>
                </span>
                {player.Ranking && (
                  <span className="flex items-center">
                    <span className="font-medium">Ranking:</span>
                    <span className="ml-1">#{player.Ranking}</span>
                  </span>
                )}
                {player.Born && (
                  <span className="flex items-center">
                    <span className="font-medium">Born:</span>
                    <span className="ml-1">{player.Born}</span>
                  </span>
                )}
                {player.Turned_Pro && (
                  <span className="flex items-center">
                    <span className="font-medium">Turned Pro:</span>
                    <span className="ml-1">{player.Turned_Pro}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Watchlist Button */}
          <div className="flex items-center space-x-4">
            <WatchlistButton playerId={player.ID} playerName={player.Name} />
          </div>
        </div>
      </div>

      {/* Season Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="season-select" className="font-medium text-gray-700">
            Season:
          </label>
          <select
            id="season-select"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={-1}>Current Season</option>
            <option value={2024}>2024/2025</option>
            <option value={2023}>2023/2024</option>
            <option value={2022}>2022/2023</option>
            <option value={2021}>2021/2022</option>
          </select>
        </div>
      </div>

      {/* Player Statistics */}
      <div className="mb-6">
        <PlayerStats
          player={player}
          frameWinPercentage={frameWinPercentage}
          playerForm={playerForm}
          loading={matchesLoading}
          error={matchesError}
        />
      </div>

      {/* Form Chart */}
      {playerForm && playerForm.lastMatches.length > 0 && (
        <div className="mb-6">
          <FormChart
            matches={playerForm.lastMatches}
            playerId={playerId}
            playerName={player.Name}
          />
        </div>
      )}

      {/* Pressure Situation Performance */}
      <div className="mb-6">
        <PressureStats
          matches={matches || []}
          playerId={playerId}
          playerName={player.Name}
          loading={matchesLoading}
          error={matchesError}
        />
      </div>

      {/* Match History */}
      <div>
        <MatchHistory
          matches={matches || []}
          playerId={playerId}
          loading={matchesLoading}
          error={matchesError}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};