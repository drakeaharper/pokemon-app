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
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ attacking: string; defending: string } | null>(null);

  const handleRowClick = (typeName: string) => {
    // If no selections exist, highlight both row and column
    if (!highlightedRow && !highlightedColumn) {
      setHighlightedRow(typeName);
      setHighlightedColumn(typeName);
    } else {
      // Otherwise just change the row
      setHighlightedRow(highlightedRow === typeName ? null : typeName);
    }
  };

  const handleColumnClick = (typeName: string) => {
    // If no selections exist, highlight both row and column
    if (!highlightedRow && !highlightedColumn) {
      setHighlightedRow(typeName);
      setHighlightedColumn(typeName);
    } else {
      // Otherwise just change the column
      setHighlightedColumn(highlightedColumn === typeName ? null : typeName);
    }
  };

  const isHighlighted = (attackingType: string, defendingType: string) => {
    return attackingType === highlightedRow || defendingType === highlightedColumn;
  };

  return (
    <div className="p-5 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
      <div 
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `100px repeat(${MAIN_TYPES.length}, 45px)`,
          minWidth: '900px'
        }}
      >
        {/* Top-left corner cell */}
        <div className="flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded text-xs font-bold p-1 text-gray-800 dark:text-gray-200">
          ATK → DEF
        </div>

        {/* Column headers (defending types) */}
        {MAIN_TYPES.map(defendingType => (
          <div
            key={`def-${defendingType}`}
            onClick={() => handleColumnClick(defendingType)}
            className={`text-white flex items-center justify-center rounded cursor-pointer text-xs font-bold uppercase py-2 px-1 transition-all duration-200 ${
              highlightedColumn && highlightedColumn !== defendingType ? 'opacity-50' : 'opacity-100'
            } ${
              highlightedColumn === defendingType ? 'scale-105 shadow-lg' : 'scale-100'
            }`}
            style={{
              backgroundColor: typeColors[defendingType],
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
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
              onClick={() => handleRowClick(attackingType)}
              className={`text-white flex items-center justify-start rounded cursor-pointer text-xs font-bold capitalize py-2 px-2.5 transition-all duration-200 ${
                highlightedRow && highlightedRow !== attackingType ? 'opacity-50' : 'opacity-100'
              } ${
                highlightedRow === attackingType ? 'scale-102 shadow-lg' : 'scale-100'
              }`}
              style={{
                backgroundColor: typeColors[attackingType],
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
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
                  className={`flex items-center justify-center rounded-sm cursor-pointer text-xs font-bold h-10 relative transition-all duration-200 ${
                    isHovered ? 'border-2 border-gray-800 dark:border-gray-200 scale-110 shadow-lg' : 
                    cellHighlighted ? 'border-2 border-gray-600 dark:border-gray-400' : 'border border-gray-300 dark:border-gray-600'
                  } ${
                    (highlightedRow || highlightedColumn) && !cellHighlighted ? 'opacity-30' : 'opacity-100'
                  }`}
                  style={{
                    backgroundColor: getEffectivenessBackgroundColor(effectiveness)
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
      <div className="mt-5 flex justify-center gap-5 flex-wrap text-gray-800 dark:text-gray-200">
        <div className="flex items-center gap-1">
          <div 
            className="w-5 h-5 rounded-sm border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: getEffectivenessBackgroundColor(2) }}
          />
          <span className="text-sm">2x Super Effective</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className="w-5 h-5 rounded-sm border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: getEffectivenessBackgroundColor(1) }}
          />
          <span className="text-sm">1x Normal</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className="w-5 h-5 rounded-sm border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: getEffectivenessBackgroundColor(0.5) }}
          />
          <span className="text-sm">½x Not Very Effective</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className="w-5 h-5 rounded-sm border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: getEffectivenessBackgroundColor(0) }}
          />
          <span className="text-sm">0x No Effect</span>
        </div>
      </div>

      {/* Hover information */}
      {hoveredCell && (
        <div className="mt-4 text-center p-2.5 bg-white dark:bg-gray-700 rounded-lg shadow-md text-gray-800 dark:text-gray-200">
          <strong 
            className="capitalize"
            style={{ color: typeColors[hoveredCell.attacking] }}
          >
            {hoveredCell.attacking}
          </strong>
          <span> attacks </span>
          <strong 
            className="capitalize"
            style={{ color: typeColors[hoveredCell.defending] }}
          >
            {hoveredCell.defending}
          </strong>
          <span>: </span>
          <strong>
            {getTypeEffectiveness(hoveredCell.attacking, hoveredCell.defending, effectivenessMatrix)}x 
            ({getEffectivenessDescription(getTypeEffectiveness(hoveredCell.attacking, hoveredCell.defending, effectivenessMatrix))})
          </strong>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-gray-600 dark:text-gray-400">
        Click row headers to highlight attacking types • Click column headers to highlight defending types • Hover over cells for details
      </div>
    </div>
  );
};

export default TypeEffectivenessGrid;