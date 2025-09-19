import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black shadow-lg border-b border-gray-700 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <i className="fas fa-film text-2xl text-blue-600"></i>
            <span className="text-xl font-bold text-white">
              MovieHub
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-400 bg-blue-900/20'
                  : 'text-gray-300 hover:text-blue-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/movies')
                  ? 'text-blue-400 bg-blue-900/20'
                  : 'text-gray-300 hover:text-blue-400'
              }`}
            >
              Movies
            </Link>
            <Link
              to="/top-rated"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/top-rated')
                  ? 'text-blue-400 bg-blue-900/20'
                  : 'text-gray-300 hover:text-blue-400'
              }`}
            >
              Top Rated
            </Link>
            <Link
              to="/reviews"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/reviews')
                  ? 'text-blue-400 bg-blue-900/20'
                  : 'text-gray-300 hover:text-blue-400'
              }`}
            >
              Reviews
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;