import React, { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import EvolutionDisplay from './EvolutionDisplay';
import MultiSelect from './MultiSelect';
import { usePokemon, useEvolutionChain, useEvolutionChainById, useEvolutionChainByIdReverse, usePokemonTypes, usePokemonTypesForGeneration, usePokemonByMultipleTypes } from '../hooks/usePokemonQueries';
import { useFuzzySearch } from '../hooks/useFuzzySearch';
import { GENERATIONS, getPokemonIdsForGeneration, getPokemonCountForGeneration } from '../utils/generationUtils';

const PokemonDetails: React.FC = () => {
  const [pokemonNumber, setPokemonNumber] = useState<string>('25');
  const [searchTerm, setSearchTerm] = useState<string | null>('25');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const [currentEvolutionChainId, setCurrentEvolutionChainId] = useState<number | null>(null);
  const [navigatingByChain, setNavigatingByChain] = useState<'forward' | 'backward' | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeFilteredPokemon, setTypeFilteredPokemon] = useState<any[]>([]);
  const [currentTypeIndex, setCurrentTypeIndex] = useState<number>(0);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [generationFilteredPokemon, setGenerationFilteredPokemon] = useState<number[]>([]);
  const [currentGenerationIndex, setCurrentGenerationIndex] = useState<number>(0);
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
  };

  const handleInputChange = (value: string) => {
    setPokemonNumber(value);
    setShowSuggestions(value.length > 0 && searchResults.length > 0);
  };

  const handleSuggestionClick = (pokemonName: string) => {
    setPokemonNumber(pokemonName);
    setSearchTerm(pokemonName);
    setShowSuggestions(false);
    clearTypeFilter(); // Clear type filter when searching by name
    clearGenerationFilter(); // Clear generation filter when searching by name
  };

  const handleTypeChange = (typeNames: (string | number)[]) => {
    const newSelectedTypes = typeNames.map(name => String(name));
    setSelectedTypes(newSelectedTypes);
    setCurrentTypeIndex(0);
    
    if (newSelectedTypes.length > 0) {
      // Clear name search when filtering by type
      setPokemonNumber('');
      setSearchTerm(null);
    }
  };

  const clearTypeFilter = () => {
    setSelectedTypes([]);
    setTypeFilteredPokemon([]);
    setCurrentTypeIndex(0);
  };

  const handleGenerationChange = (generationIds: (string | number)[]) => {
    const newSelectedGenerations = generationIds.map(id => Number(id));
    setSelectedGenerations(newSelectedGenerations);
    setCurrentGenerationIndex(0);
    
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
    setCurrentGenerationIndex(0);
  };

  const handlePreviousInGeneration = () => {
    if (generationFilteredPokemon.length > 0 && currentGenerationIndex > 0) {
      setIsNavigating(true);
      setPreviousPokemon(pokemon);
      setCurrentGenerationIndex(currentGenerationIndex - 1);
      const prevPokemonId = generationFilteredPokemon[currentGenerationIndex - 1];
      setSearchTerm(prevPokemonId.toString());
    }
  };

  const handleNextInGeneration = () => {
    if (generationFilteredPokemon.length > 0 && currentGenerationIndex < generationFilteredPokemon.length - 1) {
      setIsNavigating(true);
      setPreviousPokemon(pokemon);
      setCurrentGenerationIndex(currentGenerationIndex + 1);
      const nextPokemonId = generationFilteredPokemon[currentGenerationIndex + 1];
      setSearchTerm(nextPokemonId.toString());
    }
  };

  const handlePreviousInType = () => {
    if (typeFilteredPokemon.length > 0 && currentTypeIndex > 0) {
      setIsNavigating(true);
      setPreviousPokemon(pokemon);
      setCurrentTypeIndex(currentTypeIndex - 1);
      const prevPokemon = typeFilteredPokemon[currentTypeIndex - 1];
      setSearchTerm(prevPokemon.name);
    }
  };

  const handleNextInType = () => {
    if (typeFilteredPokemon.length > 0 && currentTypeIndex < typeFilteredPokemon.length - 1) {
      setIsNavigating(true);
      setPreviousPokemon(pokemon);
      setCurrentTypeIndex(currentTypeIndex + 1);
      const nextPokemon = typeFilteredPokemon[currentTypeIndex + 1];
      setSearchTerm(nextPokemon.name);
    }
  };

  const handleEvolutionClick = (pokemonId: number) => {
    searchPokemon(pokemonId.toString());
  };

  const handlePreviousPokemon = () => {
    if (pokemon && pokemon.id > 1) {
      setIsNavigating(true);
      setPreviousPokemon(pokemon);
      searchPokemon((pokemon.id - 1).toString());
    }
  };

  const handleNextPokemon = () => {
    if (pokemon && pokemon.id < 1025) {
      setIsNavigating(true);
      setPreviousPokemon(pokemon);
      searchPokemon((pokemon.id + 1).toString());
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
    if (e.key === 'Enter') {
      searchPokemon();
    }
  };

  // Update pokemonNumber when a successful search occurs
  useEffect(() => {
    if (pokemon) {
      setPokemonNumber(pokemon.id.toString());
      // Reset navigation state when new Pokemon loads
      if (isNavigating) {
        setIsNavigating(false);
        setPreviousPokemon(null);
      }
    }
  }, [pokemon, isNavigating]);

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
        setCurrentTypeIndex(0);
        setSearchTerm(pokemonByMultipleTypes[0].name);
      } else {
        // No Pokemon found for the selected types/generations combination
        setTypeFilteredPokemon([]);
        setCurrentTypeIndex(0);
      }
    } else if (selectedTypes.length === 0) {
      // Clear type filtered Pokemon when no types are selected
      setTypeFilteredPokemon([]);
      setCurrentTypeIndex(0);
    }
  }, [pokemonByMultipleTypes, selectedTypes]);

  // Update currentGenerationIndex when Pokemon changes during generation filtering
  useEffect(() => {
    if (pokemon && selectedGenerations.length > 0 && generationFilteredPokemon.length > 0) {
      const pokemonIndex = generationFilteredPokemon.findIndex(id => id === pokemon.id);
      if (pokemonIndex !== -1) {
        setCurrentGenerationIndex(pokemonIndex);
      }
    }
  }, [pokemon, selectedGenerations, generationFilteredPokemon]);

  // Clear type filter if selected types are not available in the new generation
  useEffect(() => {
    if (selectedGenerations.length > 0 && selectedTypes.length > 0 && pokemonTypesForGeneration) {
      const availableTypes = pokemonTypesForGeneration.map(type => type.name);
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
      margin: '0 auto'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
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
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(pokemonNumber.length > 0 && searchResults.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
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
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSuggestionClick(result.name)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span style={{ textTransform: 'capitalize' }}>{result.name}</span>
                  <span style={{ color: '#666', fontSize: '12px' }}>#{result.id}</span>
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
        marginBottom: '20px'
      }}>
        {/* Generation Filter */}
        <div className="mb-6">
          <MultiSelect
            label="Filter by Generation"
            options={GENERATIONS.map(gen => ({
              id: gen.id,
              name: gen.region,
              description: `${gen.name} (${getPokemonCountForGeneration(gen.id)} Pokemon)`
            }))}
            selectedValues={selectedGenerations}
            onChange={handleGenerationChange}
            placeholder="Select generations..."
            color="orange"
            className="max-w-sm mx-auto"
          />
        </div>

        {/* Generation Navigation */}
        {selectedGenerations.length > 0 && generationFilteredPokemon.length > 0 && (
          <div style={{
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px'
          }}>
            <button
              onClick={handlePreviousInGeneration}
              disabled={isNavigating || currentGenerationIndex <= 0}
              style={{
                backgroundColor: (isNavigating || currentGenerationIndex <= 0) ? '#ccc' : '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: (isNavigating || currentGenerationIndex <= 0) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                opacity: isNavigating ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isNavigating && currentGenerationIndex > 0) {
                  e.currentTarget.style.backgroundColor = '#E55A2B';
                }
              }}
              onMouseOut={(e) => {
                if (!isNavigating && currentGenerationIndex > 0) {
                  e.currentTarget.style.backgroundColor = '#FF6B35';
                }
              }}
            >
              ← Previous Generation Pokemon
            </button>
            
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#666'
            }}>
              {currentGenerationIndex + 1} of {generationFilteredPokemon.length} Generation Pokemon
            </span>
            
            <button
              onClick={handleNextInGeneration}
              disabled={isNavigating || currentGenerationIndex >= generationFilteredPokemon.length - 1}
              style={{
                backgroundColor: (isNavigating || currentGenerationIndex >= generationFilteredPokemon.length - 1) ? '#ccc' : '#FF6B35',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: (isNavigating || currentGenerationIndex >= generationFilteredPokemon.length - 1) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                opacity: isNavigating ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isNavigating && currentGenerationIndex < generationFilteredPokemon.length - 1) {
                  e.currentTarget.style.backgroundColor = '#E55A2B';
                }
              }}
              onMouseOut={(e) => {
                if (!isNavigating && currentGenerationIndex < generationFilteredPokemon.length - 1) {
                  e.currentTarget.style.backgroundColor = '#FF6B35';
                }
              }}
            >
              Next Generation Pokemon →
            </button>
          </div>
        )}

        {/* Type Filter */}
        <div className="mb-6">
          <MultiSelect
            label="Filter by Type"
            options={(selectedGenerations.length > 0 ? pokemonTypesForGeneration : pokemonTypes)
              ?.map((type: { name: string; url: string }) => ({
                id: type.name,
                name: type.name.charAt(0).toUpperCase() + type.name.slice(1)
              })) || []}
            selectedValues={selectedTypes}
            onChange={handleTypeChange}
            placeholder="Select types..."
            color="blue"
            className="max-w-sm mx-auto"
          />
        </div>
        
        {/* Type Filter Navigation */}
        {selectedTypes.length > 0 && typeFilteredPokemon.length > 0 && (
          <div style={{
            marginTop: '15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px'
          }}>
            <button
              onClick={handlePreviousInType}
              disabled={isNavigating || currentTypeIndex <= 0}
              style={{
                backgroundColor: (isNavigating || currentTypeIndex <= 0) ? '#ccc' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: (isNavigating || currentTypeIndex <= 0) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                opacity: isNavigating ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isNavigating && currentTypeIndex > 0) {
                  e.currentTarget.style.backgroundColor = '#1976D2';
                }
              }}
              onMouseOut={(e) => {
                if (!isNavigating && currentTypeIndex > 0) {
                  e.currentTarget.style.backgroundColor = '#2196F3';
                }
              }}
            >
              ← Previous Type
            </button>
            
            <span style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#666'
            }}>
              {currentTypeIndex + 1} of {typeFilteredPokemon.length} Type Pokemon
            </span>
            
            <button
              onClick={handleNextInType}
              disabled={isNavigating || currentTypeIndex >= typeFilteredPokemon.length - 1}
              style={{
                backgroundColor: (isNavigating || currentTypeIndex >= typeFilteredPokemon.length - 1) ? '#ccc' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: (isNavigating || currentTypeIndex >= typeFilteredPokemon.length - 1) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                opacity: isNavigating ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isNavigating && currentTypeIndex < typeFilteredPokemon.length - 1) {
                  e.currentTarget.style.backgroundColor = '#1976D2';
                }
              }}
              onMouseOut={(e) => {
                if (!isNavigating && currentTypeIndex < typeFilteredPokemon.length - 1) {
                  e.currentTarget.style.backgroundColor = '#2196F3';
                }
              }}
            >
              Next Type →
            </button>
          </div>
        )}
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
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#333'
          }}>
            <span style={{ fontWeight: 'bold' }}>✨ Shiny</span>
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

      {isLoading && !isNavigating && !pokemon && (
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

      {(pokemon || (isNavigating && previousPokemon)) && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            margin: '20px 0'
          }}>
            <button
              onClick={handlePreviousPokemon}
              disabled={isNavigating || (pokemon || previousPokemon)?.id <= 1}
              style={{
                backgroundColor: (isNavigating || (pokemon || previousPokemon)?.id <= 1) ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: (isNavigating || (pokemon || previousPokemon)?.id <= 1) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                opacity: isNavigating ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isNavigating && (pokemon || previousPokemon)?.id > 1) {
                  e.currentTarget.style.backgroundColor = '#45a049';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isNavigating && (pokemon || previousPokemon)?.id > 1) {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              ←
            </button>
            
            <div style={{ position: 'relative' }}>
              <PokemonCard pokemon={pokemon || previousPokemon} isShiny={isShiny} />
              {isNavigating && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  Loading...
                </div>
              )}
            </div>
            
            <button
              onClick={handleNextPokemon}
              disabled={isNavigating || (pokemon || previousPokemon)?.id >= 1025}
              style={{
                backgroundColor: (isNavigating || (pokemon || previousPokemon)?.id >= 1025) ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: (isNavigating || (pokemon || previousPokemon)?.id >= 1025) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                opacity: isNavigating ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isNavigating && (pokemon || previousPokemon)?.id < 1025) {
                  e.currentTarget.style.backgroundColor = '#45a049';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isNavigating && (pokemon || previousPokemon)?.id < 1025) {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              →
            </button>
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
                
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#666'
                }}>
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