import React, { useEffect } from 'react';
import MoviesGrid from '../components/MoviesGrid';
import { useMovieContext } from '../context/MovieContext';

const TopRatedPage = ({ onMovieClick, getUserRating }) => {
  const { state, actions } = useMovieContext();
  const { topRatedMovies, loading } = state;

  useEffect(() => {
    if (topRatedMovies.length === 0) {
      actions.fetchTopRatedMovies();
    }
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Top Rated Movies
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover the highest-rated movies of all time
          </p>
        </div>
        
        <MoviesGrid 
          movies={topRatedMovies}
          onMovieClick={onMovieClick}
          getUserRating={getUserRating}
          loading={loading}
          title="Top Rated Movies"
        />
      </div>
    </div>
  );
};

export default TopRatedPage;