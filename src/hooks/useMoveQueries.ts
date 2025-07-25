import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Move, MoveListItem, MovesListResponse } from '../types/Move';

export const useMove = (searchTerm: string | null) => {
  return useQuery({
    queryKey: ['move', searchTerm],
    queryFn: async (): Promise<Move> => {
      if (!searchTerm) {
        throw new Error('No search term provided');
      }
      
      const response = await axios.get<Move>(
        `https://pokeapi.co/api/v2/move/${searchTerm.toLowerCase().trim()}`
      );
      return response.data;
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 15, // 15 minutes for move data
  });
};

export const useMovesList = () => {
  return useQuery({
    queryKey: ['movesList'],
    queryFn: async (): Promise<MoveListItem[]> => {
      const response = await axios.get<MovesListResponse>(
        'https://pokeapi.co/api/v2/move?limit=937'
      );
      
      return response.data.results.map((move, index) => ({
        name: move.name,
        url: move.url,
        id: index + 1, // Move IDs start from 1
      }));
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - moves list rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
  });
};

export const useMoveByName = (moveName: string | null) => {
  return useQuery({
    queryKey: ['moveByName', moveName],
    queryFn: async (): Promise<Move> => {
      if (!moveName) {
        throw new Error('No move name provided');
      }
      
      const response = await axios.get<Move>(
        `https://pokeapi.co/api/v2/move/${moveName.toLowerCase().replace(/\s+/g, '-')}`
      );
      return response.data;
    },
    enabled: !!moveName,
    staleTime: 1000 * 60 * 15, // 15 minutes for move data
  });
};