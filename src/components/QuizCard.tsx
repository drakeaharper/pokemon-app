import React from 'react';
import { Pokemon } from '../types/Pokemon';

interface QuizCardProps {
  pokemon: Pokemon;
  showShiny?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ pokemon, showShiny = false }) => {
  // Use the official artwork for better quality, fallback to regular sprite
  const spriteUrl = showShiny 
    ? pokemon.sprites.front_shiny || pokemon.sprites.front_default
    : pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-sm border-2 border-gray-200">
      {/* Pokemon Image */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          {spriteUrl ? (
            <img
              src={spriteUrl}
              alt="Mystery Pokemon"
              className="w-48 h-48 object-contain drop-shadow-lg"
              onError={(e) => {
                // Fallback to regular sprite if official artwork fails
                if (e.currentTarget.src !== pokemon.sprites.front_default) {
                  e.currentTarget.src = pokemon.sprites.front_default || '';
                }
              }}
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-lg">No Image</span>
            </div>
          )}
          
          {/* Question mark overlay for mystery effect */}
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow-md">
            ?
          </div>
        </div>
      </div>

      {/* Pokemon ID (without giving away the name) */}
      <div className="text-center mb-4">
        <span className="text-gray-600 text-sm font-medium">
          Pokemon #{pokemon.id.toString().padStart(3, '0')}
        </span>
      </div>

      {/* Silhouette option toggle (future enhancement) */}
      <div className="text-center text-xs text-gray-500 mt-4">
        Who's that Pokemon?
      </div>
    </div>
  );
};

export default QuizCard;