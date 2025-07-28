import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Pokemon, PokemonSpecies, PokemonForm } from '../types/Pokemon';
import { EvolutionDisplay } from '../types/Evolution';
import { fetchEvolutionChain } from '../utils/evolutionUtils';
import { getPokemonIdsForGeneration } from '../utils/generationUtils';

interface PokemonListItem {
  name: string;
  url: string;
  id: number;
}

export const usePokemon = (searchTerm: string | number | null) => {
  return useQuery({
    queryKey: ['pokemon', searchTerm],
    queryFn: async (): Promise<Pokemon> => {
      if (!searchTerm) {
        throw new Error('No search term provided');
      }
      
      const identifier = typeof searchTerm === 'string' 
        ? searchTerm.toLowerCase().trim() 
        : searchTerm;
      
      const response = await axios.get<Pokemon>(
        `https://pokeapi.co/api/v2/pokemon/${identifier}`
      );
      return response.data;
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 10, // 10 minutes for Pokemon data
  });
};

export const usePokemonSpecies = (pokemonId: number | null) => {
  return useQuery({
    queryKey: ['pokemonSpecies', pokemonId],
    queryFn: async (): Promise<PokemonSpecies> => {
      if (!pokemonId) {
        throw new Error('No Pokemon ID provided');
      }
      
      const response = await axios.get<PokemonSpecies>(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
      );
      return response.data;
    },
    enabled: !!pokemonId,
    staleTime: 1000 * 60 * 15, // 15 minutes for species data
  });
};

export const usePokemonForms = (pokemonName: string | null) => {
  return useQuery({
    queryKey: ['pokemonForms', pokemonName],
    queryFn: async (): Promise<PokemonForm[]> => {
      if (!pokemonName) {
        throw new Error('No Pokemon name provided');
      }
      
      // First get the Pokemon to find all form URLs
      const pokemonResponse = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
      );
      
      const formUrls = pokemonResponse.data.forms || [];
      
      // Fetch all forms
      const formPromises = formUrls.map((form: any) => 
        axios.get<PokemonForm>(form.url)
      );
      
      const formResponses = await Promise.all(formPromises);
      return formResponses.map(response => response.data);
    },
    enabled: !!pokemonName,
    staleTime: 1000 * 60 * 15, // 15 minutes for forms data
  });
};

export const useEvolutionChain = (pokemonId: number | null) => {
  return useQuery({
    queryKey: ['evolution', pokemonId],
    queryFn: async (): Promise<EvolutionDisplay | null> => {
      if (!pokemonId) {
        throw new Error('No Pokemon ID provided');
      }
      
      return await fetchEvolutionChain(pokemonId);
    },
    enabled: !!pokemonId,
    staleTime: 1000 * 60 * 15, // 15 minutes for evolution data
  });
};

export const usePokemonList = () => {
  return useQuery({
    queryKey: ['pokemonList'],
    queryFn: async (): Promise<PokemonListItem[]> => {
      const response = await axios.get(
        'https://pokeapi.co/api/v2/pokemon?limit=1025'
      );
      
      return response.data.results.map((pokemon: any, index: number) => ({
        name: pokemon.name,
        url: pokemon.url,
        id: index + 1, // Pokemon IDs start from 1
      }));
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - Pokemon list rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
  });
};

// Alias for quiz functionality
export const useAllPokemon = () => {
  const result = usePokemonList();
  return {
    ...result,
    data: result.data ? { results: result.data } : undefined
  };
};

// Fetch Pokemon types for filtering
export const usePokemonTypes = () => {
  return useQuery({
    queryKey: ['pokemonTypes'],
    queryFn: async () => {
      const response = await axios.get('https://pokeapi.co/api/v2/type');
      return response.data.results.map((type: any) => ({
        name: type.name,
        url: type.url
      }));
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - types rarely change
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
  });
};

// Fetch Pokemon by type
export const usePokemonByType = (typeName: string | null) => {
  return useQuery({
    queryKey: ['pokemonByType', typeName],
    queryFn: async () => {
      if (!typeName) return null;
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}`);
      return response.data.pokemon.map((pokemonEntry: any) => ({
        name: pokemonEntry.pokemon.name,
        url: pokemonEntry.pokemon.url
      }));
    },
    enabled: !!typeName,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useEvolutionChainById = (chainId: number | null) => {
  return useQuery({
    queryKey: ['evolutionChainById', chainId],
    queryFn: async (): Promise<{ pokemonId: number; actualChainId: number } | null> => {
      if (!chainId) return null;
      
      let currentChainId = chainId;
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loops
      
      while (attempts < maxAttempts) {
        try {
          const response = await axios.get(
            `https://pokeapi.co/api/v2/evolution-chain/${currentChainId}`
          );
          
          // Return the ID of the first Pokemon in the chain and the actual chain ID found
          const firstPokemonUrl = response.data.chain.species.url;
          const matches = firstPokemonUrl.match(/\/(\d+)\/$/);
          const pokemonId = matches ? parseInt(matches[1]) : null;
          
          if (pokemonId) {
            return { pokemonId, actualChainId: currentChainId };
          }
          
          // If no Pokemon ID found, try next chain
          currentChainId++;
          attempts++;
        } catch (error) {
          // Chain doesn't exist, try the next one
          currentChainId++;
          attempts++;
        }
      }
      
      return null; // No valid chain found after max attempts
    },
    enabled: !!chainId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// Similar logic for going backwards
export const useEvolutionChainByIdReverse = (chainId: number | null) => {
  return useQuery({
    queryKey: ['evolutionChainByIdReverse', chainId],
    queryFn: async (): Promise<{ pokemonId: number; actualChainId: number } | null> => {
      if (!chainId) return null;
      
      let currentChainId = chainId;
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loops
      
      while (attempts < maxAttempts && currentChainId > 0) {
        try {
          const response = await axios.get(
            `https://pokeapi.co/api/v2/evolution-chain/${currentChainId}`
          );
          
          // Return the ID of the first Pokemon in the chain and the actual chain ID found
          const firstPokemonUrl = response.data.chain.species.url;
          const matches = firstPokemonUrl.match(/\/(\d+)\/$/);
          const pokemonId = matches ? parseInt(matches[1]) : null;
          
          if (pokemonId) {
            return { pokemonId, actualChainId: currentChainId };
          }
          
          // If no Pokemon ID found, try previous chain
          currentChainId--;
          attempts++;
        } catch (error) {
          // Chain doesn't exist, try the previous one
          currentChainId--;
          attempts++;
        }
      }
      
      return null; // No valid chain found after max attempts
    },
    enabled: !!chainId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// Get unique types for Pokemon in a specific generation
export const usePokemonTypesForGeneration = (generationId: number | null) => {
  return useQuery({
    queryKey: ['pokemonTypesForGeneration', generationId],
    queryFn: async () => {
      if (!generationId) return null;
      
      const pokemonIds = getPokemonIdsForGeneration(generationId);
      const typesSet = new Set<string>();
      
      // Sample a subset of Pokemon to determine types (for performance)
      // We'll fetch every 5th Pokemon to get a good representative sample
      const sampleIds = pokemonIds.filter((_, index) => index % 5 === 0);
      
      try {
        const pokemonPromises = sampleIds.map(async (id) => {
          try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
            return response.data.types.map((type: any) => type.type.name);
          } catch (error) {
            return [];
          }
        });
        
        const allTypes = await Promise.all(pokemonPromises);
        
        // Flatten and deduplicate types
        allTypes.flat().forEach(type => typesSet.add(type));
        
        // Convert to array and sort
        const uniqueTypes = Array.from(typesSet).sort();
        
        // Return in the same format as usePokemonTypes
        return uniqueTypes.map(name => ({ name, url: `https://pokeapi.co/api/v2/type/${name}/` }));
        
      } catch (error) {
        console.warn('Failed to fetch types for generation:', error);
        return [];
      }
    },
    enabled: !!generationId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - generation types rarely change
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
  });
};

// Enhanced usePokemonByType that respects generation filtering
export const usePokemonByTypeInGeneration = (typeName: string | null, generationId: number | null) => {
  return useQuery({
    queryKey: ['pokemonByTypeInGeneration', typeName, generationId],
    queryFn: async () => {
      if (!typeName) return null;
      
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}`);
      let pokemonList = response.data.pokemon.map((pokemonEntry: any) => ({
        name: pokemonEntry.pokemon.name,
        url: pokemonEntry.pokemon.url
      }));
      
      // If generation is specified, filter Pokemon to only include those in the generation
      if (generationId) {
        const generationPokemonIds = getPokemonIdsForGeneration(generationId);
        const generationPokemonIdsSet = new Set(generationPokemonIds);
        
        pokemonList = pokemonList.filter((pokemon: any) => {
          const pokemonId = parseInt(pokemon.url.match(/\/(\d+)\/$/)?.[1] || '0');
          return generationPokemonIdsSet.has(pokemonId);
        });
      }
      
      return pokemonList;
    },
    enabled: !!typeName,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook to fetch Pokemon for multiple types
export const usePokemonByMultipleTypes = (typeNames: string[], generationIds: number[]) => {
  return useQuery({
    queryKey: ['pokemonByMultipleTypes', typeNames.sort(), generationIds.sort()],
    queryFn: async () => {
      if (typeNames.length === 0) return [];
      
      const allPokemonMap = new Map<string, { name: string; url: string }>();
      
      // Fetch Pokemon for each type
      for (const typeName of typeNames) {
        try {
          const response = await axios.get(`https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}`);
          const pokemonList = response.data.pokemon.map((pokemonEntry: any) => ({
            name: pokemonEntry.pokemon.name,
            url: pokemonEntry.pokemon.url
          }));
          
          // Add all Pokemon from this type to the map (removes duplicates)
          pokemonList.forEach((pokemon: any) => {
            allPokemonMap.set(pokemon.name, pokemon);
          });
        } catch (error) {
          console.warn(`Failed to fetch Pokemon for type ${typeName}:`, error);
        }
      }
      
      let combinedPokemonList = Array.from(allPokemonMap.values());
      
      // If generations are specified, filter Pokemon to only include those in the selected generations
      if (generationIds.length > 0) {
        const allGenerationPokemonIds: number[] = [];
        generationIds.forEach(genId => {
          allGenerationPokemonIds.push(...getPokemonIdsForGeneration(genId));
        });
        const generationPokemonIdsSet = new Set(allGenerationPokemonIds);
        
        combinedPokemonList = combinedPokemonList.filter((pokemon: any) => {
          const pokemonId = parseInt(pokemon.url.match(/\/(\d+)\/$/)?.[1] || '0');
          return generationPokemonIdsSet.has(pokemonId);
        });
      }
      
      return combinedPokemonList;
    },
    enabled: typeNames.length > 0,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};