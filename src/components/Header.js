import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMovieContext } from '../context/MovieContext';

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { state, actions } = useMovieContext();
  const { genres, filters, searchQuery } = state;
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => Array.from({ length: 30 }, (_, i) => currentYear - i), [currentYear]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      actions.searchMovies(q);
    } else {
      actions.clearSearch();
      actions.fetchPopularMovies();
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (!val.trim()) {
      actions.clearSearch();
      actions.fetchPopularMovies();
    }
  };

  const applyFilterChange = (type, value) => {
    const next = { ...filters, [type]: value };
    actions.setFilters(next);
    actions.discoverMovies(next);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/70 backdrop-blur-md shadow-lg border-b border-white/10' : 'bg-transparent backdrop-blur-0'}`}
    >
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <i className="fas fa-film text-2xl text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]"></i>
            <span className="text-xl font-bold text-white tracking-wide">CineRank</span>
          </Link>

          {/* Search + Filters (desktop) */}
          <form onSubmit={handleSearchSubmit} className="flex-1 hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="group flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full ring-1 ring-white/10 px-3.5 py-1.5">
                <i className="fas fa-search text-white/60"></i>
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search movies, actors, directors..."
                  className="flex-1 bg-transparent text-white placeholder-white/50 focus:outline-none py-0 text-sm md:text-base"
                  aria-label="Search movies"
                />
                {/* Filters icon only; hidden until input is focused */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((v) => !v)}
                    className="opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                    aria-haspopup="true"
                    aria-expanded={filtersOpen}
                    aria-label="Open filters"
                  >
                    <i className="fas fa-sliders-h"></i>
                  </button>
                  {filtersOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-4 z-50">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col">
                          <label htmlFor="hdr-genre" className="text-xs text-white/70 mb-1">Genre</label>
                          <select
                            id="hdr-genre"
                            value={filters.genre || ''}
                            onChange={(e) => applyFilterChange('genre', e.target.value)}
                            className="px-3 py-2 bg-white/5 text-white rounded-lg ring-1 ring-white/10"
                          >
                            <option value="">All Genres</option>
                            {genres.map((g) => (
                              <option key={g.id} value={g.name.toLowerCase()}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="hdr-year" className="text-xs text-white/70 mb-1">Year</label>
                          <select
                            id="hdr-year"
                            value={filters.year || ''}
                            onChange={(e) => applyFilterChange('year', e.target.value)}
                            className="px-3 py-2 bg-white/5 text-white rounded-lg ring-1 ring-white/10"
                          >
                            <option value="">All Years</option>
                            {years.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="hdr-rating" className="text-xs text-white/70 mb-1">Min Rating</label>
                          <select
                            id="hdr-rating"
                            value={filters.rating || ''}
                            onChange={(e) => applyFilterChange('rating', e.target.value)}
                            className="px-3 py-2 bg-white/5 text-white rounded-lg ring-1 ring-white/10"
                          >
                            <option value="">Any Rating</option>
                            <option value="4">4+ Stars</option>
                            <option value="3">3+ Stars</option>
                            <option value="2">2+ Stars</option>
                            <option value="1">1+ Stars</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/movies') ? 'text-blue-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              Movies
            </Link>
            <Link
              to="/top-rated"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/top-rated') ? 'text-blue-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              Top Rated
            </Link>
            <Link
              to="/reviews"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/reviews') ? 'text-blue-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              Reviews
            </Link>
          </div>

          {/* Mobile search toggle */}
          <button
            className="md:hidden p-2 rounded text-white/80 hover:text-white hover:bg-white/10"
            aria-label="Toggle search"
            onClick={() => setShowMobileSearch((s) => !s)}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      </nav>

      {/* Mobile search with filters */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-4">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3.5 py-1.5 ring-1 ring-white/15">
              <i className="fas fa-search text-white/70"></i>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search movies..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/60"
              />
              {/* submit via keyboard; no visible button */}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={filters.genre || ''}
                onChange={(e) => applyFilterChange('genre', e.target.value)}
                className="px-3 py-2 bg-white/5 text-white rounded-lg ring-1 ring-white/10"
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.name.toLowerCase()}>{g.name}</option>
                ))}
              </select>
              <select
                value={filters.year || ''}
                onChange={(e) => applyFilterChange('year', e.target.value)}
                className="px-3 py-2 bg-white/5 text-white rounded-lg ring-1 ring-white/10"
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                value={filters.rating || ''}
                onChange={(e) => applyFilterChange('rating', e.target.value)}
                className="px-3 py-2 bg-white/5 text-white rounded-lg ring-1 ring-white/10"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;