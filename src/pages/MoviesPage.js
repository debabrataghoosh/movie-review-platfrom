import React, { useEffect } from 'react';
import SearchFilters from '../components/SearchFilters';
import MoviesGrid from '../components/MoviesGrid';
import { useMovieContext } from '../context/MovieContext';

const MoviesPage = () => {
  const { state, actions } = useMovieContext();
  const { movies, loading, filters } = state;

  useEffect(() => {
    // Fetch movies based on current filters
    if (Object.values(filters).some(filter => filter !== '')) {
      const tmdbFilters = {};
      
      if (filters.genre) {
        const genre = state.genres.find(g => g.name.toLowerCase() === filters.genre.toLowerCase());
        if (genre) tmdbFilters.with_genres = genre.id;
      }
      
      if (filters.year) {
        tmdbFilters.primary_release_year = filters.year;
      }
      
      if (filters.rating) {
        tmdbFilters['vote_average.gte'] = parseFloat(filters.rating) * 2; // Convert to 10 scale
      }
      
      actions.discoverMovies(tmdbFilters);
    } else {
      actions.fetchPopularMovies();
    }
  }, [filters]);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          All Movies
        </h1>
        <SearchFilters />
        <MoviesGrid 
          movies={movies}
          loading={loading}
          title="Movies"
          showLoadMore={true}
        />
      </div>
    </div>
  );
};

export default MoviesPage;