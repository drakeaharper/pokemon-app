import React, { useState } from 'react';
import { Pokemon } from '../types/Pokemon';
import { useMoveByName } from '../hooks/useMoveQueries';
import { processPokemonMoves, formatLearnMethod, getLearnMethodColor } from '../utils/pokemonMoves';
import TypePill from './TypePill';

interface PokemonMovesProps {
  pokemon: Pokemon;
}

const PokemonMoves: React.FC<PokemonMovesProps> = ({ pokemon }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('level-up');
  const movesByMethod = processPokemonMoves(pokemon);
  
  const availableMethods = Object.keys(movesByMethod).sort((a, b) => {
    // Sort methods: level-up first, then machine, then others alphabetically
    const order = ['level-up', 'machine', 'egg', 'tutor'];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    }
    return a.localeCompare(b);
  });

  const selectedMoves = movesByMethod[selectedMethod] || [];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl mb-8 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Moves</h2>
      
      {/* Method Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableMethods.map((method) => {
          const isSelected = method === selectedMethod;
          const color = getLearnMethodColor(method);
          
          return (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isSelected
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              style={{
                backgroundColor: isSelected ? color : 'transparent',
                border: `2px solid ${color}`,
              }}
            >
              {formatLearnMethod(method)} ({movesByMethod[method].length})
            </button>
          );
        })}
      </div>

      {/* Moves Table */}
      {selectedMoves.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                {selectedMethod === 'level-up' && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">Level</th>
                )}
                <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">Move</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">Type</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">Power</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">Accuracy</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">PP</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">Description</th>
              </tr>
            </thead>
            <tbody>
              {selectedMoves.map((moveData) => (
                <MoveRow
                  key={`${moveData.move.name}-${moveData.move_learn_method}`}
                  moveData={moveData}
                  showLevel={selectedMethod === 'level-up'}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No moves found for this learning method.
        </p>
      )}
    </div>
  );
};

interface MoveRowProps {
  moveData: {
    move: { name: string; url: string };
    level_learned_at: number;
    move_learn_method: string;
    version_group: string;
  };
  showLevel: boolean;
}

const MoveRow: React.FC<MoveRowProps> = ({ moveData, showLevel }) => {
  const { data: move, isLoading } = useMoveByName(moveData.move.name);

  if (isLoading) {
    return (
      <tr className="border-b border-gray-200 dark:border-gray-700">
        {showLevel && (
          <td className="py-3 px-4">
            <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </td>
        )}
        <td className="py-3 px-4">
          <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </td>
        <td className="py-3 px-4">
          <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </td>
        <td className="py-3 px-4 text-center">
          <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"></div>
        </td>
        <td className="py-3 px-4 text-center">
          <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"></div>
        </td>
        <td className="py-3 px-4 text-center">
          <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"></div>
        </td>
        <td className="py-3 px-4 text-center">
          <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto"></div>
        </td>
        <td className="py-3 px-4">
          <div className="w-48 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </td>
      </tr>
    );
  }

  if (!move) return null;

  const formatMoveName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatPower = (power: number | null) => {
    if (power === null) return '—';
    return power.toString();
  };

  const formatAccuracy = (accuracy: number | null) => {
    if (accuracy === null) return '—';
    return `${accuracy}%`;
  };

  const getDescription = () => {
    const flavorText = move.flavor_text_entries
      .find(entry => entry.language.name === 'en')
      ?.flavor_text.replace(/\f/g, ' ');
    
    const effectText = move.effect_entries
      .find(entry => entry.language.name === 'en')
      ?.effect.replace(/\$effect_chance/g, 'effect chance');
    
    return flavorText || effectText || 'No description available.';
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      {showLevel && (
        <td className="py-3 px-4">
          <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-bold px-2 py-1 rounded min-w-[2rem] text-center">
            {moveData.level_learned_at === 0 ? '—' : moveData.level_learned_at}
          </span>
        </td>
      )}
      <td className="py-3 px-4">
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {formatMoveName(move.name)}
        </span>
      </td>
      <td className="py-3 px-4">
        <TypePill typeName={move.type.name} size="sm" />
      </td>
      <td className="py-3 px-4 text-center font-semibold text-gray-800 dark:text-gray-100">
        {formatPower(move.power)}
      </td>
      <td className="py-3 px-4 text-center font-semibold text-gray-800 dark:text-gray-100">
        {formatAccuracy(move.accuracy)}
      </td>
      <td className="py-3 px-4 text-center font-semibold text-gray-800 dark:text-gray-100">
        {move.pp}
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-xs font-medium px-2 py-1 rounded capitalize text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-600">
          {move.damage_class.name}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
        <div className="truncate" title={getDescription()}>
          {getDescription()}
        </div>
      </td>
    </tr>
  );
};

export default PokemonMoves;