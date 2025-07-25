export interface Type {
  id: number;
  name: string;
  damage_relations: {
    double_damage_from: Array<{
      name: string;
      url: string;
    }>;
    double_damage_to: Array<{
      name: string;
      url: string;
    }>;
    half_damage_from: Array<{
      name: string;
      url: string;
    }>;
    half_damage_to: Array<{
      name: string;
      url: string;
    }>;
    no_damage_from: Array<{
      name: string;
      url: string;
    }>;
    no_damage_to: Array<{
      name: string;
      url: string;
    }>;
  };
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
  }>;
  moves: Array<{
    name: string;
    url: string;
  }>;
}

export interface TypeListItem {
  name: string;
  url: string;
}

export interface TypesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TypeListItem[];
}

export type EffectivenessValue = 0 | 0.5 | 1 | 2;

export interface TypeEffectiveness {
  [attackingType: string]: {
    [defendingType: string]: EffectivenessValue;
  };
}

// The 18 main Pokemon types (excluding 'stellar' and 'unknown')
export const MAIN_TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
  'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
  'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'
] as const;

export type MainTypeName = typeof MAIN_TYPES[number];