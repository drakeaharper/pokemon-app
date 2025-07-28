import React from 'react';
import { usePokemonSpecies, usePokemon } from '../hooks/usePokemonQueries';
import LoadingCard from './LoadingCard';
import TypePill from './TypePill';

interface PokemonFormsProps {
  pokemonId: number;
  currentPokemonName: string;
  selectedForm: string | null;
  onFormSelect: (formName: string) => void;
  isShiny: boolean;
  onShinyToggle: () => void;
  onResetForm: () => void;
}

const PokemonForms: React.FC<PokemonFormsProps> = ({ pokemonId, currentPokemonName, selectedForm, onFormSelect, isShiny, onShinyToggle, onResetForm }) => {
  const { data: species, isLoading } = usePokemonSpecies(pokemonId);

  if (isLoading) return <LoadingCard />;
  if (!species || !species.varieties || species.varieties.length <= 1) return null;

  // Filter out the default form as it's already shown
  const alternateForms = species.varieties.filter(variety => !variety.is_default);

  if (alternateForms.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl mb-8 rounded-xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Alternate Forms</h2>
        <div className="flex gap-2">
          <button
            onClick={onShinyToggle}
            className={`
              px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg
              ${isShiny 
                ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-2 border-yellow-500' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600'
              }
            `}
            title={isShiny ? "Showing Shiny Forms" : "Show Shiny Forms"}
          >
            <div className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isShiny ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                <path d="M5 3v4"></path>
                <path d="M19 17v4"></path>
                <path d="M3 5h4"></path>
                <path d="M17 19h4"></path>
              </svg>
              <span className="text-xs font-bold">{isShiny ? 'SHINY' : 'SHINY'}</span>
            </div>
          </button>
          {selectedForm && (
            <button 
              onClick={onResetForm}
              className="px-3 py-2 rounded-lg font-medium text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
            >
              Reset to Default
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {alternateForms.map((variety) => (
          <FormCard
            key={variety.pokemon.name}
            formName={variety.pokemon.name}
            isSelected={selectedForm === variety.pokemon.name}
            onSelect={onFormSelect}
            isShiny={isShiny}
          />
        ))}
      </div>
    </div>
  );
};

interface FormCardProps {
  formName: string;
  isSelected: boolean;
  onSelect: (formName: string) => void;
  isShiny: boolean;
}

const FormCard: React.FC<FormCardProps> = ({ formName, isSelected, onSelect, isShiny }) => {
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
  const sprite = isShiny
    ? (formPokemon.sprites.other?.['official-artwork']?.front_shiny || formPokemon.sprites.front_shiny || formPokemon.sprites.other?.['official-artwork']?.front_default || formPokemon.sprites.front_default)
    : (formPokemon.sprites.other?.['official-artwork']?.front_default || formPokemon.sprites.front_default);

  return (
    <div 
      className={`cursor-pointer transition-colors rounded-lg p-4 items-center border-2 ${
        isSelected 
          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 shadow-lg' 
          : 'bg-gray-100 dark:bg-gray-700 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
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