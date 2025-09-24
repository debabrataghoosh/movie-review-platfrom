import React, { useEffect, useMemo, useState } from 'react';
import MoviesGrid from '../components/MoviesGrid';
import WeeklyPicks from '../components/WeeklyPicks';
import MultiGenreFilter from '../components/MultiGenreFilter';
import { useMovieContext } from '../context/MovieContext';

const MoviesPage = ({ onMovieClick, getUserRating }) => {
  const { state, actions } = useMovieContext();
  const { movies, topRatedMovies, nowPlayingMovies, trendingMovies, upcomingMovies, loading, genres } = state;

  // Local state for multi-genre selection
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Personalized picks based on user ratings (fallback to random popular if no ratings)
  const personalized = useMemo(() => {
    if (!movies.length) return [];
    const rated = movies.filter(m => (typeof getUserRating === 'function' ? (getUserRating(m.id) || 0) : 0) > 0);
    const sorted = rated.sort((a,b) => (getUserRating(b.id) || 0) - (getUserRating(a.id) || 0));
    const base = (sorted.length ? sorted : [...movies].sort(() => 0.5 - Math.random()));
    return base.slice(0, 25);
  }, [movies, getUserRating]);

  useEffect(() => {
    // Popular movies fetched in provider on app start.
    if (!topRatedMovies.length) actions.fetchTopRatedMovies();
    if (!nowPlayingMovies.length) actions.fetchNowPlayingMovies();
    if (!trendingMovies.length) actions.fetchTrendingMovies();
    if (!upcomingMovies.length) actions.fetchUpcomingMovies();
  }, [topRatedMovies.length, nowPlayingMovies.length, trendingMovies.length, upcomingMovies.length]);

  // Filter movies for genre section
  const genreFilteredMovies = useMemo(() => {
    if (!movies?.length) return [];
    if (!selectedGenres.length) return movies.slice(0, 50); // default sample when nothing selected
    return movies.filter(m => m.genreIds && m.genreIds.some(id => selectedGenres.includes(id)));
  }, [movies, selectedGenres]);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-10 text-center tracking-tight">Movies</h1>

        {trendingMovies?.length > 0 && (
          <WeeklyPicks
            title="Trending"
            items={trendingMovies}
            onItemClick={onMovieClick}
            getUserRating={getUserRating}
          />
        )}
        {nowPlayingMovies?.length > 0 && (
          <WeeklyPicks
            title="New Releases"
            items={nowPlayingMovies}
            onItemClick={onMovieClick}
            getUserRating={getUserRating}
          />
        )}
        {upcomingMovies?.length > 0 && (
          <WeeklyPicks
            title="Upcoming"
            items={upcomingMovies}
            onItemClick={onMovieClick}
            getUserRating={getUserRating}
          />
        )}
        {topRatedMovies?.length > 0 && (
          <WeeklyPicks
            title="Top Rated"
            items={topRatedMovies}
            onItemClick={onMovieClick}
            getUserRating={getUserRating}
          />
        )}
        {/* Genres Section with Multi-Select Filter */}
        {movies?.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Genres</h2>
            </div>
            <MultiGenreFilter
              genres={genres}
              selected={selectedGenres}
              onChange={setSelectedGenres}
            />
            {genreFilteredMovies.length > 0 ? (
              <WeeklyPicks
                title={selectedGenres.length ? 'Filtered Results' : 'Popular Mix'}
                items={genreFilteredMovies}
                onItemClick={onMovieClick}
                getUserRating={getUserRating}
              />
            ) : (
              <p className="text-sm text-white/60 italic">No movies match the selected genres.</p>
            )}
          </div>
        )}
        {personalized?.length > 0 && (
          <WeeklyPicks
            title="Personalized"
            items={personalized}
            onItemClick={onMovieClick}
            getUserRating={getUserRating}
          />
        )}

        {/* Removed 'All Popular Movies' section per request */}
      </div>
    </div>
  );
};

export default MoviesPage;