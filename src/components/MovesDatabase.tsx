import React, { useState, useEffect } from 'react';
import MoveCard from './MoveCard';
import { useMove } from '../hooks/useMoveQueries';
import { useFuzzyMoveSearch } from '../hooks/useFuzzyMoveSearch';

const MovesDatabase: React.FC = () => {
  const [moveSearch, setMoveSearch] = useState<string>('tackle');
  const [searchTerm, setSearchTerm] = useState<string | null>('tackle');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const { data: move, isLoading, error: moveError } = useMove(searchTerm);
  const { searchResults } = useFuzzyMoveSearch(moveSearch);

  const searchMove = (term?: string) => {
    const searchValue = term || moveSearch;
    if (!searchValue) {
      return;
    }
    setSearchTerm(searchValue);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setMoveSearch(value);
    setShowSuggestions(value.length > 0 && searchResults.length > 0);
  };

  const handleSuggestionClick = (moveName: string) => {
    setMoveSearch(moveName);
    setSearchTerm(moveName);
    setShowSuggestions(false);
  };

  const handlePreviousMove = () => {
    if (move && move.id > 1) {
      searchMove((move.id - 1).toString());
    }
  };

  const handleNextMove = () => {
    if (move && move.id < 937) {
      searchMove((move.id + 1).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMove();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchMove();
    }
  };

  // Update moveSearch when a successful search occurs
  useEffect(() => {
    if (move) {
      setMoveSearch(move.name);
    }
  }, [move]);

  const error = moveError ? 'Move not found. Please try a different name or ID.' : '';

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-center mb-8 text-3xl font-bold text-gray-800 dark:text-white">
        Pokemon Moves Database
      </h1>
      
      <form onSubmit={handleSubmit} className="text-center mb-8 px-5">
        <div className="relative inline-block w-full max-w-lg">
          <input
            type="text"
            placeholder="Enter move name or ID (e.g., tackle, flamethrower, 1)"
            value={moveSearch}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(moveSearch.length > 0 && searchResults.length > 0)}
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
                    {result.name.replace('-', ' ')}
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
        <div className="text-center text-xl">
          Loading...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 text-lg mb-5">
          {error}
        </div>
      )}

      {move && !isLoading && (
        <div className="flex items-center justify-center gap-5 my-5">
          <button
            onClick={handlePreviousMove}
            disabled={move.id <= 1}
            className={`text-white border-none rounded-full w-12 h-12 text-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              move.id <= 1 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 cursor-pointer hover:bg-green-600 hover:scale-110'
            }`}
          >
            ←
          </button>
          
          <MoveCard move={move} />
          
          <button
            onClick={handleNextMove}
            disabled={move.id >= 937}
            className={`text-white border-none rounded-full w-12 h-12 text-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              move.id >= 937 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 cursor-pointer hover:bg-green-600 hover:scale-110'
            }`}
          >
            →
          </button>
        </div>
      )}

      <div className="text-center mt-10 text-sm text-gray-600">
        <p className="mb-2">Search by move name (e.g., tackle, flamethrower) or move ID (1-937)</p>
        <p>Popular moves: tackle, thunderbolt, flamethrower, hydro-pump, earthquake</p>
      </div>
    </div>
  );
};

export default MovesDatabase;