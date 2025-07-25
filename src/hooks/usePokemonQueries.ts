import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Pokemon } from '../types/Pokemon';
import { EvolutionDisplay } from '../types/Evolution';
import { fetchEvolutionChain } from '../utils/evolutionUtils';

interface PokemonListItem {
  name: string;
  url: string;
  id: number;
}

export const usePokemon = (searchTerm: string | null) => {
  return useQuery({
    queryKey: ['pokemon', searchTerm],
    queryFn: async (): Promise<Pokemon> => {
      if (!searchTerm) {
        throw new Error('No search term provided');
      }
      
      const response = await axios.get<Pokemon>(
        `https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase().trim()}`
      );
      return response.data;
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 10, // 10 minutes for Pokemon data
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