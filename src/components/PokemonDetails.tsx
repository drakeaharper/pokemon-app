import React, { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import EvolutionDisplay from './EvolutionDisplay';
import { usePokemon, useEvolutionChain, useEvolutionChainById } from '../hooks/usePokemonQueries';
import { useFuzzySearch } from '../hooks/useFuzzySearch';

const PokemonDetails: React.FC = () => {
  const [pokemonNumber, setPokemonNumber] = useState<string>('393');
  const [searchTerm, setSearchTerm] = useState<string | null>('393');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isShiny, setIsShiny] = useState<boolean>(false);
  const [currentEvolutionChainId, setCurrentEvolutionChainId] = useState<number | null>(null);
  const [navigatingByChain, setNavigatingByChain] = useState<boolean>(false);

  const { data: pokemon, isLoading, error: pokemonError } = usePokemon(searchTerm);
  const { data: evolutionData } = useEvolutionChain(pokemon?.id || null);
  const { searchResults } = useFuzzySearch(pokemonNumber);
  const { data: chainFirstPokemonId } = useEvolutionChainById(navigatingByChain ? currentEvolutionChainId : null);

  const searchPokemon = (term?: string) => {
    const searchValue = term || pokemonNumber;
    if (!searchValue) {
      return;
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
  };

  const handleEvolutionClick = (pokemonId: number) => {
    searchPokemon(pokemonId.toString());
  };

  const handlePreviousPokemon = () => {
    if (pokemon && pokemon.id > 1) {
      searchPokemon((pokemon.id - 1).toString());
    }
  };

  const handleNextPokemon = () => {
    if (pokemon && pokemon.id < 1025) {
      searchPokemon((pokemon.id + 1).toString());
    }
  };

  const handlePreviousChain = () => {
    if (currentEvolutionChainId && currentEvolutionChainId > 1) {
      setCurrentEvolutionChainId(currentEvolutionChainId - 1);
      setNavigatingByChain(true);
    }
  };

  const handleNextChain = () => {
    if (currentEvolutionChainId && currentEvolutionChainId < 549) { // Max evolution chain ID
      setCurrentEvolutionChainId(currentEvolutionChainId + 1);
      setNavigatingByChain(true);
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
    }
  }, [pokemon]);

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
    if (chainFirstPokemonId && navigatingByChain) {
      searchPokemon(chainFirstPokemonId.toString());
      setNavigatingByChain(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainFirstPokemonId, navigatingByChain]);

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

      {isLoading && (
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

      {pokemon && !isLoading && (
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
              disabled={pokemon.id <= 1}
              style={{
                backgroundColor: pokemon.id <= 1 ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: pokemon.id <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                if (pokemon.id > 1) {
                  e.currentTarget.style.backgroundColor = '#45a049';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (pokemon.id > 1) {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              ←
            </button>
            
            <PokemonCard pokemon={pokemon} isShiny={isShiny} />
            
            <button
              onClick={handleNextPokemon}
              disabled={pokemon.id >= 1025}
              style={{
                backgroundColor: pokemon.id >= 1025 ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: pokemon.id >= 1025 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                if (pokemon.id < 1025) {
                  e.currentTarget.style.backgroundColor = '#45a049';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (pokemon.id < 1025) {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              →
            </button>
          </div>
          
          {evolutionData && (
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