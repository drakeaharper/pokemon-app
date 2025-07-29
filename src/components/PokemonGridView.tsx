import React, { useState, useEffect } from 'react';
import PokemonGridCard from './PokemonGridCard';
import DaisyMultiSelect from './DaisyMultiSelect';
import { usePokemonGridData } from '../hooks/usePokemonGridData';
import { usePokemonTypes, usePokemonTypesForGeneration, usePokemonByMultipleTypes } from '../hooks/usePokemonQueries';
import { GENERATIONS, getPokemonIdsForGeneration } from '../utils/generationUtils';
import { Pokemon } from '../types/Pokemon';

const PokemonGridView: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [isShiny, setIsShiny] = useState<boolean>(false);

  const { pokemon: allPokemon, isLoading, progress, loadedCount, totalCount, errorCount } = usePokemonGridData();
  const { data: pokemonTypes } = usePokemonTypes();
  const { data: pokemonTypesForGeneration } = usePokemonTypesForGeneration(selectedGenerations[0] || null);
  const { data: pokemonByMultipleTypes } = usePokemonByMultipleTypes(selectedTypes, selectedGenerations);

  // Filter Pokemon based on selected filters
  const getFilteredPokemon = (): Pokemon[] => {
    // If both generation and type filters are active
    if (selectedGenerations.length > 0 && selectedTypes.length > 0) {
      if (!pokemonByMultipleTypes) return [];
      // Convert the API result to actual Pokemon IDs and filter from loaded Pokemon
      const filteredIds = pokemonByMultipleTypes.map(p => {
        const match = p.url.match(/\/(\d+)\/$/);
        return match ? parseInt(match[1]) : 0;
      }).filter(id => id > 0);
      return allPokemon.filter(pokemon => filteredIds.includes(pokemon.id));
    }
    // If only type filter is active
    else if (selectedTypes.length > 0) {
      // Filter by type from all loaded Pokemon
      return allPokemon.filter(pokemon =>
        pokemon.types.some(type => selectedTypes.includes(type.type.name))
      );
    }
    // If only generation filter is active
    else if (selectedGenerations.length > 0) {
      const generationPokemonIds = selectedGenerations.flatMap(genId => 
        getPokemonIdsForGeneration(genId)
      );
      return allPokemon.filter(pokemon => generationPokemonIds.includes(pokemon.id));
    }
    // No filters - return all loaded Pokemon
    else {
      return allPokemon;
    }
  };

  const handleTypeChange = (typeNames: (string | number)[]) => {
    const newSelectedTypes = typeNames.map(name => String(name));
    setSelectedTypes(newSelectedTypes);
  };

  const handleGenerationChange = (generationIds: (string | number)[]) => {
    const newSelectedGenerations = generationIds.map(id => Number(id));
    setSelectedGenerations(newSelectedGenerations);
  };

  // Clear type filter if selected types are not available in the new generation
  useEffect(() => {
    if (selectedGenerations.length > 0 && selectedTypes.length > 0 && pokemonTypesForGeneration) {
      const availableTypes = pokemonTypesForGeneration.map((type: { name: string; url: string }) => type.name);
      const unavailableTypes = selectedTypes.filter(type => !availableTypes.includes(type));
      if (unavailableTypes.length > 0) {
        const newSelectedTypes = selectedTypes.filter(type => availableTypes.includes(type));
        setSelectedTypes(newSelectedTypes);
      }
    }
  }, [selectedGenerations, pokemonTypesForGeneration, selectedTypes]);

  const filteredPokemon = getFilteredPokemon();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <h1 className="text-center mb-8 text-3xl font-bold text-gray-800 dark:text-white">
          Pokemon Grid
        </h1>

        {/* Filter Controls */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-center">
            {/* Generation Filter */}
            <div className="w-full lg:w-auto">
              <DaisyMultiSelect
                label="Filter by Generation"
                options={GENERATIONS.map(gen => ({
                  id: gen.id,
                  name: gen.region,
                  description: `${gen.name} (${getPokemonIdsForGeneration(gen.id).length} Pokemon)`
                }))}
                selectedValues={selectedGenerations}
                onChange={handleGenerationChange}
                placeholder="Select generations..."
                color="warning"
              />
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-auto">
              <DaisyMultiSelect
                label="Filter by Type"
                options={(selectedGenerations.length > 0 ? pokemonTypesForGeneration : pokemonTypes)
                  ?.map((type: { name: string; url: string }) => ({
                    id: type.name,
                    name: type.name.charAt(0).toUpperCase() + type.name.slice(1)
                  })) || []}
                selectedValues={selectedTypes}
                onChange={handleTypeChange}
                placeholder="Select types..."
                color="info"
              />
            </div>

            {/* Shiny Toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200 text-lg">
                <span className="font-bold">✨ Shiny</span>
                <div
                  onClick={() => setIsShiny(!isShiny)}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                    isShiny ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    isShiny ? 'translate-x-6' : 'translate-x-0.5'
                  } translate-y-0.5`} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Loading Progress */}
        {isLoading && (
          <div className="mb-8 text-center">
            <div className="text-gray-600 dark:text-gray-400 mb-2">
              Loading Pokemon... {loadedCount}/{totalCount} ({progress}%)
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mx-auto max-w-md">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            {errorCount > 0 && (
              <div className="text-red-500 text-sm mt-2">
                {errorCount} Pokemon failed to load
              </div>
            )}
          </div>
        )}

        {/* Pokemon Count */}
        {!isLoading && (
          <div className="text-center mb-6">
            <div className="text-gray-600 dark:text-gray-400">
              Showing {filteredPokemon.length} of {totalCount} Pokemon
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && filteredPokemon.length === 0 && allPokemon.length > 0 && (
          <div className="text-center mt-20">
            <div className="text-gray-600 dark:text-gray-400 text-lg">
              No Pokemon match the selected filters.
            </div>
            <div className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Try adjusting your generation or type filters.
            </div>
          </div>
        )}

        {/* Pokemon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
          {filteredPokemon.map((pokemon) => (
            <PokemonGridCard
              key={pokemon.id}
              pokemon={pokemon}
              isShiny={isShiny}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonGridView;