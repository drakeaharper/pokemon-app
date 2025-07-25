import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Item, ItemListResponse, ItemCategoryResponse } from '../types/Item';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Fetch a single item by name or ID
export const useItem = (nameOrId: string | null) => {
  return useQuery({
    queryKey: ['item', nameOrId],
    queryFn: async (): Promise<Item> => {
      if (!nameOrId) throw new Error('Item name or ID is required');
      const response = await axios.get(`${BASE_URL}/item/${nameOrId.toLowerCase()}`);
      return response.data;
    },
    enabled: !!nameOrId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Fetch items list with pagination
export const useItemsList = (limit: number = 100, offset: number = 0) => {
  return useQuery({
    queryKey: ['itemsList', limit, offset],
    queryFn: async (): Promise<ItemListResponse> => {
      const response = await axios.get(`${BASE_URL}/item?limit=${limit}&offset=${offset}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

// Fetch all items for search functionality (limited to reasonable amount)
export const useAllItems = () => {
  return useQuery({
    queryKey: ['allItems'],
    queryFn: async (): Promise<ItemListResponse> => {
      // PokeAPI has around 2000 items, we'll fetch first 500 for performance
      const response = await axios.get(`${BASE_URL}/item?limit=500`);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
};

// Fetch item categories
export const useItemCategories = () => {
  return useQuery({
    queryKey: ['itemCategories'],
    queryFn: async (): Promise<ItemCategoryResponse> => {
      const response = await axios.get(`${BASE_URL}/item-category`);
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 2,
  });
};

// Fetch items by category
export const useItemsByCategory = (categoryName: string | null) => {
  return useQuery({
    queryKey: ['itemsByCategory', categoryName],
    queryFn: async () => {
      if (!categoryName) throw new Error('Category name is required');
      const response = await axios.get(`${BASE_URL}/item-category/${categoryName.toLowerCase()}`);
      return response.data;
    },
    enabled: !!categoryName,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};