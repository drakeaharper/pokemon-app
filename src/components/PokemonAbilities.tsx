import React from 'react';
import { Link } from 'react-router-dom';
import { useAbilityByName } from '../hooks/useAbilityQueries';

interface PokemonAbilitiesProps {
  abilities: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }>;
}

interface AbilityItemProps {
  abilityName: string;
  isHidden: boolean;
}

const AbilityItem: React.FC<AbilityItemProps> = ({ abilityName, isHidden }) => {
  const { data: abilityData, isLoading, error } = useAbilityByName(abilityName);

  // Get English effect and flavor text
  const englishEffect = abilityData?.effect_entries.find(
    entry => entry.language.name === 'en'
  );
  
  const englishFlavorText = abilityData?.flavor_text_entries.find(
    entry => entry.language.name === 'en'
  )?.flavor_text;

  // Get display name
  const displayName = abilityData?.names.find(
    name => name.language.name === 'en'
  )?.name || abilityName.replace(/-/g, ' ');

  return (
    <Link 
      to={`/abilities/${abilityName}`}
      className={`
        block rounded-lg p-4 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg no-underline
        ${isHidden 
          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500' 
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <h4 className={`
          text-lg font-semibold capitalize m-0
          ${isHidden 
            ? 'text-purple-800 dark:text-purple-300' 
            : 'text-blue-800 dark:text-blue-300'
          }
        `}>
          {displayName}
        </h4>
        {isHidden && (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200">
            HIDDEN
          </span>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load ability details
        </p>
      )}

      {/* Content */}
      {abilityData && !isLoading && (
        <div className="space-y-3">
          {/* Full effect as default (previously "detailed") */}
          {englishEffect?.effect && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Effect:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {englishEffect.effect}
              </p>
            </div>
          )}

          {/* Flavor text */}
          {englishFlavorText && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                {englishFlavorText.replace(/\n/g, ' ')}
              </p>
            </div>
          )}

          {/* Click to view more indicator */}
          <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Click to view full details →
            </p>
          </div>
        </div>
      )}
    </Link>
  );
};

const PokemonAbilities: React.FC<PokemonAbilitiesProps> = ({ abilities }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Abilities</h3>
      <div className="space-y-4">
        {abilities.map((ability) => (
          <AbilityItem
            key={ability.ability.name}
            abilityName={ability.ability.name}
            isHidden={ability.is_hidden}
          />
        ))}
      </div>
    </div>
  );
};

export default PokemonAbilities;