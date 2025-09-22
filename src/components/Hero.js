import React, { useMemo, useState } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { getBackdropUrl } from '../services/imdbService';

const Hero = () => {
  const [searchInput, setSearchInput] = useState('');
  const { state, actions } = useMovieContext();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      actions.searchMovies(searchInput.trim());
    } else {
      actions.clearSearch();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Real-time search with debouncing
    if (value.trim()) {
      actions.searchMovies(value.trim());
    } else {
      actions.clearSearch();
      actions.fetchPopularMovies(); // Return to popular movies
    }
  };

  // Featured backdrop from first movie or fallback
  const featured = useMemo(() => state.searchQuery ? state.searchResults?.[0] : state.nowPlayingMovies?.[0] || state.movies?.[0], [state]);
  const backdrop = featured?.backdrop || featured?.poster;
  const heroBg = backdrop ? getBackdropUrl(backdrop) : 'https://placehold.co/1600x900/0b0b0b/fff?text=CineRank';

  return (
    <section className="relative text-white pt-24">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroBg}
          alt="Featured backdrop"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/1600x900/0b0b0b/fff?text=CineRank'; }}
        />
        {/* Vignette + gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 mb-4">
              <span className="text-xs uppercase tracking-widest text-white/80">Featured</span>
              <span className="w-1 h-1 rounded-full bg-white/60"></span>
              <span className="text-xs text-white/70">Now Playing</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)]">
              {featured?.title || 'Discover Your Next Favorite Movie'}
            </h1>
            {featured?.plot && (
              <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl">
                {featured.plot}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-white/80">
              {featured?.year && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <i className="far fa-calendar"></i>
                  {featured.year}
                </span>
              )}
              {featured?.genre && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <i className="fas fa-tags"></i>
                  {featured.genre}
                </span>
              )}
              {typeof featured?.rating === 'number' && (
                <span className="inline-flex items-center gap-2 text-sm">
                  <i className="fas fa-star text-yellow-400"></i>
                  {(featured.rating * 2).toFixed(1)} / 10
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors ring-1 ring-white/10">
                <i className="fas fa-play"></i>
                Play Trailer
              </button>
              <a href="#search" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors ring-1 ring-white/10">
                <i className="fas fa-search"></i>
                Explore
              </a>
            </div>
          </div>
          {/* Empty right side to let the image breathe on large screens */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Search moved to Header */}
    </section>
  );
};

export default Hero;