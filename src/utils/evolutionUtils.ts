import axios from 'axios';
import { EvolutionChain, EvolutionChainLink, ProcessedEvolution, EvolutionDisplay, PokemonSpecies } from '../types/Evolution';

const getPokemonIdFromUrl = (url: string): number => {
  const matches = url.match(/\/(\d+)\/$/);
  return matches ? parseInt(matches[1]) : 0;
};

const buildEvolutionTree = (
  link: EvolutionChainLink,
  currentPokemonName: string,
  path: ProcessedEvolution[] = []
): {
  paths: ProcessedEvolution[][];
  currentPath?: ProcessedEvolution[];
  currentIndex?: number;
} => {
  const pokemonId = getPokemonIdFromUrl(link.species.url);
  
  const currentEvolution: ProcessedEvolution = {
    id: pokemonId,
    name: link.species.name,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
    shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`,
    evolutionDetails: link.evolution_details[0]
  };

  const newPath = [...path, currentEvolution];
  
  if (link.evolves_to.length === 0) {
    // End of evolution chain
    const currentIndex = newPath.findIndex(p => p.name === currentPokemonName);
    if (currentIndex !== -1) {
      return {
        paths: [newPath],
        currentPath: newPath,
        currentIndex
      };
    }
    return { paths: [newPath] };
  }

  let allPaths: ProcessedEvolution[][] = [];
  let foundCurrentPath: ProcessedEvolution[] | undefined;
  let foundCurrentIndex: number | undefined;

  for (const evolution of link.evolves_to) {
    const result = buildEvolutionTree(evolution, currentPokemonName, newPath);
    allPaths.push(...result.paths);
    
    if (result.currentPath && result.currentIndex !== undefined) {
      foundCurrentPath = result.currentPath;
      foundCurrentIndex = result.currentIndex;
    }
  }

  // Check if current pokemon is at this level
  if (currentPokemonName === link.species.name) {
    foundCurrentPath = newPath;
    foundCurrentIndex = newPath.length - 1;
  }

  return {
    paths: allPaths,
    currentPath: foundCurrentPath,
    currentIndex: foundCurrentIndex
  };
};

export const fetchEvolutionChain = async (pokemonId: number): Promise<EvolutionDisplay | null> => {
  try {
    // First, get the species data to find the evolution chain URL
    const speciesResponse = await axios.get<PokemonSpecies>(
      `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
    );
    
    // Then fetch the evolution chain
    const evolutionResponse = await axios.get<EvolutionChain>(
      speciesResponse.data.evolution_chain.url
    );

    const evolutionData = evolutionResponse.data;
    const currentPokemonName = speciesResponse.data.name;

    // Build the complete evolution tree
    const treeResult = buildEvolutionTree(evolutionData.chain, currentPokemonName);
    
    if (!treeResult.currentPath || treeResult.currentIndex === undefined) {
      return null;
    }

    const currentPath = treeResult.currentPath;
    const currentIndex = treeResult.currentIndex;

    // Get previous evolutions (all pokemon before current in the path)
    const previous = currentPath.slice(0, currentIndex);

    // Get current pokemon
    const current = currentPath[currentIndex];

    // Get next evolutions (branched evolution support)
    const next: ProcessedEvolution[][] = [];
    
    if (currentIndex < currentPath.length - 1) {
      // Direct evolution path
      next.push(currentPath.slice(currentIndex + 1));
    }

    // Check for branched evolutions
    // Find all paths that contain the current pokemon and get their continuations
    for (const path of treeResult.paths) {
      const pathCurrentIndex = path.findIndex(p => p.name === currentPokemonName);
      if (pathCurrentIndex !== -1 && pathCurrentIndex < path.length - 1) {
        const continuation = path.slice(pathCurrentIndex + 1);
        // Check if this continuation is different from what we already have
        const isDifferent = !next.some(existing => 
          existing.length === continuation.length && 
          existing.every((p, i) => p.name === continuation[i].name)
        );
        if (isDifferent) {
          next.push(continuation);
        }
      }
    }

    return {
      previous,
      current,
      next,
      chainId: evolutionData.id
    };
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return null;
  }
};