import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Ability, AbilityListItem, AbilitiesListResponse } from '../types/Ability';

export const useAbility = (searchTerm: string | null) => {
  return useQuery({
    queryKey: ['ability', searchTerm],
    queryFn: async (): Promise<Ability> => {
      if (!searchTerm) {
        throw new Error('No search term provided');
      }
      
      const response = await axios.get<Ability>(
        `https://pokeapi.co/api/v2/ability/${searchTerm.toLowerCase().trim()}`
      );
      return response.data;
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 15, // 15 minutes for ability data
  });
};

export const useAbilitiesList = () => {
  return useQuery({
    queryKey: ['abilitiesList'],
    queryFn: async (): Promise<AbilityListItem[]> => {
      const response = await axios.get<AbilitiesListResponse>(
        'https://pokeapi.co/api/v2/ability?limit=367'
      );
      
      return response.data.results.map((ability, index) => ({
        name: ability.name,
        url: ability.url,
        id: index + 1, // Ability IDs start from 1
      }));
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - abilities list rarely changes
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep for 7 days
  });
};

export const useAbilityByName = (abilityName: string | null) => {
  return useQuery({
    queryKey: ['abilityByName', abilityName],
    queryFn: async (): Promise<Ability> => {
      if (!abilityName) {
        throw new Error('No ability name provided');
      }
      
      const response = await axios.get<Ability>(
        `https://pokeapi.co/api/v2/ability/${abilityName.toLowerCase().replace(/\s+/g, '-')}`
      );
      return response.data;
    },
    enabled: !!abilityName,
    staleTime: 1000 * 60 * 15, // 15 minutes for ability data
  });
};