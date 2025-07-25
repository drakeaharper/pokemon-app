import React, { useState, useEffect } from 'react';
import AbilityCard from './AbilityCard';
import { useAbility } from '../hooks/useAbilityQueries';
import { useFuzzyAbilitySearch } from '../hooks/useFuzzyAbilitySearch';

const AbilityGlossary: React.FC = () => {
  const [abilitySearch, setAbilitySearch] = useState<string>('stench');
  const [searchTerm, setSearchTerm] = useState<string | null>('stench');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const { data: ability, isLoading, error: abilityError } = useAbility(searchTerm);
  const { searchResults } = useFuzzyAbilitySearch(abilitySearch);

  const searchAbility = (term?: string) => {
    const searchValue = term || abilitySearch;
    if (!searchValue) {
      return;
    }
    setSearchTerm(searchValue);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setAbilitySearch(value);
    setShowSuggestions(value.length > 0 && searchResults.length > 0);
  };

  const handleSuggestionClick = (abilityName: string) => {
    setAbilitySearch(abilityName);
    setSearchTerm(abilityName);
    setShowSuggestions(false);
  };

  const handlePreviousAbility = () => {
    if (ability && ability.id > 1) {
      searchAbility((ability.id - 1).toString());
    }
  };

  const handleNextAbility = () => {
    if (ability && ability.id < 367) {
      searchAbility((ability.id + 1).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchAbility();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchAbility();
    }
  };

  // Update abilitySearch when a successful search occurs
  useEffect(() => {
    if (ability) {
      setAbilitySearch(ability.name);
    }
  }, [ability]);

  const error = abilityError ? 'Ability not found. Please try a different name or ID.' : '';

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-center mb-2.5 text-3xl font-bold">
        Pokemon Ability Glossary
      </h1>
      
      <p className="text-center mb-8 text-base text-gray-600">
        Comprehensive database of all Pokemon abilities with detailed descriptions
      </p>
      
      <form onSubmit={handleSubmit} className="text-center mb-8 px-5">
        <div className="relative inline-block w-full max-w-lg">
          <input
            type="text"
            placeholder="Enter ability name or ID (e.g., stench, overgrow, 1)"
            value={abilitySearch}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(abilitySearch.length > 0 && searchResults.length > 0)}
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
        <div className="text-center text-xl flex items-center justify-center gap-2.5 min-h-48">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          Loading ability data...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 text-lg mb-5">
          {error}
        </div>
      )}

      {ability && !isLoading && (
        <div className="flex items-center justify-center gap-5 my-5">
          <button
            onClick={handlePreviousAbility}
            disabled={ability.id <= 1}
            className={`text-white border-none rounded-full w-12 h-12 text-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              ability.id <= 1 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 cursor-pointer hover:bg-green-600 hover:scale-110'
            }`}
          >
            ←
          </button>
          
          <AbilityCard ability={ability} />
          
          <button
            onClick={handleNextAbility}
            disabled={ability.id >= 367}
            className={`text-white border-none rounded-full w-12 h-12 text-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              ability.id >= 367 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 cursor-pointer hover:bg-green-600 hover:scale-110'
            }`}
          >
            →
          </button>
        </div>
      )}

      <div className="text-center mt-10 text-sm text-gray-600">
        <p className="mb-2">Search by ability name (e.g., stench, overgrow, swift-swim) or ability ID (1-367)</p>
        <p>Popular abilities: overgrow, blaze, torrent, swarm, keen-eye, hyper-cutter</p>
      </div>

    </div>
  );
};

export default AbilityGlossary;