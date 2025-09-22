import React from 'react';
import Hero from '../components/Hero';
import MoviesGrid from '../components/MoviesGrid';
import { useMovieContext } from '../context/MovieContext';

const HomePage = ({ onMovieClick, getUserRating }) => {
  const { state } = useMovieContext();
  const { movies, searchResults, searchQuery } = state;

  const displayMovies = searchQuery ? searchResults : movies;

  return (
    <div className="min-h-screen">
      <Hero />
  {/* Filters moved into Header */}
      <MoviesGrid 
        movies={displayMovies}
        onMovieClick={onMovieClick}
        getUserRating={getUserRating}
        title={searchQuery ? `Search Results for "${searchQuery}"` : "Popular Movies"}
      />
    </div>
  );
};

export default HomePage;