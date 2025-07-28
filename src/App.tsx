import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkModeProvider } from './contexts/DarkModeContext';
import NavigationBar from './components/NavigationBar';
import Homepage from './components/Homepage';
import PokemonDetails from './components/PokemonDetails';
import MovesDatabase from './components/MovesDatabase';
import TypeChart from './components/TypeChart';
import AbilityGlossary from './components/AbilityGlossary';
import ItemsCatalog from './components/ItemsCatalog';
import PokemonQuiz from './components/PokemonQuiz';
import BerriesGuide from './components/BerriesGuide';
import PokemonDetailPage from './components/PokemonDetailPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <NavigationBar />
            <Routes>
              <Route path="/" element={<PokemonDetails />} />
              <Route path="/:pokemonId" element={<PokemonDetails />} />
              <Route path="/:pokemonId/details" element={<PokemonDetailPage />} />
              <Route path="/about" element={<Homepage />} />
              <Route path="/moves" element={<MovesDatabase />} />
              <Route path="/types" element={<TypeChart />} />
              <Route path="/abilities" element={<AbilityGlossary />} />
              <Route path="/abilities/:abilityName" element={<AbilityGlossary />} />
              <Route path="/items" element={<ItemsCatalog />} />
              <Route path="/berries" element={<BerriesGuide />} />
              <Route path="/quiz" element={<PokemonQuiz />} />
            </Routes>
          </div>
        </Router>
      </DarkModeProvider>
    </QueryClientProvider>
  );
}

export default App;
