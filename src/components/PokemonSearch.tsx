import React, { useState } from 'react';
import { useFuzzySearch } from '../hooks/useFuzzySearch';

interface PokemonSearchProps {
  onSearch: (pokemonName: string) => void;
  placeholder?: string;
  className?: string;
}

const PokemonSearch: React.FC<PokemonSearchProps> = ({ 
  onSearch, 
  placeholder = "Search Pokemon (e.g., pikachu, 25)",
  className = ""
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  
  const { searchResults } = useFuzzySearch(searchValue);

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    setShowSuggestions(value.length > 0 && searchResults.length > 0);
    setSelectedSuggestionIndex(-1); // Reset selection when typing
  };

  const handleSuggestionClick = (pokemonName: string) => {
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setSearchValue('');
    onSearch(pokemonName);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchResults.length === 0) {
      if (e.key === 'Enter' && searchValue.trim()) {
        onSearch(searchValue.trim());
        setSearchValue('');
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(searchResults[selectedSuggestionIndex].name);
        } else if (searchResults.length > 0) {
          handleSuggestionClick(searchResults[0].name);
        } else if (searchValue.trim()) {
          onSearch(searchValue.trim());
          setSearchValue('');
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchValue('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowSuggestions(searchValue.length > 0 && searchResults.length > 0)}
          onBlur={() => setTimeout(() => {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
          }, 150)}
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '350px',
            marginRight: '10px',
            borderRadius: '5px',
            border: '2px solid #ddd'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
        >
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && searchResults.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: '10px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {searchResults.map((result, index) => (
            <div
              key={result.id}
              onClick={() => handleSuggestionClick(result.name)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: index === selectedSuggestionIndex ? '#4CAF50' : 'white',
                color: index === selectedSuggestionIndex ? 'white' : 'black'
              }}
              onMouseEnter={(e) => {
                if (index !== selectedSuggestionIndex) {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.color = 'black';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== selectedSuggestionIndex) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'black';
                } else {
                  e.currentTarget.style.backgroundColor = '#4CAF50';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseOver={() => setSelectedSuggestionIndex(index)}
            >
              <span style={{ textTransform: 'capitalize' }}>{result.name}</span>
              <span style={{ 
                color: index === selectedSuggestionIndex ? '#e8f5e8' : '#666', 
                fontSize: '12px' 
              }}>
                #{result.id}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PokemonSearch;