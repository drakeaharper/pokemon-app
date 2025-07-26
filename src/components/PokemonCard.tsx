import React from 'react';
import { Pokemon } from '../types/Pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
  isShiny?: boolean;
}

const typeColors: { [key: string]: string } = {
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
};

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, isShiny = false }) => {
  const mainType = pokemon.types[0].type.name;
  const backgroundColor = typeColors[mainType] || '#68A090';

  return (
    <div 
      className="border-2 border-gray-300 dark:border-gray-600"
      style={{
        borderRadius: '15px',
        padding: '20px',
        maxWidth: '400px',
        margin: '20px auto',
        backgroundColor,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        color: '#fff',
        fontFamily: 'Arial, sans-serif'
      }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h2 style={{ 
          textTransform: 'capitalize', 
          margin: '0',
          fontSize: '28px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {pokemon.name}
        </h2>
        <p style={{ 
          margin: '5px 0', 
          fontSize: '18px',
          fontWeight: 'bold' 
        }}>
          #{pokemon.id.toString().padStart(3, '0')}
        </p>
      </div>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        borderRadius: '10px', 
        padding: '15px',
        marginBottom: '15px'
      }}>
        <img
          src={isShiny 
            ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny)
            : (pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default)
          }
          alt={`${isShiny ? 'Shiny ' : ''}${pokemon.name}`}
          style={{ 
            width: '200px', 
            height: '200px',
            display: 'block',
            margin: '0 auto'
          }}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px',
        marginBottom: '15px'
      }}>
        {pokemon.types.map((type, index) => (
          <span
            key={index}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              padding: '5px 15px',
              borderRadius: '20px',
              textTransform: 'capitalize',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {type.type.name}
          </span>
        ))}
      </div>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        borderRadius: '10px', 
        padding: '15px',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Stats</h3>
        {pokemon.stats.map((stat, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '3px'
            }}>
              <span style={{ textTransform: 'capitalize', fontSize: '14px' }}>
                {stat.stat.name.replace('-', ' ')}
              </span>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {stat.base_stat}
              </span>
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.3)', 
              borderRadius: '10px',
              height: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                height: '100%',
                width: `${(stat.base_stat / 255) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        fontSize: '14px'
      }}>
        <div>
          <strong>Height:</strong> {pokemon.height / 10}m
        </div>
        <div>
          <strong>Weight:</strong> {pokemon.weight / 10}kg
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;