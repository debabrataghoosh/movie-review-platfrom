import React, { useEffect } from 'react';
import MoviesGrid from '../components/MoviesGrid';
import { useMovieContext } from '../context/MovieContext';

const NewReleasesPage = ({ onMovieClick, getUserRating }) => {
  const { state, actions } = useMovieContext();
  const { nowPlayingMovies, loading } = state;

  useEffect(() => {
    actions.fetchNowPlayingMovies();
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">New & Now Playing</h1>
        <MoviesGrid 
          movies={nowPlayingMovies}
          onMovieClick={onMovieClick}
          getUserRating={getUserRating}
          loading={loading}
          title="New"
          showLoadMore={false}
        />
      </div>
    </div>
  );
};

export default NewReleasesPage;
