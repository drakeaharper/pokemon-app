import React from 'react';
import { Ability } from '../types/Ability';

interface AbilityCardProps {
  ability: Ability;
}

const AbilityCard: React.FC<AbilityCardProps> = ({ ability }) => {
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

  // Get Pokemon with this ability
  const pokemonWithAbility = ability.pokemon.slice(0, 8); // Show first 8 Pokemon
  const totalPokemon = ability.pokemon.length;

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
          {pokemonWithAbility.map((pokemon, index) => (
            <span
              key={index}
              style={{
                backgroundColor: pokemon.is_hidden ? '#e74c3c' : '#27ae60',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}
              title={pokemon.is_hidden ? 'Hidden Ability' : 'Normal Ability'}
            >
              {pokemon.pokemon.name.replace('-', ' ')}
            </span>
          ))}
        </div>
        {totalPokemon > 8 && (
          <p className="m-0 text-xs text-gray-500 dark:text-gray-400 text-center">
            ...and {totalPokemon - 8} more Pokemon
          </p>
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