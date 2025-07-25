import { Type, TypeEffectiveness, MAIN_TYPES, EffectivenessValue } from '../types/Type';

/**
 * Build a complete type effectiveness matrix from PokeAPI type data
 * @param types Array of Type objects from PokeAPI
 * @returns TypeEffectiveness matrix with all matchups
 */
export const buildTypeEffectivenessMatrix = (types: Type[]): TypeEffectiveness => {
  const matrix: TypeEffectiveness = {};
  
  // Initialize matrix with default 1x effectiveness
  MAIN_TYPES.forEach(attackingType => {
    matrix[attackingType] = {};
    MAIN_TYPES.forEach(defendingType => {
      matrix[attackingType][defendingType] = 1;
    });
  });
  
  // Process each type's damage relations
  types.forEach(type => {
    const attackingType = type.name;
    
    // Super effective (2x damage)
    type.damage_relations.double_damage_to.forEach(target => {
      if (MAIN_TYPES.includes(target.name as any)) {
        matrix[attackingType][target.name] = 2;
      }
    });
    
    // Not very effective (0.5x damage)
    type.damage_relations.half_damage_to.forEach(target => {
      if (MAIN_TYPES.includes(target.name as any)) {
        matrix[attackingType][target.name] = 0.5;
      }
    });
    
    // No effect (0x damage)
    type.damage_relations.no_damage_to.forEach(target => {
      if (MAIN_TYPES.includes(target.name as any)) {
        matrix[attackingType][target.name] = 0;
      }
    });
  });
  
  return matrix;
};

/**
 * Get effectiveness value for a specific type matchup
 * @param attackingType The attacking type
 * @param defendingType The defending type
 * @param matrix The effectiveness matrix
 * @returns Effectiveness multiplier (0, 0.5, 1, or 2)
 */
export const getTypeEffectiveness = (
  attackingType: string,
  defendingType: string,
  matrix: TypeEffectiveness
): EffectivenessValue => {
  return matrix[attackingType]?.[defendingType] ?? 1;
};

/**
 * Get effectiveness description
 * @param effectiveness The effectiveness value
 * @returns Human-readable description
 */
export const getEffectivenessDescription = (effectiveness: EffectivenessValue): string => {
  switch (effectiveness) {
    case 2:
      return 'Super Effective';
    case 1:
      return 'Normal Damage';
    case 0.5:
      return 'Not Very Effective';
    case 0:
      return 'No Effect';
    default:
      return 'Normal Damage';
  }
};

/**
 * Get color for effectiveness value
 * @param effectiveness The effectiveness value
 * @returns CSS color string
 */
export const getEffectivenessColor = (effectiveness: EffectivenessValue): string => {
  switch (effectiveness) {
    case 2:
      return '#4CAF50'; // Green for super effective
    case 1:
      return '#FFF'; // White for normal
    case 0.5:
      return '#FF9800'; // Orange for not very effective
    case 0:
      return '#9E9E9E'; // Gray for no effect
    default:
      return '#FFF';
  }
};

/**
 * Get background color for effectiveness value
 * @param effectiveness The effectiveness value
 * @returns CSS background color string
 */
export const getEffectivenessBackgroundColor = (effectiveness: EffectivenessValue): string => {
  switch (effectiveness) {
    case 2:
      return '#C8E6C9'; // Light green for super effective
    case 1:
      return '#F5F5F5'; // Light gray for normal
    case 0.5:
      return '#FFE0B2'; // Light orange for not very effective
    case 0:
      return '#E0E0E0'; // Gray for no effect
    default:
      return '#F5F5F5';
  }
};