import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MoveCard from './MoveCard';
import DaisyMultiSelect from './DaisyMultiSelect';
import { useMove, useMovesByType } from '../hooks/useMoveQueries';
import { useFuzzyMoveSearch } from '../hooks/useFuzzyMoveSearch';
import { usePokemonTypes } from '../hooks/usePokemonQueries';

const MovesDatabase: React.FC = () => {
  const { moveName: moveNameParam } = useParams<{ moveName: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const initialMove = moveNameParam || 'tackle';
  const [moveSearch, setMoveSearch] = useState<string>(initialMove);
  const [searchTerm, setSearchTerm] = useState<string | null>(initialMove);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(typeParam ? [typeParam] : []);
  const [filteredMoves, setFilteredMoves] = useState<any[]>([]);
  const [currentFilteredIndex, setCurrentFilteredIndex] = useState<number>(0);

  const { data: move, isLoading, error: moveError } = useMove(searchTerm);
  const { searchResults } = useFuzzyMoveSearch(moveSearch);
  const { data: pokemonTypes } = usePokemonTypes();
  const selectedType = selectedTypes.length > 0 ? selectedTypes[0] : null;
  const { data: movesByType } = useMovesByType(selectedType);

  // Prefetch adjacent moves for smooth navigation
  const prefetchIds = [];
  if (move) {
    // Prefetch 2 moves in each direction
    for (let i = 1; i <= 2; i++) {
      if (move.id - i >= 1) {
        prefetchIds.push((move.id - i).toString());
      }
      if (move.id + i <= 937) {
        prefetchIds.push((move.id + i).toString());
      }
    }
  }
  
  // Prefetch the adjacent moves
  useMove(prefetchIds[0] || null);
  useMove(prefetchIds[1] || null);
  useMove(prefetchIds[2] || null);
  useMove(prefetchIds[3] || null);

  const searchMove = (term?: string) => {
    const searchValue = term || moveSearch;
    if (!searchValue) {
      return;
    }
    setSearchTerm(searchValue);
    setShowSuggestions(false);
    
    // Update URL if it's different from current URL
    if (searchValue.toLowerCase() !== moveNameParam?.toLowerCase()) {
      const queryString = selectedType ? `?type=${selectedType}` : '';
      navigate(`/moves/${searchValue.toLowerCase()}${queryString}`);
    }
  };

  const handleInputChange = (value: string) => {
    setMoveSearch(value);
    setShowSuggestions(value.length > 0 && searchResults.length > 0);
  };

  const handleSuggestionClick = (moveName: string) => {
    setMoveSearch(moveName);
    setSearchTerm(moveName);
    setShowSuggestions(false);
    // Clear type filter when doing direct search
    setSelectedTypes([]);
  };

  const handleTypeChange = (typeNames: (string | number)[]) => {
    const typeStrings = typeNames.map(t => String(t));
    setSelectedTypes(typeStrings);
    const selectedTypeName = typeStrings.length > 0 ? typeStrings[0] : null;
    
    if (selectedTypeName) {
      // Clear name search when filtering by type
      setMoveSearch('');
      setSearchTerm(null);
      setCurrentFilteredIndex(0);
      // Update URL with type parameter
      navigate(`/moves?type=${selectedTypeName}`);
    } else {
      // Clear type filter
      navigate('/moves');
    }
  };

  const handlePreviousMove = () => {
    if (selectedType && filteredMoves.length > 0) {
      // Navigate within filtered moves
      if (currentFilteredIndex > 0) {
        const previousMove = filteredMoves[currentFilteredIndex - 1];
        setSearchTerm(previousMove.name);
        setCurrentFilteredIndex(currentFilteredIndex - 1);
      }
    } else if (move && move.id > 1) {
      searchMove((move.id - 1).toString());
    }
  };

  const handleNextMove = () => {
    if (selectedType && filteredMoves.length > 0) {
      // Navigate within filtered moves
      if (currentFilteredIndex < filteredMoves.length - 1) {
        const nextMove = filteredMoves[currentFilteredIndex + 1];
        setSearchTerm(nextMove.name);
        setCurrentFilteredIndex(currentFilteredIndex + 1);
      }
    } else if (move && move.id < 937) {
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

  // Sync URL parameter to search term on initial load or browser navigation
  useEffect(() => {
    if (moveNameParam && !searchTerm) {
      setSearchTerm(moveNameParam);
      setMoveSearch(moveNameParam);
    }
  }, [moveNameParam, searchTerm]);

  // Update URL when move loads successfully and update search field
  useEffect(() => {
    if (move) {
      setMoveSearch(move.name);
      // Update URL only if it's different from current move name
      if (move.name.toLowerCase() !== moveNameParam?.toLowerCase()) {
        const queryString = selectedType ? `?type=${selectedType}` : '';
        navigate(`/moves/${move.name}${queryString}`, { replace: true });
      }
    }
  }, [move, moveNameParam, navigate, selectedType]);

  // Sync URL type parameter to selectedTypes on initial load
  useEffect(() => {
    if (typeParam && selectedTypes.length === 0) {
      setSelectedTypes([typeParam]);
    }
  }, [typeParam, selectedTypes.length]);

  // Handle moves by type loading
  useEffect(() => {
    if (movesByType && movesByType.length > 0 && selectedType) {
      setFilteredMoves(movesByType);
      setCurrentFilteredIndex(0);
      // Set the first move of the filtered type
      setSearchTerm(movesByType[0].name);
    }
  }, [movesByType, selectedType]);

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

      {/* Type Filter */}
      <div className="mb-8">
        <DaisyMultiSelect
          label="Filter by Type"
          options={pokemonTypes?.map((type: { name: string; url: string }) => ({
            id: type.name,
            name: type.name.charAt(0).toUpperCase() + type.name.slice(1)
          })) || []}
          selectedValues={selectedTypes}
          onChange={handleTypeChange}
          placeholder="Select types..."
          color="info"
          className="max-w-md mx-auto"
        />
      </div>

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
        <>
          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <button
              onClick={handlePreviousMove}
              disabled={selectedType ? currentFilteredIndex <= 0 : move.id <= 1}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                (selectedType ? currentFilteredIndex <= 0 : move.id <= 1)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
              }`}
            >
              ← Previous Move
            </button>
            
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {selectedType ? (
                `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Move ${currentFilteredIndex + 1} of ${filteredMoves.length}`
              ) : (
                `Move ${move.id} of 937`
              )}
            </span>
            
            <button
              onClick={handleNextMove}
              disabled={selectedType ? currentFilteredIndex >= filteredMoves.length - 1 : move.id >= 937}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                (selectedType ? currentFilteredIndex >= filteredMoves.length - 1 : move.id >= 937)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 shadow-md'
              }`}
            >
              Next Move →
            </button>
          </div>

          {/* Move Card */}
          <div className="flex justify-center">
            <MoveCard move={move} />
          </div>
        </>
      )}

      <div className="text-center mt-10 text-sm text-gray-600">
        <p className="mb-2">Search by move name (e.g., tackle, flamethrower) or move ID (1-937)</p>
        <p>Popular moves: tackle, thunderbolt, flamethrower, hydro-pump, earthquake</p>
      </div>
    </div>
  );
};

export default MovesDatabase;