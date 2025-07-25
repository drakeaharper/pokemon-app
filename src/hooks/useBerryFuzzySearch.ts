import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useBerryList } from './useBerryQueries';

export const useBerryFuzzySearch = (searchTerm: string) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { data: berryList } = useBerryList();

  const fuse = useMemo(() => {
    if (!berryList) return null;

    return new Fuse(berryList, {
      keys: ['name', 'id'],
      threshold: 0.4, // How strict the search should be (0 = exact match, 1 = very loose)
      includeScore: true,
      minMatchCharLength: 1,
    });
  }, [berryList]);

  useEffect(() => {
    if (!fuse || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    // If searchTerm is purely numeric, prioritize exact ID matches
    const isNumeric = /^\d+$/.test(searchTerm.trim());
    
    if (isNumeric) {
      const exactIdMatch = berryList?.find(berry => berry.id.toString() === searchTerm.trim());
      if (exactIdMatch) {
        setSearchResults([exactIdMatch]);
        return;
      }
    }

    // Fuzzy search
    const results = fuse.search(searchTerm.trim());
    const formattedResults = results
      .slice(0, 10) // Limit to 10 results
      .map(result => result.item);

    setSearchResults(formattedResults);
  }, [fuse, searchTerm, berryList]);

  return { searchResults };
};