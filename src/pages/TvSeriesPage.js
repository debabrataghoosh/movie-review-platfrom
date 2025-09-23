import React, { useEffect, useState, useMemo } from 'react';
import MoviesGrid from '../components/MoviesGrid';
import HorizontalScroller from '../components/HorizontalScroller';
import TvFilters from '../components/TvFilters';
import { useMovieContext } from '../context/MovieContext';

const TvSeriesPage = ({ onMovieClick, getUserRating }) => {
  const { state, actions } = useMovieContext();
  const { tvShows, topRatedTv, trendingTv, airingToday, onTheAir, loading, filters, genres } = state;
  const [localFilters, setLocalFilters] = useState({ genre: '', year: '', rating: '' });

  useEffect(() => {
    actions.clearSearch();
    actions.fetchPopularTvShows();
    actions.fetchTopRatedTv();
    actions.fetchTrendingTv();
    actions.fetchAiringToday();
    actions.fetchOnTheAir();
    // ensure genres loaded (already triggered globally but safe)
    actions.fetchGenres();
  }, []);

  // Apply local filters client-side (could be replaced with discoverTvShows call for server filtering)
  const filtered = useMemo(() => {
    return tvShows.filter(show => {
      if (localFilters.genre) {
        const g = genres.find(g => g.name.toLowerCase() === localFilters.genre.toLowerCase());
        // naive: rely on overview presence; TMDB tv show result doesn't include genre names here; skipping strict genre filter for MVP
      }
      if (localFilters.year) {
        const y = show.year || (show.releaseDate ? parseInt(show.releaseDate.slice(0,4),10) : null);
        if (String(y) !== String(localFilters.year)) return false;
      }
      if (localFilters.rating) {
        if ((show.rating * 2) < Number(localFilters.rating)) return false; // rating stored /2 vs 10
      }
      return true;
    });
  }, [tvShows, localFilters, genres]);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-white mb-10 text-center tracking-tight">TV Series</h1>
        <TvFilters onApply={setLocalFilters} />

        <HorizontalScroller
          title="This Week's Picks"
            items={trendingTv}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />
        <HorizontalScroller
          title="Popular Right Now"
          items={tvShows}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />
        <HorizontalScroller
          title="Top Rated"
          items={topRatedTv}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />
        <HorizontalScroller
          title="Airing Today"
          items={airingToday}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />
        <HorizontalScroller
          title="Currently On The Air"
          items={onTheAir}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />

        <div className="mt-16">
          <MoviesGrid
            movies={filtered}
            onMovieClick={onMovieClick}
            getUserRating={getUserRating}
            loading={loading}
            title="All Popular TV (Filtered)"
            showLoadMore={false}
          />
        </div>
      </div>
    </div>
  );
};

export default TvSeriesPage;
