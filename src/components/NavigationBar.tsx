import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: '/', label: 'Pokemon Finder', shortLabel: 'Finder' },
    { path: '/moves', label: 'Moves Database', shortLabel: 'Moves' },
    { path: '/types', label: 'Type Chart', shortLabel: 'Types' },
    { path: '/abilities', label: 'Abilities', shortLabel: 'Abilities' },
    { path: '/about', label: 'About', shortLabel: 'About' },
  ];

  const renderNavLink = (item: typeof navigationItems[0], isMobile: boolean = false) => (
    <Link
      key={item.path}
      to={item.path}
      onClick={isMobile ? closeMobileMenu : undefined}
      style={{
        color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.8)',
        textDecoration: 'none',
        padding: isMobile ? '12px 20px' : '8px 16px',
        borderRadius: isMobile ? '0' : '20px',
        backgroundColor: location.pathname === item.path 
          ? (isMobile ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)') 
          : 'transparent',
        transition: 'all 0.3s ease',
        fontWeight: location.pathname === item.path ? 'bold' : 'normal',
        display: 'block',
        borderBottom: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
        fontSize: isMobile ? '16px' : '14px'
      }}
      onMouseEnter={(e) => {
        if (location.pathname !== item.path && !isMobile) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (location.pathname !== item.path && !isMobile) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {isMobile ? item.label : item.shortLabel}
    </Link>
  );

  return (
    <>
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
          {/* Logo */}
          <Link 
            to="/" 
            onClick={closeMobileMenu}
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
            <span className="pokemon-title-text">
              Pokemon Card App
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center'
          }} className="desktop-nav">
            {navigationItems.map(item => renderNavLink(item, false))}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '5px',
              transition: 'background-color 0.3s ease'
            }}
            className="mobile-menu-button"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div style={{
              width: '25px',
              height: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <span style={{
                display: 'block',
                height: '3px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                transform: isMobileMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none'
              }} />
              <span style={{
                display: 'block',
                height: '3px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                opacity: isMobileMenuOpen ? 0 : 1
              }} />
              <span style={{
                display: 'block',
                height: '3px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '1px',
                transition: 'all 0.3s ease',
                transform: isMobileMenuOpen ? 'rotate(-45deg) translate(8px, -8px)' : 'none'
              }} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        style={{
          position: 'fixed',
          top: '69px', // Height of nav bar
          left: 0,
          right: 0,
          backgroundColor: '#4CAF50',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1001,
          transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
          display: 'none'
        }}
        className="mobile-menu"
      >
        {navigationItems.map(item => renderNavLink(item, true))}
      </div>

      {/* CSS for responsive behavior */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
            .mobile-menu-button {
              display: block !important;
            }
            .mobile-menu {
              display: block !important;
            }
            .mobile-menu-overlay {
              display: block !important;
            }
          }
          
          @media (max-width: 480px) {
            .pokemon-title-text {
              display: none;
            }
          }

          .mobile-menu-button:hover {
            background-color: rgba(255,255,255,0.1);
          }
        `}
      </style>
    </>
  );
};

export default NavigationBar;