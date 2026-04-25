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
      className="bg-white border border-gray-300 rounded-lg p-4 cursor-pointer transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-lg md:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      aria-label={`View details for ${player.Name} from ${player.Nationality}`}
    >
      {player.Image_Url && (
        <img 
          src={player.Image_Url} 
          alt={`${player.Name} profile photo`}
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
