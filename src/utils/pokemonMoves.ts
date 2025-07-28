import { Pokemon, PokemonMoveData } from '../types/Pokemon';

export const processPokemonMoves = (pokemon: Pokemon): Record<string, PokemonMoveData[]> => {
  const movesByMethod: Record<string, PokemonMoveData[]> = {};

  pokemon.moves.forEach((moveEntry) => {
    // Get the most recent version group details for each move
    const latestVersionGroup = moveEntry.version_group_details
      .sort((a, b) => {
        // Sort by version group to get the most recent
        return b.version_group.name.localeCompare(a.version_group.name);
      })[0];

    if (latestVersionGroup) {
      const method = latestVersionGroup.move_learn_method.name;
      
      if (!movesByMethod[method]) {
        movesByMethod[method] = [];
      }

      movesByMethod[method].push({
        move: moveEntry.move,
        level_learned_at: latestVersionGroup.level_learned_at,
        move_learn_method: method,
        version_group: latestVersionGroup.version_group.name,
      });
    }
  });

  // Sort moves within each method
  Object.keys(movesByMethod).forEach((method) => {
    if (method === 'level-up') {
      // Sort level-up moves by level learned
      movesByMethod[method].sort((a, b) => a.level_learned_at - b.level_learned_at);
    } else {
      // Sort other moves alphabetically
      movesByMethod[method].sort((a, b) => a.move.name.localeCompare(b.move.name));
    }
  });

  return movesByMethod;
};

export const formatLearnMethod = (method: string): string => {
  const methodNames: Record<string, string> = {
    'level-up': 'Level Up',
    'machine': 'TM/HM',
    'egg': 'Egg Moves',
    'tutor': 'Move Tutor',
    'form-change': 'Form Change',
    'stadium-surfing-pikachu': 'Surfing Pikachu',
    'light-ball-egg': 'Light Ball Egg',
    'colosseum-purification': 'Purification',
    'xd-shadow': 'Shadow',
    'xd-purification': 'XD Purification',
    'zygarde-cube': 'Zygarde Cube',
  };
  
  return methodNames[method] || method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getLearnMethodColor = (method: string): string => {
  const methodColors: Record<string, string> = {
    'level-up': '#10B981', // green
    'machine': '#3B82F6', // blue
    'egg': '#F59E0B', // amber
    'tutor': '#8B5CF6', // violet
    'form-change': '#EC4899', // pink
    'stadium-surfing-pikachu': '#06B6D4', // cyan
    'light-ball-egg': '#EAB308', // yellow
    'colosseum-purification': '#6366F1', // indigo
    'xd-shadow': '#6B7280', // gray
    'xd-purification': '#14B8A6', // teal
    'zygarde-cube': '#84CC16', // lime
  };
  
  return methodColors[method] || '#6B7280';
};