import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PokemonCard from './PokemonCard';
import EvolutionDisplay from './EvolutionDisplay';
import DaisyMultiSelect from './DaisyMultiSelect';
import { usePokemon, useEvolutionChain, useEvolutionChainById, useEvolutionChainByIdReverse, usePokemonTypes, usePokemonTypesForGeneration, usePokemonByMultipleTypes } from '../hooks/usePokemonQueries';
import { useFuzzySearch } from '../hooks/useFuzzySearch';
import { GENERATIONS, getPokemonIdsForGeneration, getPokemonCountForGeneration } from '../utils/generationUtils';

const PokemonDetails: React.FC = () => {
  const { pokemonId } = useParams<{ pokemonId: string }>();
  const navigate = useNavigate();
  
  const initialPokemonId = pokemonId || '25';
  const [pokemonNumber, setPokemonNumber] = useState<string>(initialPokemonId);
  const [searchTerm, setSearchTerm] = useState<string | null>(initialPokemonId);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const [currentEvolutionChainId, setCurrentEvolutionChainId] = useState<number | null>(null);
  const [navigatingByChain, setNavigatingByChain] = useState<'forward' | 'backward' | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeFilteredPokemon, setTypeFilteredPokemon] = useState<any[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [generationFilteredPokemon, setGenerationFilteredPokemon] = useState<number[]>([]);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [previousPokemon, setPreviousPokemon] = useState<any>(null);

  const { data: pokemon, isLoading, error: pokemonError } = usePokemon(searchTerm);
  const { data: evolutionData } = useEvolutionChain(pokemon?.id || null);
  const { searchResults } = useFuzzySearch(pokemonNumber);
  const { data: chainDataForward } = useEvolutionChainById(navigatingByChain === 'forward' ? currentEvolutionChainId : null);
  const { data: chainDataBackward } = useEvolutionChainByIdReverse(navigatingByChain === 'backward' ? currentEvolutionChainId : null);
  const { data: pokemonTypes } = usePokemonTypes();
  const { data: pokemonTypesForGeneration } = usePokemonTypesForGeneration(selectedGenerations[0] || null);
  const { data: pokemonByMultipleTypes } = usePokemonByMultipleTypes(selectedTypes, selectedGenerations);


  const searchPokemon = (term?: string) => {
    const searchValue = term || pokemonNumber;
    if (!searchValue) {
      return;
    }
    // Reset navigation state when doing a manual search
    if (!isNavigating) {
      setPreviousPokemon(null);
    }
    setSearchTerm(searchValue);
    setShowSuggestions(false);
    
    // Update URL if it's a valid Pokemon number and different from current URL
    if (/^\d+$/.test(searchValue) && searchValue !== pokemonId) {
      navigate(`/${searchValue}`);
    } else if (/^[a-zA-Z]/.test(searchValue)) {
      // If searching by name, don't update URL until Pokemon is found
      // The useEffect will handle URL update when pokemon data loads
    }
  };

  const handleInputChange = (value: string) => {
    setPokemonNumber(value);
    setShowSuggestions(value.length > 0 && searchResults.length > 0);
    setSelectedSuggestionIndex(-1); // Reset selection when typing
  };

  const handleSuggestionClick = (pokemonName: string) => {
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1); // Reset selection index
    clearTypeFilter(); // Clear type filter when searching by name
    clearGenerationFilter(); // Clear generation filter when searching by name
    
    // Simple approach: directly set search term and let the Pokemon hook handle it
    setSearchTerm(pokemonName);
    setPokemonNumber(pokemonName);
  };

  const handleTypeChange = (typeNames: (string | number)[]) => {
    const newSelectedTypes = typeNames.map(name => String(name));
    setSelectedTypes(newSelectedTypes);
    
    if (newSelectedTypes.length > 0) {
      // Clear name search when filtering by type
      setPokemonNumber('');
      setSearchTerm(null);
    }
  };

  const clearTypeFilter = () => {
    setSelectedTypes([]);
    setTypeFilteredPokemon([]);
  };

  const handleGenerationChange = (generationIds: (string | number)[]) => {
    const newSelectedGenerations = generationIds.map(id => Number(id));
    setSelectedGenerations(newSelectedGenerations);
    
    if (newSelectedGenerations.length > 0) {
      // Calculate combined Pokemon IDs from all selected generations
      const allPokemonIds: number[] = [];
      newSelectedGenerations.forEach(genId => {
        allPokemonIds.push(...getPokemonIdsForGeneration(genId));
      });
      setGenerationFilteredPokemon(allPokemonIds.sort((a, b) => a - b));
      
      // Clear name search and type filter when filtering by generation
      setPokemonNumber('');
      setSearchTerm(null);
      clearTypeFilter();
      
      // Navigate to first Pokemon of the combined generations
      if (allPokemonIds.length > 0) {
        setSearchTerm(Math.min(...allPokemonIds).toString());
      }
    } else {
      setGenerationFilteredPokemon([]);
    }
  };

  const clearGenerationFilter = () => {
    setSelectedGenerations([]);
    setGenerationFilteredPokemon([]);
  };


  // Get current filtered Pokemon list based on active filters
  const getFilteredPokemonList = () => {
    // If both generation and type filters are active
    if (selectedGenerations.length > 0 && selectedTypes.length > 0) {
      return pokemonByMultipleTypes || [];
    }
    // If only type filter is active
    else if (selectedTypes.length > 0) {
      return typeFilteredPokemon;
    }
    // If only generation filter is active
    else if (selectedGenerations.length > 0) {
      return generationFilteredPokemon.map(id => ({ name: `pokemon-${id}`, url: `https://pokeapi.co/api/v2/pokemon/${id}/`, id }));
    }
    // No filters - return all Pokemon (1-1025)
    else {
      const allPokemon = [];
      for (let i = 1; i <= 1025; i++) {
        allPokemon.push({ name: `pokemon-${i}`, url: `https://pokeapi.co/api/v2/pokemon/${i}/`, id: i });
      }
      return allPokemon;
    }
  };

  // Prefetch adjacent Pokemon for smooth navigation
  const prefetchAdjacentPokemon = () => {
    if (!pokemon) return [];
    
    const filteredList = getFilteredPokemonList();
    const currentIndex = filteredList.findIndex(p => {
      const pokemonId = p.id || parseInt(p.url.match(/\/(\d+)\/$/)?.[1] || '0');
      return pokemonId === pokemon.id;
    });
    
    const prefetchIds = [];
    if (currentIndex >= 0) {
      // Prefetch 2 Pokemon in each direction
      for (let i = 1; i <= 2; i++) {
        // Previous Pokemon
        if (currentIndex - i >= 0) {
          const prevPokemon = filteredList[currentIndex - i];
          const prevId = prevPokemon.id || parseInt(prevPokemon.url.match(/\/(\d+)\/$/)?.[1] || '0');
          prefetchIds.push(prevId.toString());
        }
        // Next Pokemon
        if (currentIndex + i < filteredList.length) {
          const nextPokemon = filteredList[currentIndex + i];
          const nextId = nextPokemon.id || parseInt(nextPokemon.url.match(/\/(\d+)\/$/)?.[1] || '0');
          prefetchIds.push(nextId.toString());
        }
      }
    }
    return prefetchIds;
  };

  // Get prefetch IDs and use them to cache Pokemon data
  const prefetchIds = prefetchAdjacentPokemon();
  usePokemon(prefetchIds[0] || null);
  usePokemon(prefetchIds[1] || null); 
  usePokemon(prefetchIds[2] || null);
  usePokemon(prefetchIds[3] || null);

  const handleEvolutionClick = (pokemonId: number) => {
    searchPokemon(pokemonId.toString());
  };

  const handlePreviousPokemon = () => {
    if (!pokemon) return;
    
    const filteredList = getFilteredPokemonList();
    if (filteredList.length === 0) return;
    
    // Find current Pokemon in the filtered list
    const currentIndex = filteredList.findIndex(p => {
      const pokemonId = p.id || parseInt(p.url.match(/\/(\d+)\/$/)?.[1] || '0');
      return pokemonId === pokemon.id;
    });
    
    if (currentIndex > 0) {
      setIsNavigating(true);
      setPreviousPokemon(pokemon);
      const previousPokemon = filteredList[currentIndex - 1];
      const previousId = previousPokemon.id || parseInt(previousPokemon.url.match(/\/(\d+)\/$/)?.[1] || '0');
      searchPokemon(previousId.toString());
    }
  };

  const handleNextPokemon = () => {
    if (!pokemon) return;
    
    const filteredList = getFilteredPokemonList();
    if (filteredList.length === 0) return;
    
    // Find current Pokemon in the filtered list
    const currentIndex = filteredList.findIndex(p => {
      const pokemonId = p.id || parseInt(p.url.match(/\/(\d+)\/$/)?.[1] || '0');
      return pokemonId === pokemon.id;
    });
    
    if (currentIndex >= 0 && currentIndex < filteredList.length - 1) {
      setIsNavigating(true);
      setPreviousPokemon(pokemon);
      const nextPokemon = filteredList[currentIndex + 1];
      const nextId = nextPokemon.id || parseInt(nextPokemon.url.match(/\/(\d+)\/$/)?.[1] || '0');
      searchPokemon(nextId.toString());
    }
  };

  const handlePreviousChain = () => {
    if (currentEvolutionChainId && currentEvolutionChainId > 1) {
      setCurrentEvolutionChainId(currentEvolutionChainId - 1);
      setNavigatingByChain('backward');
    }
  };

  const handleNextChain = () => {
    if (currentEvolutionChainId && currentEvolutionChainId < 549) { // Max evolution chain ID
      setCurrentEvolutionChainId(currentEvolutionChainId + 1);
      setNavigatingByChain('forward');
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPokemon();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchResults.length === 0) {
      if (e.key === 'Enter') {
        searchPokemon();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          // Select the highlighted suggestion
          handleSuggestionClick(searchResults[selectedSuggestionIndex].name);
        } else if (searchResults.length > 0) {
          // Select the first suggestion if none is highlighted
          handleSuggestionClick(searchResults[0].name);
        } else {
          // Fall back to regular search
          searchPokemon();
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Sync URL parameter to search term on initial load or browser navigation
  useEffect(() => {
    if (pokemonId && !searchTerm) {
      setSearchTerm(pokemonId);
      setPokemonNumber(pokemonId);
    }
  }, [pokemonId, searchTerm]);

  // Update URL when Pokemon loads successfully
  useEffect(() => {
    if (pokemon) {
      // Reset navigation state when new Pokemon loads
      if (isNavigating) {
        setIsNavigating(false);
        setPreviousPokemon(null);
      }
      
      // Update URL only if it's different from current Pokemon ID
      if (pokemon.id.toString() !== pokemonId) {
        navigate(`/${pokemon.id}`, { replace: true });
      }
    }
  }, [pokemon, isNavigating, pokemonId, navigate]);

  // Extract evolution chain ID from current evolution data
  useEffect(() => {
    if (evolutionData && !navigatingByChain) {
      // Get the chain ID from the evolution data
      // We'll need to track this from the API response
      const chainId = (evolutionData as any).chainId || currentEvolutionChainId;
      if (chainId) {
        setCurrentEvolutionChainId(chainId);
      }
    }
  }, [evolutionData, navigatingByChain, currentEvolutionChainId]);

  // Navigate to first Pokemon in chain when chain ID changes
  useEffect(() => {
    const chainData = navigatingByChain === 'forward' ? chainDataForward : chainDataBackward;
    if (chainData && navigatingByChain) {
      searchPokemon(chainData.pokemonId.toString());
      setCurrentEvolutionChainId(chainData.actualChainId);
      setNavigatingByChain(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainDataForward, chainDataBackward, navigatingByChain]);

  // Update typeFilteredPokemon when pokemonByMultipleTypes data changes
  useEffect(() => {
    if (selectedTypes.length > 0 && pokemonByMultipleTypes) {
      if (pokemonByMultipleTypes.length > 0) {
        setTypeFilteredPokemon(pokemonByMultipleTypes);
        // Automatically navigate to first Pokemon of selected types
        setSearchTerm(pokemonByMultipleTypes[0].name);
      } else {
        // No Pokemon found for the selected types/generations combination
        setTypeFilteredPokemon([]);
      }
    } else if (selectedTypes.length === 0) {
      // Clear type filtered Pokemon when no types are selected
      setTypeFilteredPokemon([]);
    }
  }, [pokemonByMultipleTypes, selectedTypes]);


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

  const error = pokemonError ? 'Pokemon not found. Please try a different number or name.' : '';

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'visible'
    }}>
      <h1 className="text-center mb-8 text-3xl font-bold text-gray-800 dark:text-white">
        Pokemon Finder
      </h1>
      
      <form onSubmit={handleSubmit} style={{ 
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type="text"
            placeholder="Enter Pokemon number or name (e.g., 25 or pikachu)"
            value={pokemonNumber}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setShowSuggestions(pokemonNumber.length > 0 && searchResults.length > 0)}
            onBlur={() => setTimeout(() => {
              setShowSuggestions(false);
              setSelectedSuggestionIndex(-1);
            }, 150)}
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '350px',
              marginRight: '10px',
              borderRadius: '5px',
              border: '2px solid #ddd'
            }}
          />
          {showSuggestions && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: '10px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleSuggestionClick(result.name)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: index === selectedSuggestionIndex ? '#4CAF50' : 'white',
                    color: index === selectedSuggestionIndex ? 'white' : 'black'
                  }}
                  onMouseEnter={(e) => {
                    if (index !== selectedSuggestionIndex) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                      e.currentTarget.style.color = 'black';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== selectedSuggestionIndex) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = 'black';
                    } else {
                      e.currentTarget.style.backgroundColor = '#4CAF50';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseOver={() => setSelectedSuggestionIndex(index)}
                >
                  <span style={{ textTransform: 'capitalize' }}>{result.name}</span>
                  <span style={{ 
                    color: index === selectedSuggestionIndex ? '#e8f5e8' : '#666', 
                    fontSize: '12px' 
                  }}>
                    #{result.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          Search
        </button>
      </form>

      {/* Filter Dropdowns */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* Generation Filter */}
        <div className="mb-6">
          <DaisyMultiSelect
            label="Filter by Generation"
            options={GENERATIONS.map(gen => ({
              id: gen.id,
              name: gen.region,
              description: `${gen.name} (${getPokemonCountForGeneration(gen.id)} Pokemon)`
            }))}
            selectedValues={selectedGenerations}
            onChange={handleGenerationChange}
            placeholder="Select generations..."
            color="warning"
          />
        </div>


        {/* Type Filter */}
        <div className="mb-6">
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
      </div>

      {pokemon && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          <label className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200 text-lg">
            <span className="font-bold">✨ Shiny</span>
            <div
              onClick={() => setIsShiny(!isShiny)}
              style={{
                width: '50px',
                height: '26px',
                backgroundColor: isShiny ? '#4CAF50' : '#ccc',
                borderRadius: '13px',
                position: 'relative',
                transition: 'background-color 0.3s ease',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isShiny ? '26px' : '2px',
                transition: 'left 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </label>
        </div>
      )}

      {isLoading && !isNavigating && !pokemon && !previousPokemon && (
        <div style={{ textAlign: 'center', fontSize: '20px' }}>
          Loading...
        </div>
      )}

      {error && (
        <div style={{ 
          textAlign: 'center', 
          color: 'red',
          fontSize: '18px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {(pokemon || previousPokemon) && (
        <>
          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <button
              onClick={handlePreviousPokemon}
              disabled={isNavigating || (pokemon || previousPokemon)?.id <= 1}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                (isNavigating || (pokemon || previousPokemon)?.id <= 1)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
              } ${isNavigating ? 'opacity-60' : 'opacity-100'}`}
            >
              ← Previous Pokemon
            </button>
            
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Pokemon {(pokemon || previousPokemon)?.id} of 1025
            </span>
            
            <button
              onClick={handleNextPokemon}
              disabled={isNavigating || (pokemon || previousPokemon)?.id >= 1025}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                (isNavigating || (pokemon || previousPokemon)?.id >= 1025)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
              } ${isNavigating ? 'opacity-60' : 'opacity-100'}`}
            >
              Next Pokemon →
            </button>
          </div>

          {/* Pokemon Card */}
          <div className="flex justify-center mb-8">
            <div style={{ position: 'relative' }}>
              <PokemonCard 
                pokemon={pokemon || previousPokemon} 
                isShiny={isShiny} 
                key={(pokemon || previousPokemon)?.id} 
              />
            </div>
          </div>
          
          {evolutionData && !isNavigating && (
            <>
              <EvolutionDisplay 
                evolutionData={evolutionData} 
                onEvolutionClick={handleEvolutionClick}
                isShiny={isShiny}
              />
              
              {/* Evolution Chain Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                marginTop: '20px'
              }}>
                <button
                  onClick={handlePreviousChain}
                  disabled={!currentEvolutionChainId || currentEvolutionChainId <= 1}
                  style={{
                    backgroundColor: currentEvolutionChainId && currentEvolutionChainId > 1 ? '#9C27B0' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    cursor: currentEvolutionChainId && currentEvolutionChainId > 1 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.3s ease',
                    opacity: currentEvolutionChainId && currentEvolutionChainId > 1 ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (currentEvolutionChainId && currentEvolutionChainId > 1) {
                      e.currentTarget.style.backgroundColor = '#7B1FA2';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentEvolutionChainId && currentEvolutionChainId > 1) {
                      e.currentTarget.style.backgroundColor = '#9C27B0';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  ← Previous Chain
                </button>
                
                <span className="text-base font-bold text-gray-600 dark:text-gray-400">
                  Evolution Chain #{currentEvolutionChainId || '?'}
                </span>
                
                <button
                  onClick={handleNextChain}
                  disabled={!currentEvolutionChainId || currentEvolutionChainId >= 549}
                  style={{
                    backgroundColor: currentEvolutionChainId && currentEvolutionChainId < 549 ? '#9C27B0' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    cursor: currentEvolutionChainId && currentEvolutionChainId < 549 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.3s ease',
                    opacity: currentEvolutionChainId && currentEvolutionChainId < 549 ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (currentEvolutionChainId && currentEvolutionChainId < 549) {
                      e.currentTarget.style.backgroundColor = '#7B1FA2';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentEvolutionChainId && currentEvolutionChainId < 549) {
                      e.currentTarget.style.backgroundColor = '#9C27B0';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  Next Chain →
                </button>
              </div>
            </>
          )}
        </>
      )}

      <div style={{ 
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p>Try Pokemon numbers 1-1025 or names</p>
        <p>Popular Pokemon: 25/pikachu, 1/bulbasaur, 6/charizard, 150/mewtwo</p>
      </div>
    </div>
  );
};

export default PokemonDetails;