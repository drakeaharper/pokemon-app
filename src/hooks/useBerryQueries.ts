import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Berry, BerryListItem } from '../types/Berry';

// Extract ID from PokeAPI URL
const extractIdFromUrl = (url: string): number => {
  const matches = url.match(/\/(\d+)\/$/);
  return matches ? parseInt(matches[1], 10) : 0;
};

export const useBerry = (searchTerm: string | null) => {
  return useQuery({
    queryKey: ['berry', searchTerm],
    queryFn: async (): Promise<Berry> => {
      if (!searchTerm) {
        throw new Error('No search term provided');
      }
      
      const response = await axios.get<Berry>(
        `https://pokeapi.co/api/v2/berry/${searchTerm.toLowerCase().trim()}`
      );
      return response.data;
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 15, // 15 minutes for berry data
  });
};

export const useBerryList = () => {
  return useQuery({
    queryKey: ['berryList'],
    queryFn: async (): Promise<BerryListItem[]> => {
      const response = await axios.get(
        'https://pokeapi.co/api/v2/berry?limit=100' // Get all berries (64 total)
      );
      
      return response.data.results.map((berry: any) => ({
        name: berry.name,
        url: berry.url,
        id: extractIdFromUrl(berry.url),
      }));
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - berry list rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
  });
};

// Alias for consistency with other APIs
export const useAllBerries = () => {
  const result = useBerryList();
  return {
    ...result,
    data: result.data ? { results: result.data } : undefined
  };
};