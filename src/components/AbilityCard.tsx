import React from 'react';
import { Ability } from '../types/Ability';

interface AbilityCardProps {
  ability: Ability;
}

const AbilityCard: React.FC<AbilityCardProps> = ({ ability }) => {
  // Get English name
  const englishName = ability.names.find(
    name => name.language.name === 'en'
  )?.name || ability.name;

  // Get English effect
  const englishEffect = ability.effect_entries.find(
    entry => entry.language.name === 'en'
  );

  // Get English flavor text
  const englishFlavorText = ability.flavor_text_entries.find(
    entry => entry.language.name === 'en'
  )?.flavor_text;

  // Get generation number
  const generationNumber = ability.generation.name.replace('generation-', '').toUpperCase();

  // Get Pokemon with this ability
  const pokemonWithAbility = ability.pokemon.slice(0, 8); // Show first 8 Pokemon
  const totalPokemon = ability.pokemon.length;

  return (
    <div style={{
      border: '2px solid #333',
      borderRadius: '15px',
      padding: '20px',
      maxWidth: '500px',
      margin: '10px',
      backgroundColor: '#f8f9fa',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      color: '#333',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h3 style={{ 
          textTransform: 'capitalize', 
          margin: '0',
          fontSize: '24px',
          color: '#2c3e50'
        }}>
          {englishName.replace('-', ' ')}
        </h3>
        <p style={{ 
          margin: '5px 0', 
          fontSize: '14px',
          color: '#7f8c8d',
          fontWeight: 'bold' 
        }}>
          #{ability.id} • Generation {generationNumber}
        </p>
      </div>

      {englishEffect && (
        <div style={{ 
          backgroundColor: '#e8f4f8', 
          borderRadius: '10px', 
          padding: '15px',
          marginBottom: '15px',
          border: '1px solid #d6eaf8'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#2980b9' }}>
            Effect
          </h4>
          <p style={{ 
            margin: '0', 
            fontSize: '14px', 
            lineHeight: '1.5',
            color: '#34495e'
          }}>
            {englishEffect.effect}
          </p>
          {englishEffect.short_effect && englishEffect.short_effect !== englishEffect.effect && (
            <div style={{ marginTop: '10px' }}>
              <strong style={{ fontSize: '13px', color: '#2980b9' }}>
                Short Effect:
              </strong>
              <p style={{ 
                margin: '3px 0 0 0', 
                fontSize: '13px',
                fontStyle: 'italic',
                color: '#5d6d7e'
              }}>
                {englishEffect.short_effect}
              </p>
            </div>
          )}
        </div>
      )}

      {englishFlavorText && (
        <div style={{ 
          backgroundColor: '#fef9e7', 
          borderRadius: '10px', 
          padding: '15px',
          marginBottom: '15px',
          border: '1px solid #f7dc6f'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#d68910' }}>
            Description
          </h4>
          <p style={{ 
            margin: '0', 
            fontSize: '14px', 
            lineHeight: '1.4',
            fontStyle: 'italic',
            color: '#7d6608'
          }}>
            {englishFlavorText.replace(/\n/g, ' ')}
          </p>
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f4f6f7', 
        borderRadius: '10px', 
        padding: '15px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2c3e50' }}>
          Pokemon with this Ability ({totalPokemon})
        </h4>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px',
          marginBottom: totalPokemon > 8 ? '8px' : '0'
        }}>
          {pokemonWithAbility.map((pokemon, index) => (
            <span
              key={index}
              style={{
                backgroundColor: pokemon.is_hidden ? '#e74c3c' : '#27ae60',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'capitalize'
              }}
              title={pokemon.is_hidden ? 'Hidden Ability' : 'Normal Ability'}
            >
              {pokemon.pokemon.name.replace('-', ' ')}
            </span>
          ))}
        </div>
        {totalPokemon > 8 && (
          <p style={{ 
            margin: '0', 
            fontSize: '12px', 
            color: '#7f8c8d',
            textAlign: 'center'
          }}>
            ...and {totalPokemon - 8} more Pokemon
          </p>
        )}
        <div style={{ 
          marginTop: '8px',
          fontSize: '11px',
          textAlign: 'center',
          color: '#95a5a6'
        }}>
          <span style={{ color: '#27ae60' }}>●</span> Normal Ability • 
          <span style={{ color: '#e74c3c' }}> ●</span> Hidden Ability
        </div>
      </div>
    </div>
  );
};

export default AbilityCard;