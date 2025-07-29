import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pokemon } from '../types/Pokemon';

interface PokemonGridCardProps {
  pokemon: Pokemon;
  isShiny?: boolean;
}

const typeColors: { [key: string]: string } = {
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
};

const PokemonGridCard: React.FC<PokemonGridCardProps> = ({ pokemon, isShiny = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/${pokemon.id}`);
  };

  const spriteUrl = isShiny 
    ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny)
    : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Pokemon Image */}
      <div className="relative bg-gray-50 dark:bg-gray-700 p-4 flex items-center justify-center h-32">
        <img
          src={spriteUrl}
          alt={pokemon.name}
          className="w-20 h-20 object-contain"
          loading="lazy"
        />
        {/* Pokemon ID Badge */}
        <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full font-bold">
          #{pokemon.id.toString().padStart(3, '0')}
        </div>
      </div>

      {/* Pokemon Info */}
      <div className="p-3">
        {/* Pokemon Name */}
        <h3 className="font-bold text-lg text-gray-800 dark:text-white capitalize mb-2 truncate">
          {pokemon.name}
        </h3>

        {/* Type Badges */}
        <div className="flex flex-wrap gap-1">
          {pokemon.types.map((type) => (
            <span
              key={type.type.name}
              className="text-xs font-semibold px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: typeColors[type.type.name] || '#68D391' }}
            >
              {type.type.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonGridCard;