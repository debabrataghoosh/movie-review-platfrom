import React from 'react';
import MovieCard from './MovieCard';

const MoviesGrid = ({ movies, onMovieClick, getUserRating }) => {
  if (movies.length === 0) {
    return (
      <section className="movies">
        <div className="movies-container">
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>No movies found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="movies">
      <div className="movies-container">
        <h2>Featured Movies</h2>
        <div className="movies-grid">
          {movies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              userRating={getUserRating(movie.id)}
              onClick={() => onMovieClick(movie)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoviesGrid;