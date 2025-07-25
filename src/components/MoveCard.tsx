import React from 'react';
import { Move } from '../types/Move';

interface MoveCardProps {
  move: Move;
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

const damageClassColors: { [key: string]: string } = {
  physical: '#C92112',
  special: '#4F5870',
  status: '#8C888C',
};

const MoveCard: React.FC<MoveCardProps> = ({ move }) => {
  const backgroundColor = typeColors[move.type.name] || '#68A090';
  const damageClassColor = damageClassColors[move.damage_class.name] || '#888';
  
  // Get English description
  const englishDescription = move.flavor_text_entries.find(
    entry => entry.language.name === 'en'
  )?.flavor_text || move.effect_entries.find(
    entry => entry.language.name === 'en'
  )?.effect || 'No description available';

  return (
    <div style={{
      border: '2px solid #333',
      borderRadius: '15px',
      padding: '20px',
      maxWidth: '400px',
      margin: '10px',
      backgroundColor,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      color: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h3 style={{ 
          textTransform: 'capitalize', 
          margin: '0',
          fontSize: '24px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {move.name.replace('-', ' ')}
        </h3>
        <p style={{ 
          margin: '5px 0', 
          fontSize: '16px',
          fontWeight: 'bold' 
        }}>
          #{move.id}
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px',
        marginBottom: '15px'
      }}>
        <span style={{
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          padding: '5px 15px',
          borderRadius: '20px',
          textTransform: 'capitalize',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {move.type.name}
        </span>
        <span style={{
          backgroundColor: damageClassColor,
          padding: '5px 15px',
          borderRadius: '20px',
          textTransform: 'capitalize',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {move.damage_class.name}
        </span>
      </div>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        borderRadius: '10px', 
        padding: '15px',
        marginBottom: '15px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '10px',
          fontSize: '14px'
        }}>
          <div>
            <strong>Power:</strong> {move.power ?? 'N/A'}
          </div>
          <div>
            <strong>Accuracy:</strong> {move.accuracy ? `${move.accuracy}%` : 'N/A'}
          </div>
          <div>
            <strong>PP:</strong> {move.pp}
          </div>
          <div>
            <strong>Priority:</strong> {move.priority}
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        borderRadius: '10px', 
        padding: '15px',
        marginBottom: '10px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Description</h4>
        <p style={{ 
          margin: '0', 
          fontSize: '13px', 
          lineHeight: '1.4',
          textAlign: 'left'
        }}>
          {englishDescription.replace(/\n/g, ' ')}
        </p>
      </div>

      <div style={{ 
        fontSize: '12px',
        textAlign: 'center',
        opacity: 0.8
      }}>
        <div>
          <strong>Target:</strong> {move.target.name.replace('-', ' ')}
        </div>
        {move.generation && (
          <div style={{ marginTop: '3px' }}>
            <strong>Generation:</strong> {move.generation.name.replace('generation-', '').toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveCard;