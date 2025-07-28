import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import AbilityCard from './AbilityCard';
import { useAbility } from '../hooks/useAbilityQueries';
import { useFuzzyAbilitySearch } from '../hooks/useFuzzyAbilitySearch';

const AbilityGlossary: React.FC = () => {
  const { abilityName: abilityNameParam } = useParams<{ abilityName: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromPokemonId = searchParams.get('fromPokemon');
  
  const initialAbility = abilityNameParam || 'stench';
  const [abilitySearch, setAbilitySearch] = useState<string>(initialAbility);
  const [searchTerm, setSearchTerm] = useState<string | null>(initialAbility);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const { data: ability, isLoading, error: abilityError } = useAbility(searchTerm);
  const { searchResults } = useFuzzyAbilitySearch(abilitySearch);

  // Prefetch adjacent abilities for smooth navigation
  const prefetchIds = [];
  if (ability) {
    // Prefetch 2 abilities in each direction
    for (let i = 1; i <= 2; i++) {
      if (ability.id - i >= 1) {
        prefetchIds.push((ability.id - i).toString());
      }
      if (ability.id + i <= 367) {
        prefetchIds.push((ability.id + i).toString());
      }
    }
  }
  
  // Prefetch the adjacent abilities
  useAbility(prefetchIds[0] || null);
  useAbility(prefetchIds[1] || null);
  useAbility(prefetchIds[2] || null);
  useAbility(prefetchIds[3] || null);

  const searchAbility = (term?: string) => {
    const searchValue = term || abilitySearch;
    if (!searchValue) {
      return;
    }
    setSearchTerm(searchValue);
    setShowSuggestions(false);
    
    // Update URL if it's different from current URL
    if (searchValue.toLowerCase() !== abilityNameParam?.toLowerCase()) {
      const queryString = fromPokemonId ? `?fromPokemon=${fromPokemonId}` : '';
      navigate(`/abilities/${searchValue.toLowerCase()}${queryString}`);
    }
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

  // Sync URL parameter to search term on initial load or browser navigation
  useEffect(() => {
    if (abilityNameParam && !searchTerm) {
      setSearchTerm(abilityNameParam);
      setAbilitySearch(abilityNameParam);
    }
  }, [abilityNameParam, searchTerm]);

  // Update URL when ability loads successfully and update search field
  useEffect(() => {
    if (ability) {
      setAbilitySearch(ability.name);
      // Update URL only if it's different from current ability name
      if (ability.name.toLowerCase() !== abilityNameParam?.toLowerCase()) {
        const queryString = fromPokemonId ? `?fromPokemon=${fromPokemonId}` : '';
        navigate(`/abilities/${ability.name}${queryString}`, { replace: true });
      }
    }
  }, [ability, abilityNameParam, navigate, fromPokemonId]);

  const error = abilityError ? 'Ability not found. Please try a different name or ID.' : '';

  return (
    <div className="p-5 max-w-4xl mx-auto">
      {/* Back to Pokemon Button */}
      {fromPokemonId && (
        <div className="mb-6">
          <button
            onClick={() => navigate(`/${fromPokemonId}/details`)}
            className="btn btn-ghost btn-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← Back to Pokemon #{fromPokemonId}
          </button>
        </div>
      )}

      <h1 className="text-center mb-2.5 text-3xl font-bold text-gray-800 dark:text-white">
        Pokemon Ability Glossary
      </h1>
      
      <p className="text-center mb-8 text-base text-gray-600 dark:text-gray-300">
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
        <>
          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <button
              onClick={handlePreviousAbility}
              disabled={ability.id <= 1}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                ability.id <= 1 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
              }`}
            >
              ← Previous Ability
            </button>
            
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Ability {ability.id} of 367
            </span>
            
            <button
              onClick={handleNextAbility}
              disabled={ability.id >= 367}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                ability.id >= 367 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
              }`}
            >
              Next Ability →
            </button>
          </div>

          {/* Ability Card */}
          <div className="flex justify-center">
            <AbilityCard ability={ability} />
          </div>
        </>
      )}

      <div className="text-center mt-10 text-sm text-gray-600">
        <p className="mb-2">Search by ability name (e.g., stench, overgrow, swift-swim) or ability ID (1-367)</p>
        <p>Popular abilities: overgrow, blaze, torrent, swarm, keen-eye, hyper-cutter</p>
      </div>

    </div>
  );
};

export default AbilityGlossary;