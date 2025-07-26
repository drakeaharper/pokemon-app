import React from 'react';

const Homepage: React.FC = () => {
  return (
    <div className="px-5 py-10 max-w-4xl mx-auto">
      <h1 className="text-center mb-8 text-4xl font-bold text-gray-800 dark:text-white">
        About Pokemon Card App
      </h1>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl mb-8 transition-colors duration-200">
        <h2 className="text-green-500 dark:text-green-400 text-2xl font-bold mb-4">Features</h2>
        <ul className="text-gray-700 dark:text-gray-300 space-y-2">
          <li><strong className="text-gray-900 dark:text-gray-100">Smart Search:</strong> Find Pokemon by number or name with fuzzy matching and autocomplete</li>
          <li><strong className="text-gray-900 dark:text-gray-100">Evolution Chains:</strong> Interactive evolution trees with clickable Pokemon cards</li>
          <li><strong className="text-gray-900 dark:text-gray-100">Navigation:</strong> Browse Pokemon sequentially with left/right arrows</li>
          <li><strong className="text-gray-900 dark:text-gray-100">Rich Data:</strong> View stats, types, height, weight, and official artwork</li>
          <li><strong className="text-gray-900 dark:text-gray-100">Performance:</strong> Lightning-fast searches with intelligent caching</li>
        </ul>
      </div>

      <div className="bg-green-50 dark:bg-gray-800 p-8 rounded-2xl mb-8 transition-colors duration-200">
        <h2 className="text-green-500 dark:text-green-400 text-2xl font-bold mb-4">Technology Stack</h2>
        <ul className="text-gray-700 dark:text-gray-300 space-y-2">
          <li><strong className="text-gray-900 dark:text-gray-100">React + TypeScript:</strong> Modern, type-safe component architecture</li>
          <li><strong className="text-gray-900 dark:text-gray-100">TanStack Query:</strong> Efficient data caching and state management</li>
          <li><strong className="text-gray-900 dark:text-gray-100">Fuse.js:</strong> Intelligent fuzzy search with autocomplete</li>
          <li><strong className="text-gray-900 dark:text-gray-100">PokeAPI:</strong> Comprehensive Pokemon database with 1,025+ Pokemon</li>
          <li><strong className="text-gray-900 dark:text-gray-100">GitHub Pages:</strong> Automated deployment with CI/CD</li>
        </ul>
      </div>

      <div className="bg-orange-50 dark:bg-gray-800 p-8 rounded-2xl mb-8 transition-colors duration-200">
        <h2 className="text-green-500 dark:text-green-400 text-2xl font-bold mb-4">Data Source</h2>
        <p className="text-gray-700 dark:text-gray-300">
          All Pokemon data is sourced from <a 
            href="https://pokeapi.co" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-500 dark:text-green-400 font-bold hover:underline"
          >
            PokeAPI
          </a>, the comprehensive RESTful API for Pokemon information. 
          This includes official artwork, stats, evolution chains, and detailed Pokemon data 
          covering all generations from the original 151 to the latest releases.
        </p>
      </div>

      <div className="text-center mt-10 text-sm text-gray-600 dark:text-gray-400">
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