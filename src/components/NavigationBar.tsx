import React, { useState, useEffect } from 'react';
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  const navigationItems = [
    { path: '/', label: 'Pokemon Finder', shortLabel: 'Finder' },
    { path: '/moves', label: 'Moves Database', shortLabel: 'Moves' },
    { path: '/types', label: 'Type Chart', shortLabel: 'Types' },
    { path: '/abilities', label: 'Abilities', shortLabel: 'Abilities' },
    { path: '/items', label: 'Items Catalog', shortLabel: 'Items' },
    { path: '/berries', label: 'Berry Guide', shortLabel: 'Berries' },
    { path: '/quiz', label: 'Pokemon Quiz', shortLabel: 'Quiz' },
    { path: '/about', label: 'About', shortLabel: 'About' },
  ];

  const renderNavLink = (item: typeof navigationItems[0], isMobile: boolean = false) => {
    const isActive = location.pathname === item.path;
    const baseClasses = "no-underline transition-all duration-300 block";
    const mobileClasses = isMobile 
      ? "py-3 px-5 text-base border-b border-white/10" 
      : "py-2 px-4 text-sm rounded-full";
    const colorClasses = isActive 
      ? "text-white font-bold" 
      : "text-white/80 font-normal hover:bg-white/10";
    const bgClasses = isActive 
      ? (isMobile ? "bg-white/10" : "bg-white/20") 
      : "bg-transparent";
    
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={isMobile ? closeMobileMenu : undefined}
        className={`${baseClasses} ${mobileClasses} ${colorClasses} ${bgClasses}`}
      >
        {isMobile ? item.label : item.shortLabel}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-green-500 px-5 py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            onClick={closeMobileMenu}
            className="no-underline text-white text-2xl font-bold flex items-center gap-2"
          >
            <span className="text-3xl">🎴</span>
            <span className="pokemon-title-text">
              Pokemon Card App
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="desktop-nav flex gap-2 items-center">
            {navigationItems.map(item => renderNavLink(item, false))}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="mobile-menu-button hidden bg-transparent border-none text-white text-2xl cursor-pointer p-1 rounded transition-colors duration-300 hover:bg-white/10"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-white rounded-sm transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-x-1.5 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 w-full bg-white rounded-sm transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block h-0.5 w-full bg-white rounded-sm transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 translate-x-2 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
          onTouchStart={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`mobile-menu fixed top-16 left-0 right-0 bg-green-500 shadow-lg z-50 transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'translate-y-0 opacity-100 visible' 
            : '-translate-y-full opacity-0 invisible'
        }`}
        onClick={(e) => e.stopPropagation()}
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
          }
          
          @media (max-width: 480px) {
            .pokemon-title-text {
              display: none;
            }
          }

          @media (min-width: 769px) {
            .mobile-menu {
              display: none !important;
            }
            .mobile-menu-overlay {
              display: none !important;
            }
          }

          /* Prevent text selection on mobile menu button */
          .mobile-menu-button {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        `}
      </style>
    </>
  );
};

export default NavigationBar;