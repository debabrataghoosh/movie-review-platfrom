import React, { useEffect, useMemo, useState } from 'react';
import MoviesGrid from '../components/MoviesGrid';
import WeeklyPicks from '../components/WeeklyPicks';
import MultiGenreFilter from '../components/MultiGenreFilter';
import { useMovieContext } from '../context/MovieContext';

const MoviesPage = ({ onMovieClick, getUserRating }) => {
  const { state, actions } = useMovieContext();
  const { movies, topRatedMovies, nowPlayingMovies, trendingMovies, upcomingMovies, loading, genres, currentPage, totalPages, filters } = state;

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
    // Curated sections
    if (!topRatedMovies.length) actions.fetchTopRatedMovies();
    if (!nowPlayingMovies.length) actions.fetchNowPlayingMovies();
    if (!trendingMovies.length) actions.fetchTrendingMovies();
    if (!upcomingMovies.length) actions.fetchUpcomingMovies();
    // Full catalog (Discover) - initial page
    if (!movies.length) actions.discoverMovies({}, 1, false);
  }, [topRatedMovies.length, nowPlayingMovies.length, trendingMovies.length, upcomingMovies.length]);

  const loadMore = () => {
    if (loading) return;
    if (currentPage < totalPages) {
      actions.discoverMovies(filters || {}, currentPage + 1, true);
    }
  };

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
        {/* Full Catalog (All Movies) */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-4">All Movies (TMDB Catalog)</h2>
          <MoviesGrid
            title="All Movies"
            movies={movies}
            onMovieClick={onMovieClick}
            getUserRating={getUserRating}
          />
          {currentPage < totalPages && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm ring-1 ring-white/10 disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </div>
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