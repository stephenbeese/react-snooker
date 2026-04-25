/**
 * PlayerCard component - Player display card
 */

import type { Player } from '../../types';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export const PlayerCard = ({ player, onClick }: PlayerCardProps) => {
  return (
    <div className="player-card" onClick={onClick}>
      {player.Image_Url && (
        <img src={player.Image_Url} alt={player.Name} />
      )}
      <h3>{player.Name}</h3>
      <p>{player.Nationality}</p>
      <p>Status: {player.Status === 'P' ? 'Professional' : 'Amateur'}</p>
    </div>
  );
};
