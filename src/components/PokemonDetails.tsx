import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pokemon } from '../types/Pokemon';
import { EvolutionDisplay as EvolutionDisplayType } from '../types/Evolution';
import PokemonCard from './PokemonCard';
import EvolutionDisplay from './EvolutionDisplay';
import { fetchEvolutionChain } from '../utils/evolutionUtils';

const PokemonDetails: React.FC = () => {
  const [pokemonNumber, setPokemonNumber] = useState<string>('');
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [evolutionData, setEvolutionData] = useState<EvolutionDisplayType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchPokemon = async () => {
    if (!pokemonNumber || isNaN(Number(pokemonNumber))) {
      setError('Please enter a valid Pokemon number');
      return;
    }

    setLoading(true);
    setError('');
    setPokemon(null);
    setEvolutionData(null);

    try {
      const response = await axios.get<Pokemon>(
        `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`
      );
      setPokemon(response.data);
    } catch (err) {
      setError('Pokemon not found. Please try a different number.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch evolution chain when pokemon changes
  useEffect(() => {
    if (pokemon) {
      fetchEvolutionChain(pokemon.id).then(data => {
        if (data) {
          setEvolutionData(data);
        }
      });
    }
  }, [pokemon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPokemon();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchPokemon();
    }
  };

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
          type="number"
          placeholder="Enter Pokemon number (e.g., 25 for Pikachu)"
          value={pokemonNumber}
          onChange={(e) => setPokemonNumber(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '300px',
            marginRight: '10px',
            borderRadius: '5px',
            border: '2px solid #ddd'
          }}
          min="1"
          max="1010"
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

      {loading && (
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

      {pokemon && !loading && (
        <>
          {evolutionData && (
            <EvolutionDisplay evolutionData={evolutionData} />
          )}
          <PokemonCard pokemon={pokemon} />
        </>
      )}

      <div style={{ 
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p>Try Pokemon numbers 1-1010</p>
        <p>Popular Pokemon: 25 (Pikachu), 1 (Bulbasaur), 6 (Charizard), 150 (Mewtwo)</p>
      </div>
    </div>
  );
};

export default PokemonDetails;