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
    <div 
      className="bg-white border border-gray-300 rounded-lg p-4 cursor-pointer transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-lg md:p-3"
      onClick={onClick}
    >
      {player.Image_Url && (
        <img 
          src={player.Image_Url} 
          alt={player.Name}
          className="w-full h-48 md:h-36 object-cover rounded mb-4"
        />
      )}
      <h3 className="text-lg font-medium text-gray-800 mb-2">{player.Name}</h3>
      <p className="text-gray-600 text-sm mb-1">{player.Nationality}</p>
      <p className="text-gray-600 text-sm">
        Status: {player.Status === 'P' ? 'Professional' : 'Amateur'}
      </p>
    </div>
  );
};
