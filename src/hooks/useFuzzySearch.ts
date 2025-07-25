import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { usePokemonList } from './usePokemonQueries';

export const useFuzzySearch = (searchTerm: string) => {
  const { data: pokemonList, isLoading } = usePokemonList();

  const fuse = useMemo(() => {
    if (!pokemonList) return null;
    
    return new Fuse(pokemonList, {
      keys: ['name'],
      threshold: 0.3, // Lower = more strict matching
      includeScore: true,
      minMatchCharLength: 1,
    });
  }, [pokemonList]);

  const searchResults = useMemo(() => {
    if (!fuse || !searchTerm.trim()) return [];

    const results = fuse.search(searchTerm.trim());
    return results.slice(0, 10).map(result => ({
      name: result.item.name,
      id: result.item.id,
      score: result.score,
    }));
  }, [fuse, searchTerm]);

  return {
    searchResults,
    isLoading,
    hasData: !!pokemonList,
  };
};