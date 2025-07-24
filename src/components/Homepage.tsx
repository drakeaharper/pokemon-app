import React from 'react';
import { Link } from 'react-router-dom';

const Homepage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Pokemon Card App</h1>
      <Link to="/pokemon">
        <button style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Go to Pokemon Finder
        </button>
      </Link>
    </div>
  );
};

export default Homepage;