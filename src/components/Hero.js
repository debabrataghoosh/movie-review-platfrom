import React, { useEffect, useMemo, useState } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { getBestTmdbBackdrop } from '../services/tmdbService';
import LiquidButton from './LiquidButton';
import TrailerModal from './TrailerModal';
import { movieService } from '../services/movieService';

const Hero = () => {
  const { state } = useMovieContext();

  const featuredList = useMemo(() => {
    const source = state.searchQuery
      ? state.searchResults
      : (state.nowPlayingMovies?.length ? state.nowPlayingMovies : state.movies);
    return (source || []).slice(0, 6);
  }, [state]);

  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => { if (activeIndex >= featuredList.length) setActiveIndex(0); }, [featuredList.length, activeIndex]);
  useEffect(() => {
    if (featuredList.length <= 1) return; const id = setInterval(() => setActiveIndex(i => (i + 1) % featuredList.length), 5000); return () => clearInterval(id);
  }, [featuredList.length]);

  const current = featuredList[activeIndex] || (state.nowPlayingMovies?.[0] || state.movies?.[0]);
  const fallbackBg = 'https://placehold.co/1600x900/0b0b0b/fff?text=CineRank';

  const [tmdbUrls, setTmdbUrls] = useState({});
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const tasks = await Promise.all(featuredList.map(async m => {
        const key = m.id || m.title; if (!key) return [key, null];
        const cached = tmdbUrls[key]; if (cached) return [key, cached];
        const imdbId = typeof m.id === 'string' && m.id.startsWith('tt') ? m.id : (m.imdbId || '');
        const url = await getBestTmdbBackdrop({ imdbId, title: m.title, year: m.year });
        return [key, url || null];
      }));
      if (cancelled) return;
      setTmdbUrls(prev => { const next = { ...prev }; tasks.forEach(([k,v]) => { if (k && v && !next[k]) next[k] = v; }); return next; });
    };
    if (featuredList.length) load();
    return () => { cancelled = true; };
  }, [featuredList, tmdbUrls]);

  const bgList = featuredList.length ? featuredList : (current ? [current] : []);

  // Trailer modal state
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerTitle, setTrailerTitle] = useState('Trailer');
  const closeTrailer = () => setTrailerKey(null);

  const pickBestTrailer = (videos) => {
    const list = Array.isArray(videos?.results) ? videos.results : [];
    const yt = list.filter(v => v.site === 'YouTube');
    const official = yt.find(v => (v.type === 'Trailer' || v.type === 'Teaser') && v.official) || yt.find(v => v.type === 'Trailer') || yt[0];
    return official || null;
  };

  const handlePlayTrailer = async () => {
    try {
      const item = current;
      if (!item) return;
      // If detail already in state shape contains videos in future, use that; otherwise fetch
      let videoPayload = item.videos;
      if (!videoPayload) {
        const detail = await movieService.getMovieDetails(item.tmdbId || item.id);
        videoPayload = detail?.videos;
      }
      const best = pickBestTrailer(videoPayload);
      if (best?.key) {
        setTrailerKey(best.key);
        setTrailerTitle(best.name || `${item.title} • Trailer`);
      } else {
        alert('Trailer not available for this title yet.');
      }
    } catch (e) {
      alert('Failed to load trailer. Please try again later.');
    }
  };

  return (
    <section className="relative text-white pt-24 h-[70vh] md:h-[72vh] lg:h-[80vh] overflow-hidden flex items-stretch">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {bgList.map((m, i) => {
          const key = m.id || m.title;
          const tmdb = key ? tmdbUrls[key] : null;
            const src = (tmdb || m?.backdrop || fallbackBg);
          return (
            <img
              key={key || i}
              src={src}
              alt="Featured backdrop"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === activeIndex ? 'opacity-100' : 'opacity-0'}`}
              onError={(e) => { e.currentTarget.src = fallbackBg; }}
            />
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
        <div className="absolute inset-0 hero-gradient opacity-25 mix-blend-overlay pointer-events-none" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full py-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15 mb-4">
              <span className="text-xs uppercase tracking-widest text-white/80">Featured</span>
              <span className="w-1 h-1 rounded-full bg-white/60" />
              <span className="text-xs text-white/70">Now Playing</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)]">{current?.title || 'Discover Your Next Favorite Movie'}</h1>
            {current?.plot && (
              <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{current.plot}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-white/80">
              {current?.year && <span className="inline-flex items-center gap-2 text-sm"><i className="far fa-calendar" />{current.year}</span>}
              {current?.genre && <span className="inline-flex items-center gap-2 text-sm"><i className="fas fa-tags" />{current.genre}</span>}
              {typeof current?.rating === 'number' && <span className="inline-flex items-center gap-2 text-sm"><i className="fas fa-star text-yellow-400" />{(current.rating * 2).toFixed(1)} / 10</span>}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <LiquidButton variant="primary" icon={<i className="fas fa-play" />} onClick={handlePlayTrailer}>Play Trailer</LiquidButton>
              <LiquidButton variant="ghost" icon={<i className="fas fa-search" />} as="a" href="#search">Explore</LiquidButton>
            </div>
          </div>
          <div className="hidden lg:block" />
        </div>
      </div>
      {featuredList.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4">
          <button aria-label="Previous" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/60 text-white backdrop-blur ring-1 ring-white/10" onClick={() => setActiveIndex(i => (i - 1 + featuredList.length) % featuredList.length)}>
            <i className="fas fa-chevron-left" />
          </button>
          <div className="flex items-center gap-2">
            {featuredList.map((_, i) => (
              <button key={i} aria-label={`Go to slide ${i + 1}`} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activeIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`} onClick={() => setActiveIndex(i)} />
            ))}
          </div>
          <button aria-label="Next" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/60 text-white backdrop-blur ring-1 ring-white/10" onClick={() => setActiveIndex(i => (i + 1) % featuredList.length)}>
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      )}
      {trailerKey && <TrailerModal videoKey={trailerKey} title={trailerTitle} onClose={closeTrailer} />}
    </section>
  );
};

export default Hero;