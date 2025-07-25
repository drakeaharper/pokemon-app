import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Type, TypesListResponse, MAIN_TYPES } from '../types/Type';

export const useType = (typeName: string | null) => {
  return useQuery({
    queryKey: ['type', typeName],
    queryFn: async (): Promise<Type> => {
      if (!typeName) {
        throw new Error('No type name provided');
      }
      
      const response = await axios.get<Type>(
        `https://pokeapi.co/api/v2/type/${typeName.toLowerCase().trim()}`
      );
      return response.data;
    },
    enabled: !!typeName,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - type data rarely changes
  });
};

export const useTypesList = () => {
  return useQuery({
    queryKey: ['typesList'],
    queryFn: async (): Promise<TypesListResponse> => {
      const response = await axios.get<TypesListResponse>(
        'https://pokeapi.co/api/v2/type'
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - types list rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
  });
};

export const useAllMainTypes = () => {
  return useQuery({
    queryKey: ['allMainTypes'],
    queryFn: async (): Promise<Type[]> => {
      const typePromises = MAIN_TYPES.map(typeName =>
        axios.get<Type>(`https://pokeapi.co/api/v2/type/${typeName}`)
      );
      
      const responses = await Promise.all(typePromises);
      return responses.map(response => response.data);
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - type data rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
  });
};