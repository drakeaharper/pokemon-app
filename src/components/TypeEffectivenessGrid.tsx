import React, { useState } from 'react';
import { MAIN_TYPES, TypeEffectiveness } from '../types/Type';
import { 
  getTypeEffectiveness, 
  getEffectivenessDescription,
  getEffectivenessBackgroundColor 
} from '../utils/typeEffectiveness';

interface TypeEffectivenessGridProps {
  effectivenessMatrix: TypeEffectiveness;
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

const TypeEffectivenessGrid: React.FC<TypeEffectivenessGridProps> = ({ effectivenessMatrix }) => {
  const [highlightedType, setHighlightedType] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ attacking: string; defending: string } | null>(null);

  const handleTypeClick = (typeName: string) => {
    setHighlightedType(highlightedType === typeName ? null : typeName);
  };

  const isHighlighted = (attackingType: string, defendingType: string) => {
    if (!highlightedType) return false;
    return attackingType === highlightedType || defendingType === highlightedType;
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      overflowX: 'auto'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `100px repeat(${MAIN_TYPES.length}, 45px)`,
        gap: '2px',
        minWidth: '900px'
      }}>
        {/* Top-left corner cell */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ddd',
          borderRadius: '5px',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '5px'
        }}>
          ATK → DEF
        </div>

        {/* Column headers (defending types) */}
        {MAIN_TYPES.map(defendingType => (
          <div
            key={`def-${defendingType}`}
            onClick={() => handleTypeClick(defendingType)}
            style={{
              backgroundColor: typeColors[defendingType],
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              padding: '8px 4px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              opacity: highlightedType && highlightedType !== defendingType ? 0.5 : 1,
              transform: highlightedType === defendingType ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
              boxShadow: highlightedType === defendingType ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {defendingType.slice(0, 3)}
          </div>
        ))}

        {/* Grid rows */}
        {MAIN_TYPES.map(attackingType => (
          <React.Fragment key={attackingType}>
            {/* Row header (attacking type) */}
            <div
              onClick={() => handleTypeClick(attackingType)}
              style={{
                backgroundColor: typeColors[attackingType],
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                padding: '8px 10px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                opacity: highlightedType && highlightedType !== attackingType ? 0.5 : 1,
                transform: highlightedType === attackingType ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
                boxShadow: highlightedType === attackingType ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {attackingType}
            </div>

            {/* Effectiveness cells */}
            {MAIN_TYPES.map(defendingType => {
              const effectiveness = getTypeEffectiveness(attackingType, defendingType, effectivenessMatrix);
              const isHovered = hoveredCell?.attacking === attackingType && hoveredCell?.defending === defendingType;
              const cellHighlighted = isHighlighted(attackingType, defendingType);
              
              return (
                <div
                  key={`${attackingType}-${defendingType}`}
                  onMouseEnter={() => setHoveredCell({ attacking: attackingType, defending: defendingType })}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    backgroundColor: getEffectivenessBackgroundColor(effectiveness),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    height: '40px',
                    border: isHovered ? '2px solid #333' : cellHighlighted ? '2px solid #666' : '1px solid #ccc',
                    opacity: highlightedType && !cellHighlighted ? 0.3 : 1,
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    position: 'relative'
                  }}
                  title={`${attackingType.toUpperCase()} → ${defendingType.toUpperCase()}: ${effectiveness}x (${getEffectivenessDescription(effectiveness)})`}
                >
                  {effectiveness === 0 ? '0' : effectiveness === 0.5 ? '½' : effectiveness}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: getEffectivenessBackgroundColor(2),
            borderRadius: '3px',
            border: '1px solid #ccc'
          }} />
          <span style={{ fontSize: '14px' }}>2x Super Effective</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: getEffectivenessBackgroundColor(1),
            borderRadius: '3px',
            border: '1px solid #ccc'
          }} />
          <span style={{ fontSize: '14px' }}>1x Normal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: getEffectivenessBackgroundColor(0.5),
            borderRadius: '3px',
            border: '1px solid #ccc'
          }} />
          <span style={{ fontSize: '14px' }}>½x Not Very Effective</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: getEffectivenessBackgroundColor(0),
            borderRadius: '3px',
            border: '1px solid #ccc'
          }} />
          <span style={{ fontSize: '14px' }}>0x No Effect</span>
        </div>
      </div>

      {/* Hover information */}
      {hoveredCell && (
        <div style={{
          marginTop: '15px',
          textAlign: 'center',
          padding: '10px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <strong style={{ textTransform: 'capitalize', color: typeColors[hoveredCell.attacking] }}>
            {hoveredCell.attacking}
          </strong>
          <span> attacks </span>
          <strong style={{ textTransform: 'capitalize', color: typeColors[hoveredCell.defending] }}>
            {hoveredCell.defending}
          </strong>
          <span>: </span>
          <strong>
            {getTypeEffectiveness(hoveredCell.attacking, hoveredCell.defending, effectivenessMatrix)}x 
            ({getEffectivenessDescription(getTypeEffectiveness(hoveredCell.attacking, hoveredCell.defending, effectivenessMatrix))})
          </strong>
        </div>
      )}

      <div style={{ 
        marginTop: '15px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#666'
      }}>
        Click on type headers to highlight rows/columns • Hover over cells for details
      </div>
    </div>
  );
};

export default TypeEffectivenessGrid;