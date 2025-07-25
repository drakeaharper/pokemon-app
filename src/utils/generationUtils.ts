// Pokemon generation mapping based on National Dex numbers
export interface Generation {
  id: number;
  name: string;
  region: string;
  startId: number;
  endId: number;
  description: string;
}

export const GENERATIONS: Generation[] = [
  {
    id: 1,
    name: 'Generation I',
    region: 'Kanto',
    startId: 1,
    endId: 151,
    description: 'Red, Blue, Yellow'
  },
  {
    id: 2,
    name: 'Generation II',
    region: 'Johto',
    startId: 152,
    endId: 251,
    description: 'Gold, Silver, Crystal'
  },
  {
    id: 3,
    name: 'Generation III',
    region: 'Hoenn',
    startId: 252,
    endId: 386,
    description: 'Ruby, Sapphire, Emerald'
  },
  {
    id: 4,
    name: 'Generation IV',
    region: 'Sinnoh',
    startId: 387,
    endId: 493,
    description: 'Diamond, Pearl, Platinum'
  },
  {
    id: 5,
    name: 'Generation V',
    region: 'Unova',
    startId: 494,
    endId: 649,
    description: 'Black, White, Black 2, White 2'
  },
  {
    id: 6,
    name: 'Generation VI',
    region: 'Kalos',
    startId: 650,
    endId: 721,
    description: 'X, Y, Omega Ruby, Alpha Sapphire'
  },
  {
    id: 7,
    name: 'Generation VII',
    region: 'Alola',
    startId: 722,
    endId: 809,
    description: 'Sun, Moon, Ultra Sun, Ultra Moon'
  },
  {
    id: 8,
    name: 'Generation VIII',
    region: 'Galar',
    startId: 810,
    endId: 905,
    description: 'Sword, Shield, Legends Arceus'
  },
  {
    id: 9,
    name: 'Generation IX',
    region: 'Paldea',
    startId: 906,
    endId: 1025,
    description: 'Scarlet, Violet'
  }
];

// Get generation for a Pokemon by its ID
export const getPokemonGeneration = (pokemonId: number): Generation | null => {
  return GENERATIONS.find(gen => pokemonId >= gen.startId && pokemonId <= gen.endId) || null;
};

// Get all Pokemon IDs for a generation
export const getPokemonIdsForGeneration = (generationId: number): number[] => {
  const generation = GENERATIONS.find(gen => gen.id === generationId);
  if (!generation) return [];
  
  const ids: number[] = [];
  for (let i = generation.startId; i <= generation.endId; i++) {
    ids.push(i);
  }
  return ids;
};

// Get Pokemon count for a generation
export const getPokemonCountForGeneration = (generationId: number): number => {
  const generation = GENERATIONS.find(gen => gen.id === generationId);
  if (!generation) return 0;
  
  return generation.endId - generation.startId + 1;
};

// Get generation by ID
export const getGenerationById = (generationId: number): Generation | null => {
  return GENERATIONS.find(gen => gen.id === generationId) || null;
};