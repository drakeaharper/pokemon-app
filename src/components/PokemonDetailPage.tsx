import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePokemon, usePokemonSpecies, useEvolutionChain } from '../hooks/usePokemonQueries';
import EvolutionDisplay from './EvolutionDisplay';
import PokemonForms from './PokemonForms';
import LoadingCard from './LoadingCard';
import ErrorMessage from './ErrorMessage';
import TypePill from './TypePill';
import PokemonMoves from './PokemonMoves';
import PokemonSearch from './PokemonSearch';

const PokemonDetailPage: React.FC = () => {
  const { pokemonId: pokemonIdParam } = useParams<{ pokemonId: string }>();
  const navigate = useNavigate();
  const [isShiny, setIsShiny] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [statDisplayMode, setStatDisplayMode] = useState<'base' | 'min' | 'max'>('base');
  const [statLevel, setStatLevel] = useState<50 | 100>(50);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const pokemonId = parseInt(pokemonIdParam || '1');
  
  // Use selectedForm for fetching Pokemon data if a form is selected
  const pokemonIdentifier = selectedForm || pokemonId;
  const { data: pokemon, isLoading: pokemonLoading, error: pokemonError } = usePokemon(pokemonIdentifier);
  const { data: species, isLoading: speciesLoading } = usePokemonSpecies(pokemonId);
  // Pass Pokemon ID instead of evolution chain URL for proper evolution lookup
  const { data: evolutionData } = useEvolutionChain(pokemonId);
  
  // Search resolution - use separate hook to resolve search terms to Pokemon
  const { data: searchedPokemon, isLoading: searchLoading, error: searchError } = usePokemon(searchTerm);

  const isLoading = pokemonLoading || speciesLoading;

  // Reset form selection when Pokemon ID changes
  useEffect(() => {
    setSelectedForm(null);
  }, [pokemonId]);

  // Handle search resolution - when searchedPokemon loads, navigate to its detail page
  useEffect(() => {
    if (searchedPokemon && searchTerm) {
      navigate(`/${searchedPokemon.id}/details`);
      setSearchTerm(null); // Reset search term
    }
  }, [searchedPokemon, searchTerm, navigate]);

  const handlePrevious = () => {
    if (pokemonId > 1) {
      navigate(`/${pokemonId - 1}/details`);
    }
  };

  const handleNext = () => {
    if (pokemonId < 1025) {
      navigate(`/${pokemonId + 1}/details`);
    }
  };

  const handleSearch = (searchValue: string) => {
    if (/^\d+$/.test(searchValue)) {
      // If it's a number, navigate directly to that Pokemon's detail page
      navigate(`/${searchValue}/details`);
    } else {
      // If it's a name, use search term to resolve to ID first
      setSearchTerm(searchValue);
    }
  };

  if (isLoading && !searchLoading) return <LoadingCard />;
  
  // Show search error but keep the search bar
  if (searchError && searchTerm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation Header with Search */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(`/${pokemonId}`)}
              className="btn btn-ghost btn-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back to Browser
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="flex justify-center">
            <PokemonSearch 
              onSearch={handleSearch}
              placeholder="Search Pokemon..."
              className="w-full max-w-md"
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            Pokemon "{searchTerm}" not found
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Please try a different Pokemon name or number.
          </div>
        </div>
      </div>
    );
  }
  
  if (pokemonError) return <ErrorMessage message="Failed to load Pokemon" />;
  if (!pokemon) return <ErrorMessage message="Pokemon not found" />;

  const spriteUrl = isShiny 
    ? pokemon.sprites.front_shiny || pokemon.sprites.front_default
    : pokemon.sprites.front_default;

  const officialArtwork = isShiny
    ? pokemon.sprites.other?.['official-artwork']?.front_shiny || pokemon.sprites.other?.['official-artwork']?.front_default
    : pokemon.sprites.other?.['official-artwork']?.front_default;

  const displaySprite = officialArtwork || spriteUrl;

  // Calculate stat values based on display mode
  const calculateStat = (baseStat: number, statName: string, mode: 'base' | 'min' | 'max'): number => {
    if (mode === 'base') return baseStat;
    
    const level = statLevel;
    const isHP = statName === 'hp';
    
    if (mode === 'min') {
      // Minimum stat: 0 IVs, 0 EVs, hindering nature
      const natureMultiplier = isHP ? 1 : 0.9;
      if (isHP) {
        return Math.floor(((2 * baseStat + 0 + 0) * level) / 100) + level + 10;
      } else {
        return Math.floor((Math.floor(((2 * baseStat + 0 + 0) * level) / 100) + 5) * natureMultiplier);
      }
    } else {
      // Maximum stat: 31 IVs, 252 EVs, beneficial nature
      const natureMultiplier = isHP ? 1 : 1.1;
      if (isHP) {
        return Math.floor(((2 * baseStat + 31 + 63) * level) / 100) + level + 10;
      } else {
        return Math.floor((Math.floor(((2 * baseStat + 31 + 63) * level) / 100) + 5) * natureMultiplier);
      }
    }
  };

  // Calculate stat percentages for display
  const maxPossibleStat = statDisplayMode === 'base' ? 255 : 
                         statDisplayMode === 'min' ? (statLevel === 100 ? 350 : 200) : 
                         (statLevel === 100 ? 700 : 400); // Dynamic scaling based on level
  
  const statBars = pokemon.stats.map(stat => {
    const displayValue = calculateStat(stat.base_stat, stat.stat.name, statDisplayMode);
    return {
      name: stat.stat.name,
      baseValue: stat.base_stat,
      value: displayValue,
      percentage: (displayValue / maxPossibleStat) * 100,
      color: getStatColor(stat.stat.name)
    };
  });

  // Get species-specific information
  const genus = species?.genera?.find(g => g.language.name === 'en')?.genus || 'Pokemon';
  const flavorText = species?.flavor_text_entries
    ?.find(entry => entry.language.name === 'en')
    ?.flavor_text.replace(/\f/g, ' ') || '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navigation Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(`/${pokemonId}`)}
            className="btn btn-ghost btn-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← Back to Browser
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={pokemonId <= 1}
              className="btn btn-circle btn-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={pokemonId >= 1025}
              className="btn btn-circle btn-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex justify-center">
          <PokemonSearch 
            onSearch={handleSearch}
            placeholder="Search Pokemon..."
            className="w-full max-w-md"
          />
        </div>
      </div>

      {/* Main Pokemon Display */}
      <div className="bg-white dark:bg-gray-800 shadow-xl mb-8 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Image and Basic Info */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {formatPokemonName(pokemon.name)}
                </h1>
                <button
                  onClick={() => setIsShiny(!isShiny)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg
                    ${isShiny 
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-2 border-yellow-500' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                    }
                  `}
                  title={isShiny ? "Showing Shiny Form" : "Show Shiny Form"}
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
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                #{String(pokemon.id).padStart(3, '0')} • {genus}
              </p>
              
              <div className="inline-block mb-4">
                <img
                  src={displaySprite || '/placeholder.png'}
                  alt={pokemon.name}
                  className="w-64 h-64 object-contain mx-auto"
                />
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {pokemon.types.map((type) => (
                  <TypePill
                    key={type.type.name}
                    typeName={type.type.name}
                    size="lg"
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-800 dark:text-gray-100">
                <div>
                  <p className="font-semibold">Height</p>
                  <p>{(pokemon.height / 10).toFixed(1)} m</p>
                </div>
                <div>
                  <p className="font-semibold">Weight</p>
                  <p>{(pokemon.weight / 10).toFixed(1)} kg</p>
                </div>
              </div>
            </div>

            {/* Right Column - Description and Abilities */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{flavorText}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Abilities</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((ability) => (
                    <div
                      key={ability.ability.name}
                      className={`
                        px-3 py-2 rounded-lg font-medium text-sm capitalize
                        ${ability.is_hidden 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-600' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                        }
                      `}
                    >
                      {ability.ability.name.replace(/-/g, ' ')}
                      {ability.is_hidden && ' (Hidden)'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Alternate Forms */}
      <PokemonForms 
        pokemonId={pokemonId}
        currentPokemonName={pokemon.name}
        selectedForm={selectedForm}
        onFormSelect={setSelectedForm}
        isShiny={isShiny}
        onShinyToggle={() => setIsShiny(!isShiny)}
        onResetForm={() => setSelectedForm(null)}
      />

      {/* Evolution Chain */}
      {evolutionData && (
        <div className="bg-white dark:bg-gray-800 shadow-xl mb-8 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Evolution Chain</h2>
          <EvolutionDisplay
            evolutionData={evolutionData}
            onEvolutionClick={(id) => navigate(`/${id}/details`)}
            isShiny={isShiny}
            hideHeader={true}
          />
        </div>
      )}

      {/* Base Stats */}
      <div className="bg-white dark:bg-gray-800 shadow-xl mb-8 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Stats</h2>
            {/* Stat Mode Toggles */}
            <div className="flex gap-2">
              {(['base', 'min', 'max'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStatDisplayMode(mode)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm capitalize transition-all duration-200
                    ${statDisplayMode === mode
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600'
                    }
                  `}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          {/* Level Toggles (only show when not in base mode) */}
          {statDisplayMode !== 'base' && (
            <div className="flex gap-2">
              {([50, 100] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setStatLevel(level)}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${statLevel === level
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600'
                    }
                  `}
                >
                  Lv {level}
                </button>
              ))}
            </div>
          )}
        </div>
        {statDisplayMode !== 'base' && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {statDisplayMode === 'min' 
              ? `Minimum stats at level ${statLevel} (0 IVs, 0 EVs, hindering nature)`
              : `Maximum stats at level ${statLevel} (31 IVs, 252 EVs, beneficial nature)`
            }
          </p>
        )}
        <div className="space-y-3">
          {statBars.map((stat) => (
            <div key={stat.name} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 text-sm font-medium text-right text-gray-800 dark:text-gray-100">
                {formatStatName(stat.name)}
              </div>
              <div className="col-span-2 text-center font-bold text-gray-800 dark:text-gray-100">
                {stat.value}
              </div>
              <div className="col-span-7">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="divider"></div>
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3 text-sm font-bold text-right text-gray-800 dark:text-gray-100">
              Total
            </div>
            <div className="col-span-2 text-center font-bold text-lg text-gray-800 dark:text-gray-100">
              {statBars.reduce((sum, stat) => sum + stat.value, 0)}
            </div>
            <div className="col-span-7"></div>
          </div>
        </div>
      </div>

      {/* Pokemon Moves */}
      <PokemonMoves pokemon={pokemon} />

      {/* Additional Info */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Additional Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Base Experience</h3>
            <p className="text-gray-600 dark:text-gray-400">{pokemon.base_experience || 'Unknown'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Capture Rate</h3>
            <p className="text-gray-600 dark:text-gray-400">{species?.capture_rate || 'Unknown'}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Growth Rate</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {species?.growth_rate?.name?.replace(/-/g, ' ') || 'Unknown'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Egg Groups</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {species?.egg_groups?.map(g => g.name).join(', ') || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatStatName = (name: string): string => {
  const statNames: Record<string, string> = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'speed': 'Speed'
  };
  return statNames[name] || name;
};

const getStatColor = (statName: string): string => {
  const statColors: Record<string, string> = {
    'hp': '#FF5959',
    'attack': '#F5AC78',
    'defense': '#FAE078',
    'special-attack': '#9DB7F5',
    'special-defense': '#A7DB8D',
    'speed': '#FA92B2'
  };
  return statColors[statName] || '#68A090';
};

const formatPokemonName = (name: string): string => {
  // Handle special form names
  const formPatterns: Record<string, (name: string) => string> = {
    '-mega': (n) => n.replace('-mega', ' (Mega)'),
    '-mega-x': (n) => n.replace('-mega-x', ' (Mega X)'),
    '-mega-y': (n) => n.replace('-mega-y', ' (Mega Y)'),
    '-gmax': (n) => n.replace('-gmax', ' (Gigantamax)'),
    '-alola': (n) => n.replace('-alola', ' (Alolan)'),
    '-galar': (n) => n.replace('-galar', ' (Galarian)'),
    '-hisui': (n) => n.replace('-hisui', ' (Hisuian)'),
    '-paldea': (n) => n.replace('-paldea', ' (Paldean)'),
  };

  let formatted = name;
  for (const [pattern, formatter] of Object.entries(formPatterns)) {
    if (name.includes(pattern)) {
      formatted = formatter(name);
      break;
    }
  }

  // Capitalize first letter and handle hyphens
  return formatted
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default PokemonDetailPage;