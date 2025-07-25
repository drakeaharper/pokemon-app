import Fuse from 'fuse.js';
import { useMemo } from 'react';
import { useAllItems } from './useItemQueries';

// Extract ID from PokeAPI URL (e.g., "https://pokeapi.co/api/v2/item/1/" -> 1)
const extractIdFromUrl = (url: string): number => {
  const matches = url.match(/\/(\d+)\/$/);
  return matches ? parseInt(matches[1], 10) : 0;
};

export const useFuzzyItemSearch = (searchTerm: string) => {
  const { data: itemsData, isLoading, error } = useAllItems();

  // Create searchable item data
  const searchableItems = useMemo(() => {
    if (!itemsData?.results) return [];
    
    return itemsData.results.map(item => ({
      id: extractIdFromUrl(item.url),
      name: item.name,
      category: '', // We don't have category in the list endpoint, will be filled when needed
    }));
  }, [itemsData]);

  // Create Fuse instance
  const fuse = useMemo(() => {
    if (searchableItems.length === 0) return null;

    return new Fuse(searchableItems, {
      keys: [
        { name: 'name', weight: 1.0 },
        { name: 'id', weight: 0.5 },
      ],
      threshold: 0.4, // More lenient matching for items
      distance: 100,
      minMatchCharLength: 1,
    });
  }, [searchableItems]);

  // Perform search
  const searchResults = useMemo(() => {
    if (!fuse || !searchTerm || searchTerm.length === 0) {
      return [];
    }

    const results = fuse.search(searchTerm);
    return results.map(result => result.item).slice(0, 10); // Limit to top 10 results
  }, [fuse, searchTerm]);

  return {
    searchResults,
    isLoading,
    error,
  };
};