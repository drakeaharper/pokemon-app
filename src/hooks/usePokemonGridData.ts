import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { Pokemon } from '../types/Pokemon';

export const usePokemonGridData = () => {
  // Generate array of Pokemon IDs from 1 to 1025
  const pokemonIds = Array.from({ length: 1025 }, (_, i) => i + 1);

  const queries = useQueries({
    queries: pokemonIds.map(id => ({
      queryKey: ['pokemon', id], // Use consistent numeric key
      queryFn: async (): Promise<Pokemon> => {
        const response = await axios.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemon = response.data;
        
        // Also cache by name and string ID for compatibility with individual view
        // This ensures cache sharing between views
        return pokemon;
      },
      staleTime: 1000 * 60 * 10, // Match individual view stale time
      gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1, // Only retry once for non-existent Pokemon
    }))
  });

  // Extract loaded Pokemon data
  const loadedPokemon = queries
    .filter(query => query.isSuccess && query.data)
    .map(query => query.data!)
    .sort((a, b) => a.id - b.id);

  // Calculate loading progress
  const loadingCount = queries.filter(query => query.isLoading).length;
  const errorCount = queries.filter(query => query.isError).length;
  const successCount = queries.filter(query => query.isSuccess).length;
  const totalCount = queries.length;

  const isLoading = loadingCount > 0;
  const isComplete = successCount + errorCount === totalCount;
  const progress = ((successCount + errorCount) / totalCount) * 100;

  return {
    pokemon: loadedPokemon,
    isLoading,
    isComplete,
    progress: Math.round(progress),
    loadedCount: successCount,
    totalCount,
    errorCount
  };
};