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

export const useEvolutionChainById = (chainId: number | null) => {
  return useQuery({
    queryKey: ['evolutionChainById', chainId],
    queryFn: async (): Promise<number | null> => {
      if (!chainId) return null;
      
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/evolution-chain/${chainId}`
        );
        
        // Return the ID of the first Pokemon in the chain
        const firstPokemonUrl = response.data.chain.species.url;
        const matches = firstPokemonUrl.match(/\/(\d+)\/$/);
        return matches ? parseInt(matches[1]) : null;
      } catch (error) {
        // Chain doesn't exist
        return null;
      }
    },
    enabled: !!chainId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};