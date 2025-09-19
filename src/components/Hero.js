import React, { useState } from 'react';
import { useMovieContext } from '../context/MovieContext';

const Hero = () => {
  const [searchInput, setSearchInput] = useState('');
  const { actions } = useMovieContext();

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

  return (
    <section className="hero-gradient text-white py-20 pt-32">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow animate-fade-in">
            Discover Your Next Favorite Movie
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-slide-up">
            Rate, review, and explore thousands of films with fellow movie enthusiasts
          </p>
          
          <form 
            onSubmit={handleSearchSubmit} 
            className="max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex bg-white rounded-full shadow-2xl overflow-hidden border-4 border-white/20">
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                placeholder="Search for movies, actors, directors..."
                className="flex-1 px-6 py-4 text-gray-900 text-lg focus:outline-none placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-white font-semibold transition-colors duration-200 flex items-center gap-2"
                aria-label="Search movies"
              >
                <i className="fas fa-search text-lg"></i>
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>
          
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-white/80 mb-4">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Marvel', 'Comedy', 'Horror', 'Sci-Fi', 'Drama'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchInput(tag);
                    actions.searchMovies(tag);
                  }}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm hover:bg-white/30 transition-colors duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;