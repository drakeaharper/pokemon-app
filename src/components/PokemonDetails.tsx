import React, { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';
import EvolutionDisplay from './EvolutionDisplay';
import { usePokemon, useEvolutionChain } from '../hooks/usePokemonQueries';

const PokemonDetails: React.FC = () => {
  const [pokemonNumber, setPokemonNumber] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const { data: pokemon, isLoading, error: pokemonError } = usePokemon(searchTerm);
  const { data: evolutionData } = useEvolutionChain(pokemon?.id || null);

  const searchPokemon = (term?: string) => {
    const searchValue = term || pokemonNumber;
    if (!searchValue) {
      return;
    }
    setSearchTerm(searchValue);
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
        <input
          type="text"
          placeholder="Enter Pokemon number or name (e.g., 25 or pikachu)"
          value={pokemonNumber}
          onChange={(e) => setPokemonNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '350px',
            marginRight: '10px',
            borderRadius: '5px',
            border: '2px solid #ddd'
          }}
        />
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
            
            <PokemonCard pokemon={pokemon} />
            
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
            <EvolutionDisplay 
              evolutionData={evolutionData} 
              onEvolutionClick={handleEvolutionClick}
            />
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