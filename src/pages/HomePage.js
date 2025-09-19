import React from 'react';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import MoviesGrid from '../components/MoviesGrid';
import { useMovieContext } from '../context/MovieContext';

const HomePage = () => {
  const { state } = useMovieContext();
  const { movies, searchResults, searchQuery } = state;

  const displayMovies = searchQuery ? searchResults : movies;

  return (
    <div className="min-h-screen">
      <Hero />
      <SearchFilters />
      <MoviesGrid 
        movies={displayMovies}
        title={searchQuery ? `Search Results for "${searchQuery}"` : "Popular Movies"}
      />
    </div>
  );
};

export default HomePage;