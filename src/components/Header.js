import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMovieContext } from '../context/MovieContext';
import FilterPopover from './FilterPopover';

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
          {/* Brand (text only, no logo) */}
          <Link
            to="/"
            aria-label="CineRank Home"
            className="text-white font-extrabold text-xl md:text-2xl tracking-tight select-none hover:text-white/90"
          >
            CineRank
          </Link>

          {/* Search + Filters (desktop) */}
          <form onSubmit={handleSearchSubmit} className="flex-1 hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-3xl">
              <div className="group flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full ring-1 ring-white/15 px-3.5 py-1 h-10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <i className="fas fa-search text-white/60"></i>
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search movies, actors, directors..."
                  className="flex-1 bg-transparent text-white placeholder-white/60 focus:outline-none text-sm leading-none"
                  aria-label="Search movies"
                />
                <button
                  type="button"
                  onClick={() => setFiltersOpen(v=>!v)}
                  className="ml-1 px-3 h-7 rounded-full bg-white/5 hover:bg-white/15 text-xs font-medium text-white/80 flex items-center gap-1 transition"
                  aria-haspopup="true"
                  aria-expanded={filtersOpen}
                  aria-label="Toggle advanced filters"
                >
                  <i className="fas fa-sliders-h text-[11px]"></i>
                  Filters
                </button>
                {filtersOpen && (
                  <div className="absolute left-0 top-full mt-2 origin-top-left z-50">
                    <div className="relative bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 ring-1 ring-white/10 w-max animate-slideDown" onClick={e=>e.stopPropagation()}>
                      <FilterPopover onClose={()=>setFiltersOpen(false)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/movies"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/movies') ? 'text-red-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              Movies
            </Link>
            <Link
              to="/tv"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/tv') ? 'text-red-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              TV Series
            </Link>
            <Link
              to="/new"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/new') ? 'text-red-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              New
            </Link>
            <Link
              to="/top-rated"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/top-rated') ? 'text-red-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              Top Rated
            </Link>
            <Link
              to="/people"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/people') ? 'text-red-400 bg-white/5 ring-1 ring-white/10' : 'text-gray-200 hover:text-white/90 hover:bg-white/5 hover:ring-1 hover:ring-white/10'}`}
            >
              People
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
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-3.5 py-1 h-10 ring-1 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <i className="fas fa-search text-white/70"></i>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search movies..."
                className="flex-1 bg-transparent outline-none text-sm leading-none text-white placeholder-white/60"
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