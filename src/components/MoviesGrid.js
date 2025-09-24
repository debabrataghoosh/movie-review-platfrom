import React from 'react';
import MovieCard from './MovieCard';

const MoviesGrid = ({ movies, onMovieClick, getUserRating, title = 'Featured Movies' }) => {
  if (movies.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <i className="fas fa-search text-6xl text-gray-500 mb-6"></i>
            <h3 className="text-2xl font-semibold text-white mb-4">No movies found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or filters</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <h2 className="text-3xl font-bold text-white mb-8 text-center">{title}</h2>
        <div className="grid grid-cols-5 gap-6">
          {movies.map(movie => (
            <MovieCard
              key={movie.id || movie.tmdbId}
              movie={movie}
              userRating={getUserRating ? getUserRating(movie.id) : 0}
              onClick={() => onMovieClick(movie)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoviesGrid;