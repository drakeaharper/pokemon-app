import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useMovesList } from './useMoveQueries';

export const useFuzzyMoveSearch = (searchTerm: string) => {
  const { data: movesList, isLoading } = useMovesList();

  const fuse = useMemo(() => {
    if (!movesList) return null;
    
    return new Fuse(movesList, {
      keys: ['name'],
      threshold: 0.3, // Lower = more strict matching
      includeScore: true,
      minMatchCharLength: 1,
    });
  }, [movesList]);

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
    hasData: !!movesList,
  };
};