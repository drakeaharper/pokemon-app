import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavigationBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav style={{
      backgroundColor: '#4CAF50',
      padding: '15px 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '28px' }}>🎴</span>
          Pokemon Card App
        </Link>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? '#fff' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.2)' : 'transparent',
              transition: 'all 0.3s ease',
              fontWeight: location.pathname === '/' ? 'bold' : 'normal'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Pokemon Finder
          </Link>
          
          <Link
            to="/moves"
            style={{
              color: location.pathname === '/moves' ? '#fff' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: location.pathname === '/moves' ? 'rgba(255,255,255,0.2)' : 'transparent',
              transition: 'all 0.3s ease',
              fontWeight: location.pathname === '/moves' ? 'bold' : 'normal'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/moves') {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/moves') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Moves Database
          </Link>

          <Link
            to="/types"
            style={{
              color: location.pathname === '/types' ? '#fff' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: location.pathname === '/types' ? 'rgba(255,255,255,0.2)' : 'transparent',
              transition: 'all 0.3s ease',
              fontWeight: location.pathname === '/types' ? 'bold' : 'normal'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/types') {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/types') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Type Chart
          </Link>

          <Link
            to="/about"
            style={{
              color: location.pathname === '/about' ? '#fff' : 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: location.pathname === '/about' ? 'rgba(255,255,255,0.2)' : 'transparent',
              transition: 'all 0.3s ease',
              fontWeight: location.pathname === '/about' ? 'bold' : 'normal'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/about') {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/about') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;