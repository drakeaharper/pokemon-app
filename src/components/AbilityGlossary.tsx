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
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>
        Pokemon Ability Glossary
      </h1>
      
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        fontSize: '16px',
        color: '#666'
      }}>
        Comprehensive database of all Pokemon abilities with detailed descriptions
      </p>
      
      <form onSubmit={handleSubmit} style={{ 
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type="text"
            placeholder="Enter ability name or ID (e.g., stench, overgrow, 1)"
            value={abilitySearch}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(abilitySearch.length > 0 && searchResults.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '400px',
              marginRight: '10px',
              borderRadius: '5px',
              border: '2px solid #ddd'
            }}
          />
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
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSuggestionClick(result.name)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span style={{ textTransform: 'capitalize' }}>
                    {result.name.replace('-', ' ')}
                  </span>
                  <span style={{ color: '#666', fontSize: '12px' }}>#{result.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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

      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          minHeight: '200px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #4CAF50',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading ability data...
        </div>
      )}

      {error && (
        <div style={{ 
          textAlign: 'center', 
          color: 'red',
          fontSize: '18px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {ability && !isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AbilityCard ability={ability} />
        </div>
      )}

      <div style={{ 
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p>Search by ability name (e.g., stench, overgrow, swift-swim) or ability ID (1-367)</p>
        <p>Popular abilities: overgrow, blaze, torrent, swarm, keen-eye, hyper-cutter</p>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AbilityGlossary;