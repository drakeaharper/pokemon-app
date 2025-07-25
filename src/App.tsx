import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavigationBar from './components/NavigationBar';
import Homepage from './components/Homepage';
import PokemonDetails from './components/PokemonDetails';
import MovesDatabase from './components/MovesDatabase';
import TypeChart from './components/TypeChart';
import AbilityGlossary from './components/AbilityGlossary';
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
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
