import React, { useMemo, useEffect } from 'react';
import { SignedOut, SignInButton } from '@clerk/clerk-react';
import Hero from '../components/Hero';
import WeeklyPicks from '../components/WeeklyPicks';
import PopularCelebsSection from '../components/PopularCelebsSection';
import MoviesGrid from '../components/MoviesGrid';
import { useMovieContext } from '../context/MovieContext';

const HomePage = ({ onMovieClick, getUserRating }) => {
  const { state, actions } = useMovieContext();
  const { movies, tvShows, searchResults, searchQuery, nowPlayingMovies, airingToday, trendingAllDay, trendingAllWeek, upcomingMovies, topRatedMovies, topRatedTv, genres, popularPeople } = state;

  useEffect(() => {
    if (!popularPeople.length) actions.fetchPopularPeople();
  }, [popularPeople.length]);

  // Mixed helpers
  const popularRightNow = useMemo(() => {
    // trending all day already mixed, fallback mix of movies+tv
    const base = trendingAllDay?.length ? trendingAllDay : [...movies.slice(0,25), ...tvShows.slice(0,25)];
    return base.slice(0, 25);
  }, [trendingAllDay, movies, tvShows]);

  const trendingWeek = useMemo(() => {
    const base = trendingAllWeek?.length ? trendingAllWeek : trendingAllDay;
    return (base || []).slice(0,25);
  }, [trendingAllWeek, trendingAllDay]);

  const newReleasesMix = useMemo(() => {
    // Combine now playing movies + airing today TV
    const mv = nowPlayingMovies.slice(0,15);
    const tv = airingToday.slice(0,15);
    return [...mv, ...tv].slice(0,25);
  }, [nowPlayingMovies, airingToday]);

  const comingSoon = useMemo(() => {
    // upcoming movies + on the air (state name onTheAir) if available
    const up = upcomingMovies.slice(0,25);
    return up;
  }, [upcomingMovies]);

  const topRatedMix = useMemo(() => {
    const mv = topRatedMovies.slice(0,15);
    const tvt = topRatedTv.slice(0,15);
    return [...mv, ...tvt].slice(0,25);
  }, [topRatedMovies, topRatedTv]);

  // Simple curated (could be improved later)
  const curatedPicks = useMemo(() => {
    return movies.filter(m => m.popularity > 50 && (m.rating * 2) > 7.5).slice(0,25);
  }, [movies]);

  // Personalized placeholder (reuse pattern from MoviesPage) - based on user ratings function if passed via props
  const personalized = useMemo(() => {
    if (!movies.length) return [];
    if (typeof getUserRating !== 'function') return [];
    const rated = movies.filter(m => (getUserRating(m.id) || 0) > 0);
    const sorted = rated.sort((a,b) => (getUserRating(b.id) || 0) - (getUserRating(a.id) || 0));
    return (sorted.length ? sorted : movies).slice(0,25);
  }, [movies, getUserRating]);

  // Hidden Gems: moderate rating band and lower popularity
  const hiddenGems = useMemo(() => {
    return movies.filter(m => {
      const avg10 = m.rating * 2;
      return avg10 >= 6.5 && avg10 <= 7.5 && m.popularity < 30;
    }).slice(0,25);
  }, [movies]);

  // Genre Rows (Action, Comedy, Sci-Fi, Horror, Romance, Animation)
  const genreMap = useMemo(() => {
    const byName = {};
    genres.forEach(g => { byName[g.name.toLowerCase()] = g.id; });
    return byName;
  }, [genres]);

  const genreRows = useMemo(() => {
    const targets = ['action', 'comedy', 'science fiction', 'horror', 'romance', 'animation'];
    return targets.map(name => {
      const id = genreMap[name];
      if (!id) return { title: name, items: [] };
      const items = movies.filter(m => m.genreIds && m.genreIds.includes(id)).slice(0,25);
      return { title: name.replace(/\b\w/g, c => c.toUpperCase()), items };
    }).filter(r => r.items.length);
  }, [genreMap, movies]);

  const displayMovies = searchQuery ? searchResults : movies;

  return (
    <div className="min-h-screen">
      <Hero />
      {/* Quick access Sign In for signed-out users */}
      <div className="container mx-auto px-4 pt-4">
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm ring-1 ring-white/10">Sign In</button>
          </SignInButton>
        </SignedOut>
      </div>
      <div className="container mx-auto px-4 py-10">
        {/* First Fold */}
        {popularRightNow.length > 0 && (
          <WeeklyPicks title="Popular Right Now" items={popularRightNow} onItemClick={onMovieClick} getUserRating={getUserRating} />
        )}
        {popularPeople.length > 0 && <PopularCelebsSection people={popularPeople} />}
        {trendingWeek.length > 0 && (
          <WeeklyPicks title="Trending This Week" items={trendingWeek} onItemClick={onMovieClick} getUserRating={getUserRating} />
        )}
        {newReleasesMix.length > 0 && (
          <WeeklyPicks title="New Releases" items={newReleasesMix} onItemClick={onMovieClick} getUserRating={getUserRating} />
        )}

        {/* Second Fold */}
        {comingSoon.length > 0 && (
          <WeeklyPicks title="Coming Soon" items={comingSoon} onItemClick={onMovieClick} getUserRating={getUserRating} />
        )}
        {topRatedMix.length > 0 && (
          <WeeklyPicks title="Top Rated" items={topRatedMix} onItemClick={onMovieClick} getUserRating={getUserRating} />
        )}

        {/* Genre Rows */}
        {genreRows.map(r => (
          <WeeklyPicks key={r.title} title={r.title} items={r.items} onItemClick={onMovieClick} getUserRating={getUserRating} />
        ))}

        {/* Curated / Personalized / Hidden Gems */}
        {curatedPicks.length > 0 && (
          <WeeklyPicks title="Curated Picks" items={curatedPicks} onItemClick={onMovieClick} getUserRating={getUserRating} />
        )}
        {personalized.length > 0 && (
          <WeeklyPicks title="Because You Watched" items={personalized} onItemClick={onMovieClick} getUserRating={getUserRating} />
        )}
        {hiddenGems.length > 0 && (
          <WeeklyPicks title="Hidden Gems" items={hiddenGems} onItemClick={onMovieClick} getUserRating={getUserRating} />
        )}

        {/* Fallback full grid for exploration */}
        <div className="mt-16">
          <MoviesGrid
            movies={displayMovies}
            onMovieClick={onMovieClick}
            getUserRating={getUserRating}
            title={searchQuery ? `Search Results for "${searchQuery}"` : "All Popular Movies"}
            showLoadMore={false}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;