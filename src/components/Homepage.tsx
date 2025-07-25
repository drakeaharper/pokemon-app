import React from 'react';

const Homepage: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px 20px',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        About Pokemon Card App
      </h1>
      
      <div style={{ 
        backgroundColor: '#f9f9f9',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#4CAF50', marginTop: 0 }}>Features</h2>
        <ul style={{ fontSize: '16px', color: '#555' }}>
          <li><strong>Smart Search:</strong> Find Pokemon by number or name with fuzzy matching and autocomplete</li>
          <li><strong>Evolution Chains:</strong> Interactive evolution trees with clickable Pokemon cards</li>
          <li><strong>Navigation:</strong> Browse Pokemon sequentially with left/right arrows</li>
          <li><strong>Rich Data:</strong> View stats, types, height, weight, and official artwork</li>
          <li><strong>Performance:</strong> Lightning-fast searches with intelligent caching</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#e8f5e9',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#4CAF50', marginTop: 0 }}>Technology Stack</h2>
        <ul style={{ fontSize: '16px', color: '#555' }}>
          <li><strong>React + TypeScript:</strong> Modern, type-safe component architecture</li>
          <li><strong>TanStack Query:</strong> Efficient data caching and state management</li>
          <li><strong>Fuse.js:</strong> Intelligent fuzzy search with autocomplete</li>
          <li><strong>PokeAPI:</strong> Comprehensive Pokemon database with 1,025+ Pokemon</li>
          <li><strong>GitHub Pages:</strong> Automated deployment with CI/CD</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#fff3e0',
        padding: '30px',
        borderRadius: '15px'
      }}>
        <h2 style={{ color: '#4CAF50', marginTop: 0 }}>Data Source</h2>
        <p style={{ fontSize: '16px', color: '#555', margin: 0 }}>
          All Pokemon data is sourced from <a 
            href="https://pokeapi.co" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold' }}
          >
            PokeAPI
          </a>, the comprehensive RESTful API for Pokemon information. 
          This includes official artwork, stats, evolution chains, and detailed Pokemon data 
          covering all generations from the original 151 to the latest releases.
        </p>
      </div>

      <div style={{ 
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p>
          Built with ❤️ using React, TypeScript, and the PokeAPI
        </p>
        <p>
          🤖 Enhanced with Claude Code assistance
        </p>
      </div>
    </div>
  );
};

export default Homepage;