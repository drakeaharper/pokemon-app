import React, { useState, useEffect } from 'react';
import ItemCard from './ItemCard';
import { useItem } from '../hooks/useItemQueries';
import { useFuzzyItemSearch } from '../hooks/useFuzzyItemSearch';

const ItemsCatalog: React.FC = () => {
  const [itemSearch, setItemSearch] = useState<string>('master-ball');
  const [searchTerm, setSearchTerm] = useState<string | null>('master-ball');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const { data: item, isLoading, error: itemError } = useItem(searchTerm);
  const { searchResults } = useFuzzyItemSearch(itemSearch);

  // Prefetch adjacent items for smooth navigation
  const prefetchIds = [];
  if (item) {
    // Prefetch 2 items in each direction
    for (let i = 1; i <= 2; i++) {
      if (item.id - i >= 1) {
        prefetchIds.push((item.id - i).toString());
      }
      if (item.id + i <= 2000) {
        prefetchIds.push((item.id + i).toString());
      }
    }
  }
  
  // Prefetch the adjacent items
  useItem(prefetchIds[0] || null);
  useItem(prefetchIds[1] || null);
  useItem(prefetchIds[2] || null);
  useItem(prefetchIds[3] || null);

  const searchItem = (term?: string) => {
    const searchValue = term || itemSearch;
    if (!searchValue) {
      return;
    }
    setSearchTerm(searchValue);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setItemSearch(value);
    setShowSuggestions(value.length > 0 && searchResults.length > 0);
  };

  const handleSuggestionClick = (itemName: string) => {
    setItemSearch(itemName);
    setSearchTerm(itemName);
    setShowSuggestions(false);
  };

  const handlePreviousItem = () => {
    if (item && item.id > 1) {
      searchItem((item.id - 1).toString());
    }
  };

  const handleNextItem = () => {
    if (item && item.id < 2000) { // PokeAPI has around 2000 items
      searchItem((item.id + 1).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchItem();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchItem();
    }
  };

  // Update itemSearch when a successful search occurs
  useEffect(() => {
    if (item) {
      setItemSearch(item.name);
    }
  }, [item]);

  const error = itemError ? 'Item not found. Please try a different name or ID.' : '';

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-center mb-2.5 text-3xl font-bold text-gray-800 dark:text-white">
        Pokemon Items Catalog
      </h1>
      
      <p className="text-center mb-8 text-base text-gray-600 dark:text-gray-300">
        Browse Pokeballs, berries, evolution stones, battle items, and more
      </p>
      
      <form onSubmit={handleSubmit} className="text-center mb-8 px-5">
        <div className="relative inline-block w-full max-w-lg">
          <input
            type="text"
            placeholder="Enter item name or ID (e.g., master-ball, potion, 1)"
            value={itemSearch}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(itemSearch.length > 0 && searchResults.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="p-2.5 text-base w-full max-w-sm min-w-60 mb-2.5 rounded border-2 border-gray-300 box-border"
          />
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSuggestionClick(result.name)}
                  className="p-2.5 cursor-pointer border-b border-gray-200 flex justify-between items-center hover:bg-gray-100"
                >
                  <span className="capitalize">
                    {result.name.replace(/-/g, ' ')}
                  </span>
                  <span className="text-gray-600 text-xs">#{result.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2.5">
          <button
            type="submit"
            className="py-2.5 px-5 text-base bg-green-500 text-white border-none rounded cursor-pointer transition-colors duration-300 min-w-25 hover:bg-green-600"
          >
            Search
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="text-center text-xl flex items-center justify-center gap-2.5 min-h-48">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          Loading item data...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 text-lg mb-5">
          {error}
        </div>
      )}

      {item && !isLoading && (
        <>
          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <button
              onClick={handlePreviousItem}
              disabled={item.id <= 1}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                item.id <= 1 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
              }`}
            >
              ← Previous Item
            </button>
            
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Item {item.id} of 2000
            </span>
            
            <button
              onClick={handleNextItem}
              disabled={item.id >= 2000}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                item.id >= 2000 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
              }`}
            >
              Next Item →
            </button>
          </div>

          {/* Item Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ItemCard item={item} />
            </div>
          </div>
        </>
      )}

      <div className="text-center mt-10 text-sm text-gray-600">
        <p className="mb-2">Search by item name (e.g., master-ball, potion, rare-candy) or item ID (1-2000)</p>
        <p>Popular items: master-ball, ultra-ball, potion, rare-candy, moon-stone, fire-stone</p>
      </div>
    </div>
  );
};

export default ItemsCatalog;