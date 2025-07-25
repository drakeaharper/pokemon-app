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
      <h1 className="text-center mb-2.5 text-3xl font-bold">
        Pokemon Items Catalog
      </h1>
      
      <p className="text-center mb-8 text-base text-gray-600">
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
        <div className="flex items-center justify-center gap-5 my-5">
          <button
            onClick={handlePreviousItem}
            disabled={item.id <= 1}
            className={`text-white border-none rounded-full w-12 h-12 text-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              item.id <= 1 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 cursor-pointer hover:bg-green-600 hover:scale-110'
            }`}
          >
            ←
          </button>
          
          <div className="w-full max-w-md">
            <ItemCard item={item} />
          </div>
          
          <button
            onClick={handleNextItem}
            disabled={item.id >= 2000}
            className={`text-white border-none rounded-full w-12 h-12 text-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              item.id >= 2000 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 cursor-pointer hover:bg-green-600 hover:scale-110'
            }`}
          >
            →
          </button>
        </div>
      )}

      <div className="text-center mt-10 text-sm text-gray-600">
        <p className="mb-2">Search by item name (e.g., master-ball, potion, rare-candy) or item ID (1-2000)</p>
        <p>Popular items: master-ball, ultra-ball, potion, rare-candy, moon-stone, fire-stone</p>
      </div>
    </div>
  );
};

export default ItemsCatalog;