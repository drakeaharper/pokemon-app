import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useAbilitiesList } from './useAbilityQueries';

export const useFuzzyAbilitySearch = (searchTerm: string) => {
  const { data: abilitiesList, isLoading } = useAbilitiesList();

  const fuse = useMemo(() => {
    if (!abilitiesList) return null;
    
    return new Fuse(abilitiesList, {
      keys: ['name'],
      threshold: 0.3, // Lower = more strict matching
      includeScore: true,
      minMatchCharLength: 1,
    });
  }, [abilitiesList]);

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
    hasData: !!abilitiesList,
  };
};