import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import PokemonDetails from './components/PokemonDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/pokemon" element={<PokemonDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
