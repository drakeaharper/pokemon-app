export interface EvolutionDetail {
  min_level?: number;
  trigger: string;
  item?: {
    name: string;
  };
  held_item?: {
    name: string;
  };
  time_of_day?: string;
  min_happiness?: number;
  min_beauty?: number;
  min_affection?: number;
  location?: {
    name: string;
  };
  known_move?: {
    name: string;
  };
  known_move_type?: {
    name: string;
  };
}

export interface EvolutionChainLink {
  species: {
    name: string;
    url: string;
  };
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionChainLink;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  evolution_chain: {
    url: string;
  };
}

export interface ProcessedEvolution {
  id: number;
  name: string;
  sprite: string;
  evolutionDetails?: EvolutionDetail;
}

export interface EvolutionDisplay {
  previous: ProcessedEvolution[];
  current: ProcessedEvolution;
  next: ProcessedEvolution[][];
}