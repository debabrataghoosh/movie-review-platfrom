import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMovieContext } from '../context/MovieContext';
import FilterPopover from './FilterPopover';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { state, actions } = useMovieContext();
  const { genres, filters, searchQuery } = state;
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const { user } = useAuth();

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const desktopComboRef = useRef(null);
  const mobileComboRef = useRef(null);

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
      // If a suggestion is highlighted, go to it; else perform full search
      const sel = highlightIndex >= 0 ? suggestions[highlightIndex] : null;
      if (sel) {
        navigate(sel.href);
        setSuggestions([]);
        setSuggestionsOpen(false);
      } else {
        actions.searchMovies(q);
      }
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
    // open suggestions if there's input
    setSuggestionsOpen(!!val.trim());
    setHighlightIndex(-1);
  };

  const applyFilterChange = (type, value) => {
    const next = { ...filters, [type]: value };
    actions.setFilters(next);
    actions.discoverMovies(next);
  };

  // Debounced multi-search for suggestions
  useEffect(() => {
    const q = searchInput.trim();
    if (!q) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSuggestLoading(false);
      return;
    }
    let cancelled = false;
    setSuggestLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await movieService.multiSearch(q, 1);
        if (cancelled) return;
        const top = (res.results || [])
          .filter(r => r.media_type === 'movie' || r.media_type === 'tv' || r.media_type === 'person')
          .slice(0, 8)
          .map(r => {
            const media = r.media_type;
            const title = r.title || r.name || 'Untitled';
            const subtitle = media === 'person' ? (r.known_for_department || 'Person') : (r.release_date || r.first_air_date || '').slice(0,4);
            const img = r.profile_path || r.poster_path ? `https://image.tmdb.org/t/p/w92${r.profile_path || r.poster_path}` : '';
            const href = media === 'person' ? `/person/${r.id}` : `/title/${r.id}`;
            return { id: String(r.id), media, title, subtitle, img, href };
          });
        setSuggestions(top);
        setSuggestionsOpen(top.length > 0);
      } catch (e) {
        if (!cancelled) {
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(id); };
  }, [searchInput]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      const d = desktopComboRef.current;
      const m = mobileComboRef.current;
      const inDesktop = d && d.contains(e.target);
      const inMobile = m && m.contains(e.target);
      if (!inDesktop && !inMobile) {
        setSuggestionsOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close suggestions when route changes
  useEffect(() => {
    setSuggestionsOpen(false);
    setHighlightIndex(-1);
  }, [location.pathname]);

  const onKeyDown = (e) => {
    if (!suggestionsOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      const sel = highlightIndex >= 0 ? suggestions[highlightIndex] : null;
      if (sel) {
        e.preventDefault();
        navigate(sel.href);
        setSuggestionsOpen(false);
        setSuggestions([]);
      }
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/70 backdrop-blur-md shadow-lg border-b border-white/10' : 'bg-transparent backdrop-blur-0'}`}
    >
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 gap-4">
          {/* Brand (text + logo) */}
          <Link
            to="/"
            aria-label="CineRank Home"
            className="flex items-center gap-2 text-white font-extrabold text-xl md:text-2xl tracking-tight select-none hover:text-white/90"
          >
            <img
              src="/favicon.png"
              alt="CineRank logo"
              className="h-7 w-7 rounded-lg shadow-sm ring-1 ring-white/10"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span>CineRank</span>
          </Link>

          {/* Search + Filters (desktop) */}
          <form onSubmit={handleSearchSubmit} className="flex-1 hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-3xl" ref={desktopComboRef}>
              <div className="group flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full ring-1 ring-white/15 px-3.5 py-1 h-10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]" role="combobox" aria-expanded={suggestionsOpen} aria-haspopup="listbox" aria-owns="header-suggestions">
                <i className="fas fa-search text-white/60"></i>
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyDown={onKeyDown}
                  placeholder="Search movies, TV shows, people..."
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
              {suggestionsOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50">
                  <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    {suggestions.length === 0 && (
                      <div className="px-4 py-3 text-sm text-white/70">{suggestLoading ? 'Searching…' : 'No results'}</div>
                    )}
                    {suggestions.length > 0 && (
                      <ul id="header-suggestions" role="listbox" aria-label="Search suggestions" className="max-h-96 overflow-auto divide-y divide-white/5">
                        {suggestions.map((s, idx) => (
                          <li key={`${s.media}-${s.id}`} role="option" aria-selected={idx===highlightIndex}>
                            <button
                              type="button"
                              onMouseEnter={() => setHighlightIndex(idx)}
                              onClick={() => { navigate(s.href); setSuggestionsOpen(false); setSuggestions([]); }}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition ${idx===highlightIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                              <div className="w-9 h-9 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                                {s.img ? (
                                  <img src={s.img} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <i className="fas fa-film text-white/60 text-sm" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">{s.title}</div>
                                <div className="text-xs text-white/60 capitalize truncate flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1">
                                    {s.media === 'person' ? <i className="fas fa-user" /> : (s.media === 'tv' ? <i className="fas fa-tv" /> : <i className="fas fa-film" />)}
                                    {s.media}
                                  </span>
                                  {s.subtitle && <span>• {s.subtitle}</span>}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
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
            {/* Account via Clerk */}
            <SignedIn>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/80">Hi, {user?.name}</span>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{ elements: { userButtonAvatarBox: 'ring-1 ring-white/20' } }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Wishlist"
                      href="/wishlist"
                      labelIcon={<i className="fas fa-heart text-red-400" aria-hidden="true" />}
                    />
                    <UserButton.Link
                      label="Reviews"
                      href="/reviews"
                      labelIcon={<i className="fas fa-star text-yellow-400" aria-hidden="true" />}
                    />
                    {/* Keep default Clerk items in desired order */}
                    <UserButton.Action label="manageAccount" />
                    <UserButton.Action label="signOut" />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 rounded-md text-xs bg-white/5 hover:bg-white/10 text-white/80">Sign in</button>
              </SignInButton>
            </SignedOut>
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
            <div className="relative flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-full px-3.5 py-1 h-10 ring-1 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)]" ref={mobileComboRef} role="combobox" aria-expanded={suggestionsOpen} aria-haspopup="listbox" aria-owns="header-suggestions-mobile">
              <i className="fas fa-search text-white/70"></i>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                onKeyDown={onKeyDown}
                placeholder="Search movies, TV, people..."
                className="flex-1 bg-transparent outline-none text-sm leading-none text-white placeholder-white/60"
              />
              {/* submit via keyboard; no visible button */}
              {suggestionsOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50">
                  <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
                    {suggestions.length === 0 && (
                      <div className="px-4 py-3 text-sm text-white/70">{suggestLoading ? 'Searching…' : 'No results'}</div>
                    )}
                    {suggestions.length > 0 && (
                      <ul id="header-suggestions-mobile" role="listbox" aria-label="Search suggestions" className="max-h-96 overflow-auto divide-y divide-white/5">
                        {suggestions.map((s, idx) => (
                          <li key={`${s.media}-${s.id}`} role="option" aria-selected={idx===highlightIndex}>
                            <button
                              type="button"
                              onMouseEnter={() => setHighlightIndex(idx)}
                              onClick={() => { navigate(s.href); setSuggestionsOpen(false); setSuggestions([]); setShowMobileSearch(false); }}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition ${idx===highlightIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                              <div className="w-9 h-9 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                                {s.img ? (
                                  <img src={s.img} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <i className="fas fa-film text-white/60 text-sm" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">{s.title}</div>
                                <div className="text-xs text-white/60 capitalize truncate flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1">
                                    {s.media === 'person' ? <i className="fas fa-user" /> : (s.media === 'tv' ? <i className="fas fa-tv" /> : <i className="fas fa-film" />)}
                                    {s.media}
                                  </span>
                                  {s.subtitle && <span>• {s.subtitle}</span>}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
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
            <div className="flex items-center gap-2">
              <SignedIn>
                <UserButton afterSignOutUrl="/">
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Wishlist"
                      href="/wishlist"
                      labelIcon={<i className="fas fa-heart text-red-400" aria-hidden="true" />}
                    />
                    <UserButton.Link
                      label="Reviews"
                      href="/reviews"
                      labelIcon={<i className="fas fa-star text-yellow-400" aria-hidden="true" />}
                    />
                    <UserButton.Action label="manageAccount" />
                    <UserButton.Action label="signOut" />
                  </UserButton.MenuItems>
                </UserButton>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button type="button" className="px-3 py-2 rounded-lg bg-white/5 text-white text-sm">Sign in</button>
                </SignInButton>
              </SignedOut>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;