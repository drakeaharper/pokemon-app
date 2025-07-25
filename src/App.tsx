import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavigationBar from './components/NavigationBar';
import Homepage from './components/Homepage';
import PokemonDetails from './components/PokemonDetails';
import MovesDatabase from './components/MovesDatabase';
import TypeChart from './components/TypeChart';
import AbilityGlossary from './components/AbilityGlossary';
import ItemsCatalog from './components/ItemsCatalog';
import PokemonQuiz from './components/PokemonQuiz';
import BerriesGuide from './components/BerriesGuide';
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
      <Router>
        <div className="App">
          <NavigationBar />
          <Routes>
            <Route path="/" element={<PokemonDetails />} />
            <Route path="/about" element={<Homepage />} />
            <Route path="/moves" element={<MovesDatabase />} />
            <Route path="/types" element={<TypeChart />} />
            <Route path="/abilities" element={<AbilityGlossary />} />
            <Route path="/items" element={<ItemsCatalog />} />
            <Route path="/berries" element={<BerriesGuide />} />
            <Route path="/quiz" element={<PokemonQuiz />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
