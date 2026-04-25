/**
 * RankingRow component - Ranking display row
 */

import type { Ranking } from '../../types';

interface RankingRowProps {
  ranking: Ranking;
  onClick?: () => void;
}

export const RankingRow = ({ ranking, onClick }: RankingRowProps) => {
  const changeIndicator = ranking.Change ? (
    ranking.Change > 0 ? '↑' : ranking.Change < 0 ? '↓' : '→'
  ) : null;

  const changeText = ranking.Change 
    ? ranking.Change > 0 
      ? `up ${Math.abs(ranking.Change)} positions`
      : ranking.Change < 0 
      ? `down ${Math.abs(ranking.Change)} positions`
      : 'no change'
    : 'no change data';

  return (
    <tr 
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150 focus:outline-none focus:bg-blue-50"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      aria-label={`${ranking.Player_Name} from ${ranking.Nationality}, ranked ${ranking.Position} with ${ranking.Points.toLocaleString()} points, ${changeText}`}
    >
      <td className="px-4 py-3 text-center font-medium text-gray-900">{ranking.Position}</td>
      <td className="px-4 py-3 font-medium text-gray-900">{ranking.Player_Name}</td>
      <td className="px-4 py-3 text-gray-600">{ranking.Nationality}</td>
      <td className="px-4 py-3 text-right font-medium text-gray-900">{ranking.Points.toLocaleString()}</td>
      {ranking.Money && (
        <td className="px-4 py-3 text-right text-green-600 font-medium">
          £{ranking.Money.toLocaleString()}
        </td>
      )}
      {changeIndicator && (
        <td className={`px-4 py-3 text-center font-medium ${
          ranking.Change && ranking.Change > 0 
            ? 'text-green-600' 
            : ranking.Change && ranking.Change < 0 
            ? 'text-red-600' 
            : 'text-gray-500'
        }`}>
          <span aria-hidden="true">{changeIndicator}</span>
          <span className="sr-only">{changeText}</span>
          <span aria-hidden="true"> {Math.abs(ranking.Change || 0)}</span>
        </td>
      )}
    </tr>
  );
};
