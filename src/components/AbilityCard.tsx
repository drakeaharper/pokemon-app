import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ability } from '../types/Ability';

interface AbilityCardProps {
  ability: Ability;
}

const AbilityCard: React.FC<AbilityCardProps> = ({ ability }) => {
  // Helper function to extract Pokemon ID from URL
  const extractPokemonId = (url: string): string => {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? match[1] : '1';
  };

  // Get English name
  const englishName = ability.names.find(
    name => name.language.name === 'en'
  )?.name || ability.name;

  // Get English effect
  const englishEffect = ability.effect_entries.find(
    entry => entry.language.name === 'en'
  );

  // Get English flavor text
  const englishFlavorText = ability.flavor_text_entries.find(
    entry => entry.language.name === 'en'
  )?.flavor_text;

  // Get generation number
  const generationNumber = ability.generation.name.replace('generation-', '').toUpperCase();

  // State for expandable Pokemon list
  const [showAllPokemon, setShowAllPokemon] = useState(false);
  
  // Get Pokemon with this ability
  const totalPokemon = ability.pokemon.length;
  const pokemonWithAbility = showAllPokemon 
    ? ability.pokemon 
    : ability.pokemon.slice(0, 8); // Show first 8 Pokemon by default

  return (
    <div className="border-2 border-gray-800 dark:border-gray-300 rounded-2xl p-5 max-w-lg my-2.5 bg-gray-50 dark:bg-gray-800 shadow-md text-gray-800 dark:text-gray-200 font-sans transition-colors duration-200">
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h3 className="capitalize m-0 text-2xl text-gray-800 dark:text-gray-100">
          {englishName.replace('-', ' ')}
        </h3>
        <p className="my-1.5 text-sm text-gray-500 dark:text-gray-400 font-bold">
          #{ability.id} • Generation {generationNumber}
        </p>
      </div>

      {englishEffect && (
        <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-blue-200 dark:border-gray-600">
          <h4 className="m-0 mb-2 text-base text-blue-600 dark:text-blue-400">
            Effect
          </h4>
          <p className="m-0 text-sm leading-6 text-gray-700 dark:text-gray-300">
            {englishEffect.effect}
          </p>
          {englishEffect.short_effect && englishEffect.short_effect !== englishEffect.effect && (
            <div style={{ marginTop: '10px' }}>
              <strong className="text-xs text-blue-600 dark:text-blue-400">
                Short Effect:
              </strong>
              <p className="mt-1 mb-0 text-xs italic text-gray-600 dark:text-gray-400">
                {englishEffect.short_effect}
              </p>
            </div>
          )}
        </div>
      )}

      {englishFlavorText && (
        <div className="bg-yellow-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-yellow-200 dark:border-gray-600">
          <h4 className="m-0 mb-2 text-base text-yellow-600 dark:text-yellow-400">
            Description
          </h4>
          <p className="m-0 text-sm leading-5 italic text-yellow-800 dark:text-yellow-300">
            {englishFlavorText.replace(/\n/g, ' ')}
          </p>
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="m-0 mb-2.5 text-base text-gray-800 dark:text-gray-200">
          Pokemon with this Ability ({totalPokemon})
        </h4>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px',
          marginBottom: totalPokemon > 8 ? '8px' : '0'
        }}>
          {pokemonWithAbility.map((pokemon, index) => {
            const pokemonId = extractPokemonId(pokemon.pokemon.url);
            return (
              <Link
                key={index}
                to={`/${pokemonId}/details`}
                style={{
                  backgroundColor: pokemon.is_hidden ? '#e74c3c' : '#27ae60',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={`${pokemon.is_hidden ? 'Hidden Ability' : 'Normal Ability'} - Click to view ${pokemon.pokemon.name.replace('-', ' ')}`}
              >
                {pokemon.pokemon.name.replace('-', ' ')}
              </Link>
            );
          })}
        </div>
        {totalPokemon > 8 && (
          <div className="text-center mt-3">
            <button
              onClick={() => setShowAllPokemon(!showAllPokemon)}
              className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              {showAllPokemon 
                ? `Show Less` 
                : `Show All ${totalPokemon} Pokemon`
              }
            </button>
          </div>
        )}
        <div className="mt-2 text-xs text-center text-gray-400 dark:text-gray-500">
          <span className="text-green-500">●</span> Normal Ability • 
          <span className="text-red-500"> ●</span> Hidden Ability
        </div>
      </div>
    </div>
  );
};

export default AbilityCard;