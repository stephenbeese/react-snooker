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

  return (
    <tr className="ranking-row" onClick={onClick}>
      <td className="position">{ranking.Position}</td>
      <td className="name">{ranking.Player_Name}</td>
      <td className="nationality">{ranking.Nationality}</td>
      <td className="points">{ranking.Points}</td>
      {ranking.Money && <td className="money">£{ranking.Money.toLocaleString()}</td>}
      {changeIndicator && (
        <td className="change">
          {changeIndicator} {Math.abs(ranking.Change || 0)}
        </td>
      )}
    </tr>
  );
};
