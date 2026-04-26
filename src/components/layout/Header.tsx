/**
 * Header component - Top navigation bar
 * Contains logo, search bar, and main navigation
 */

import { Link, useLocation } from 'react-router-dom';
import { SearchBar } from '../common/SearchBar';

export interface HeaderProps {
  onSearch?: (term: string) => void;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header = ({ onSearch, onMenuToggle, isMobileMenuOpen = false }: HeaderProps) => {
  const location = useLocation();

  const handleSearch = (term: string) => {
    onSearch?.(term);
  };

  // Helper function to determine if a link is active
  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation link component
  const NavLink = ({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) => {
    const isActive = isActiveLink(to);
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeClasses = "bg-green-100 text-green-900";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    
    return (
      <Link
        to={to}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-green-600">Snooker</span>
                  <span className="text-gray-800">Results</span>
                </h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/players">Players</NavLink>
              <NavLink to="/events">Events</NavLink>
              <NavLink to="/results">Results</NavLink>
              <NavLink to="/rankings">Rankings</NavLink>
              <NavLink to="/upcoming">Upcoming</NavLink>
              <NavLink to="/head-to-head">H2H</NavLink>
              <NavLink to="/historical">Historical</NavLink>
            </div>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search players, events..."
            />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={onMenuToggle}
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 transition-colors"
              aria-expanded="false"
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            {/* Mobile Search */}
            <div className="mb-4">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search players, events..."
              />
            </div>
            
            {/* Mobile Navigation Links */}
            <NavLink to="/" className="block text-base">Home</NavLink>
            <NavLink to="/players" className="block text-base">Players</NavLink>
            <NavLink to="/events" className="block text-base">Events</NavLink>
            <NavLink to="/results" className="block text-base">Results</NavLink>
            <NavLink to="/rankings" className="block text-base">Rankings</NavLink>
            <NavLink to="/upcoming" className="block text-base">Upcoming Matches</NavLink>
            <NavLink to="/head-to-head" className="block text-base">Head to Head</NavLink>
            <NavLink to="/historical" className="block text-base">Historical</NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};
