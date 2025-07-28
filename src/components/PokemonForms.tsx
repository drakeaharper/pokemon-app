import React from 'react';
import { usePokemonSpecies, usePokemon } from '../hooks/usePokemonQueries';
import LoadingCard from './LoadingCard';
import TypePill from './TypePill';

interface PokemonFormsProps {
  pokemonId: number;
  currentPokemonName: string;
  onFormSelect: (formName: string) => void;
}

const PokemonForms: React.FC<PokemonFormsProps> = ({ pokemonId, currentPokemonName, onFormSelect }) => {
  const { data: species, isLoading } = usePokemonSpecies(pokemonId);

  if (isLoading) return <LoadingCard />;
  if (!species || !species.varieties || species.varieties.length <= 1) return null;

  // Filter out the default form as it's already shown
  const alternateForms = species.varieties.filter(variety => !variety.is_default);

  if (alternateForms.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl mb-8 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Alternate Forms</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {alternateForms.map((variety) => (
          <FormCard
            key={variety.pokemon.name}
            formName={variety.pokemon.name}
            onSelect={onFormSelect}
          />
        ))}
      </div>
    </div>
  );
};

interface FormCardProps {
  formName: string;
  onSelect: (formName: string) => void;
}

const FormCard: React.FC<FormCardProps> = ({ formName, onSelect }) => {
  const { data: formPokemon, isLoading } = usePokemon(formName);

  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded mt-2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!formPokemon) return null;

  const displayName = formatFormName(formName);
  const sprite = formPokemon.sprites.other?.['official-artwork']?.front_default || 
                 formPokemon.sprites.front_default;

  return (
    <div 
      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors rounded-lg p-4 items-center"
      onClick={() => onSelect(formName)}
    >
      <div className="text-center">
        <img 
          src={sprite || '/placeholder.png'} 
          alt={displayName}
          className="w-24 h-24 object-contain"
        />
        <h3 className="text-sm font-semibold text-center mt-2 text-gray-800 dark:text-gray-100">{displayName}</h3>
        <div className="flex gap-1 mt-2 flex-wrap justify-center">
          {formPokemon.types.map((type) => (
            <TypePill
              key={type.type.name}
              typeName={type.type.name}
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to format form names
const formatFormName = (name: string): string => {
  const formPatterns: Record<string, (name: string) => string> = {
    '-mega': (n) => n.replace('-mega', ' (Mega)'),
    '-mega-x': (n) => n.replace('-mega-x', ' (Mega X)'),
    '-mega-y': (n) => n.replace('-mega-y', ' (Mega Y)'),
    '-gmax': (n) => n.replace('-gmax', ' (Gigantamax)'),
    '-alola': (n) => n.replace('-alola', ' (Alolan)'),
    '-galar': (n) => n.replace('-galar', ' (Galarian)'),
    '-hisui': (n) => n.replace('-hisui', ' (Hisuian)'),
    '-paldea': (n) => n.replace('-paldea', ' (Paldean)'),
    '-primal': (n) => n.replace('-primal', ' (Primal)'),
    '-origin': (n) => n.replace('-origin', ' (Origin)'),
    '-sky': (n) => n.replace('-sky', ' (Sky)'),
    '-land': (n) => n.replace('-land', ' (Land)'),
    '-therian': (n) => n.replace('-therian', ' (Therian)'),
    '-unbound': (n) => n.replace('-unbound', ' (Unbound)'),
    '-crowned': (n) => n.replace('-crowned', ' (Crowned)'),
    '-eternamax': (n) => n.replace('-eternamax', ' (Eternamax)'),
    '-ice': (n) => n.replace('-ice', ' (Ice Rider)'),
    '-shadow': (n) => n.replace('-shadow', ' (Shadow Rider)'),
  };

  let formatted = name;
  for (const [pattern, formatter] of Object.entries(formPatterns)) {
    if (name.includes(pattern)) {
      formatted = formatter(name);
      break;
    }
  }

  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export default PokemonForms;