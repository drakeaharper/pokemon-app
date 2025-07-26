import React, { useState, useEffect } from 'react';
import BerryCard from './BerryCard';
import { useBerry } from '../hooks/useBerryQueries';
import { useBerryFuzzySearch } from '../hooks/useBerryFuzzySearch';

const BerriesGuide: React.FC = () => {
  const [berryNumber, setBerryNumber] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState<string | null>('1');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const { data: berry, isLoading, error: berryError } = useBerry(searchTerm);
  const { searchResults } = useBerryFuzzySearch(berryNumber);

  // Prefetch adjacent berries for smooth navigation
  const prefetchIds = [];
  if (berry) {
    // Prefetch 2 berries in each direction
    for (let i = 1; i <= 2; i++) {
      if (berry.id - i >= 1) {
        prefetchIds.push((berry.id - i).toString());
      }
      if (berry.id + i <= 64) {
        prefetchIds.push((berry.id + i).toString());
      }
    }
  }
  
  // Prefetch the adjacent berries
  useBerry(prefetchIds[0] || null);
  useBerry(prefetchIds[1] || null);
  useBerry(prefetchIds[2] || null);
  useBerry(prefetchIds[3] || null);

  const searchBerry = (term?: string) => {
    const searchValue = term || berryNumber;
    if (!searchValue) {
      return;
    }
    setSearchTerm(searchValue);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setBerryNumber(value);
    setShowSuggestions(value.length > 0 && searchResults.length > 0);
  };

  const handleSuggestionClick = (berryName: string) => {
    setBerryNumber(berryName);
    setSearchTerm(berryName);
    setShowSuggestions(false);
  };

  const handlePreviousBerry = () => {
    if (berry && berry.id > 1) {
      searchBerry((berry.id - 1).toString());
    }
  };

  const handleNextBerry = () => {
    if (berry && berry.id < 64) { // 64 total berries
      searchBerry((berry.id + 1).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchBerry();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchBerry();
    }
  };

  // Update berryNumber when a successful search occurs
  useEffect(() => {
    if (berry) {
      setBerryNumber(berry.id.toString());
    }
  }, [berry]);

  const error = berryError ? 'Berry not found. Please try a different number or name.' : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 p-5 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          🍓 Berry Guide
        </h1>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="text-center mb-8">
          <div className="relative inline-block">
            <input
              type="text"
              placeholder="Enter berry number or name (e.g., 1 or cheri)"
              value={berryNumber}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(berryNumber.length > 0 && searchResults.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-80 px-4 py-3 text-lg border-2 border-green-300 dark:border-green-600 rounded-lg focus:outline-none focus:border-green-500 bg-white dark:bg-gray-800 dark:text-gray-100 shadow-md"
            />
            
            {/* Search Suggestions */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto mt-1">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleSuggestionClick(result.name)}
                    className="px-4 py-3 cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex justify-between items-center"
                  >
                    <span className="capitalize font-medium text-gray-900 dark:text-gray-100">{result.name} Berry</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">#{result.id}</span>
                  </div>
                ))}
              </div>
            )}
            
            <button
              type="submit"
              className="ml-3 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
            >
              Search
            </button>
          </div>
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center text-xl text-gray-600">
            Loading berry information...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center text-red-600 text-lg mb-6 bg-red-50 py-3 px-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Berry Display */}
        {berry && !isLoading && (
          <>
            {/* Navigation Buttons */}
            <div className="flex justify-center items-center gap-6 mb-8">
              <button
                onClick={handlePreviousBerry}
                disabled={berry.id <= 1}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  berry.id <= 1 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
                }`}
              >
                ← Previous Berry
              </button>
              
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Berry {berry.id} of 64
              </span>
              
              <button
                onClick={handleNextBerry}
                disabled={berry.id >= 64}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  berry.id >= 64 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
                }`}
              >
                Next Berry →
              </button>
            </div>

            {/* Berry Card */}
            <BerryCard berry={berry} />
          </>
        )}

        {/* Info Section */}
        <div className="text-center mt-12 text-gray-600">
          <p className="text-lg mb-2">
            Explore all 64 berries from the Pokémon world!
          </p>
          <p className="text-sm">
            Popular berries: 1/cheri, 2/chesto, 10/razz, 25/pinap
          </p>
        </div>
      </div>
    </div>
  );
};

export default BerriesGuide;