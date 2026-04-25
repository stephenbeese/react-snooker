/**
 * PlayerStats component - Displays player statistics including frame win percentage and rankings
 */

import type { PlayerProfile } from '../../types/snooker';
import type { PlayerForm } from '../../utils/playerUtils';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface PlayerStatsProps {
  player: PlayerProfile;
  frameWinPercentage: number;
  playerForm: PlayerForm | null;
  loading: boolean;
  error: Error | null;
}

export const PlayerStats = ({
  player,
  frameWinPercentage,
  playerForm,
  loading,
  error
}: PlayerStatsProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Season Statistics</h2>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Season Statistics</h2>
        <ErrorMessage message="Unable to load statistics." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Season Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* World Ranking */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {player.Ranking ? `#${player.Ranking}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">World Ranking</div>
          </div>
        </div>

        {/* Ranking Points */}
        <div className="text-center">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {player.Ranking_Points ? player.Ranking_Points.toLocaleString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Ranking Points</div>
          </div>
        </div>

        {/* Frame Win Percentage */}
        <div className="text-center">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {frameWinPercentage}%
            </div>
            <div className="text-sm text-gray-600">Frame Win %</div>
          </div>
        </div>

        {/* Recent Form */}
        <div className="text-center">
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {playerForm ? `${playerForm.winPercentage}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              Recent Form ({playerForm?.lastMatches.length || 0} matches)
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Money Ranking */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Money Ranking</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Position:</span>
              <span className="font-medium">
                {player.Money_Ranking ? `#${player.Money_Ranking}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prize Money:</span>
              <span className="font-medium">
                {player.Money_Ranking_Points 
                  ? `£${player.Money_Ranking_Points.toLocaleString()}` 
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Form Trend */}
        {playerForm && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Wins:</span>
                <span className="font-medium text-green-600">{playerForm.wins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Losses:</span>
                <span className="font-medium text-red-600">{playerForm.losses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Form Trend:</span>
                <span className={`font-medium capitalize ${
                  playerForm.formTrend === 'improving' 
                    ? 'text-green-600' 
                    : playerForm.formTrend === 'declining' 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {playerForm.formTrend}
                  {playerForm.formTrend === 'improving' && ' ↗'}
                  {playerForm.formTrend === 'declining' && ' ↘'}
                  {playerForm.formTrend === 'stable' && ' →'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};