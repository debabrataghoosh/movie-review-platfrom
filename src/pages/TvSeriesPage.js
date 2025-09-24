import React, { useEffect } from 'react';
import MoviesGrid from '../components/MoviesGrid';
import WeeklyPicks from '../components/WeeklyPicks';
import { useMovieContext } from '../context/MovieContext';

const TvSeriesPage = ({ onMovieClick, getUserRating }) => {
  const { state, actions } = useMovieContext();
  const { tvShows, topRatedTv, trendingTv, airingToday, onTheAir, loading } = state;

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

  // Filters removed per request; displaying raw tvShows list

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-white mb-10 text-center tracking-tight">TV Series</h1>
        <WeeklyPicks
          title="This Week's Picks"
          items={trendingTv}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />
        <WeeklyPicks
          title="Popular Right Now"
          items={tvShows}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />
        <WeeklyPicks
          title="Top Rated"
          items={topRatedTv}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />
        <WeeklyPicks
          title="Airing Today"
          items={airingToday}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />
        <WeeklyPicks
          title="Currently On The Air"
          items={onTheAir}
          onItemClick={onMovieClick}
          getUserRating={getUserRating}
        />

        {/* Removed 'All Popular TV' section per request */}
      </div>
    </div>
  );
};

export default TvSeriesPage;
