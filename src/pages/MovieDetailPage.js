import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService, transformIMDbMovie } from '../services/movieService';
import { buildTmdbImageUrl } from '../services/tmdbService';
import { getImdbMeta } from '../services/imdbService';
import LiquidButton from '../components/LiquidButton';
import TrailerModal from '../components/TrailerModal';
import { computeReleaseMeta } from '../utils/releaseMeta';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';

// Lightweight inline credits section component (could be extracted later)
const CreditsSection = ({ rawId, rawData, fullCredits }) => {
  // We already have limited cast; need full crew & cast from details call response.
  // The details response (raw) is not persisted separately, so expand by re-fetching minimal credits if needed.
  const [crew, setCrew] = React.useState([]);
  const [fullCast, setFullCast] = React.useState(fullCredits || []);
  const [expanded, setExpanded] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        // Re-use movieService.getMovieDetails to ensure we have full credits list
        const detail = await movieService.getMovieDetails(rawId);
        if (cancelled) return;
        const crewList = detail?.credits?.crew || [];
        const castList = detail?.credits?.cast || [];
        setCrew(crewList);
        setFullCast(castList);
      } catch (e) {
        if (!cancelled) setError('Failed to load credits');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [rawId]);

  const directors = crew.filter(c => c.job === 'Director');
  const writers = crew.filter(c => ['Writer','Screenplay','Story','Teleplay'].includes(c.job));
  const topDirectors = directors.slice(0, 3);
  const topWriters = writers.slice(0, 4);
  const visibleCast = expanded ? fullCast : fullCast.slice(0, 24);

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-semibold mb-6">Credits</h2>
      {loading && (
        <div className="text-sm text-white/60 mb-4">Loading credits…</div>
      )}
      {error && (
        <div className="text-sm text-red-400 mb-4">{error}</div>
      )}
      <div className="glass-lite rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-start gap-8">
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-white/50">Director{topDirectors.length > 1 ? 's' : ''}</h3>
            {topDirectors.length === 0 && <p className="text-xs text-white/40">N/A</p>}
            {topDirectors.map(d => (
              <p key={d.credit_id} className="text-sm text-white/90">{d.name}</p>
            ))}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider text-white/50">Writer{topWriters.length > 1 ? 's' : ''}</h3>
            {topWriters.length === 0 && <p className="text-xs text-white/40">N/A</p>}
            {topWriters.map(w => (
              <p key={w.credit_id} className="text-sm text-white/90">{w.name} <span className="text-white/40 text-xs">({w.job})</span></p>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-wider text-white/50">Full Cast</h3>
            {fullCast.length > 24 && (
              <button onClick={() => setExpanded(e => !e)} className="text-xs text-red-400 hover:underline focus:outline-none">
                {expanded ? 'Show Less' : `Show All (${fullCast.length})`}
              </button>
            )}
          </div>
          {fullCast.length === 0 && !loading && <p className="text-xs text-white/40">No cast available.</p>}
          {fullCast.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleCast.map(c => (
                <li key={c.cast_id || c.credit_id || c.id} className="rounded-lg bg-white/5 backdrop-blur-sm px-3 py-2">
                  <p className="text-sm text-white truncate" title={c.name}>{c.name}</p>
                  {c.character && <p className="text-[11px] text-white/50 truncate" title={c.character}>{c.character}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Reviews section (simplified: platform ratings row + featured + all toggle + add review CTA)
const ReviewsSection = ({ reviews, imdbMeta }) => {
  const [showAll, setShowAll] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [userReviews, setUserReviews] = React.useState([]);
  const inputRef = React.useRef(null);
  const ratingRef = React.useRef(null);

  // Platform ratings
  const platformRatings = [];
  if (typeof imdbMeta?.imdbRating === 'number') platformRatings.push({ key: 'imdb', label: 'IMDb', value: imdbMeta.imdbRating, sub: imdbMeta.imdbVotes ? imdbMeta.imdbVotes.toLocaleString() + ' votes' : null, color: 'from-yellow-400/20 to-yellow-500/10 border-yellow-400/30' });
  if (typeof imdbMeta?.metascore === 'number') platformRatings.push({ key: 'mc', label: 'Metacritic', value: imdbMeta.metascore, sub: 'Metascore', color: 'from-green-400/20 to-green-500/10 border-green-400/30' });
  if (typeof imdbMeta?.rottenTomatoes === 'number') platformRatings.push({ key: 'rt', label: 'Rotten Tomatoes', value: imdbMeta.rottenTomatoes + '%', sub: 'Tomatometer', color: 'from-orange-400/20 to-orange-500/10 border-orange-400/30' });
  const tmdbRatings = reviews.map(r => (typeof r?.author_details?.rating === 'number' ? r.author_details.rating : null)).filter(Boolean);
  if (tmdbRatings.length) {
    platformRatings.push({ key: 'tmdb', label: 'TMDB Users', value: (tmdbRatings.reduce((a,b)=>a+b,0)/tmdbRatings.length).toFixed(1), sub: tmdbRatings.length + ' ratings', color: 'from-red-400/20 to-red-500/10 border-red-400/30' });
  }

  const totalReviews = userReviews.length + reviews.length;
  const featured = reviews.slice(0, 2);
  const remaining = reviews.slice(2);

  const handleAddReview = (e) => {
    e.preventDefault();
    const text = inputRef.current?.value?.trim();
    const rating = parseFloat(ratingRef.current?.value);
    if (!text) return;
    setUserReviews(prev => [{
      id: `local_${Date.now()}`,
      author: 'You',
      content: text,
      author_details: { rating: isNaN(rating) ? null : rating },
      url: null
    }, ...prev]);
    inputRef.current.value = '';
    ratingRef.current.value = '';
    setAdding(false);
  };

  return (
    <div className="mt-20" id="reviews">
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-8">User Reviews{totalReviews ? <span className="text-sm font-normal text-white/40">{totalReviews}</span> : null}</h2>
      {/* Ratings Summary (Modern full-width) */}
      <div className="relative overflow-hidden rounded-2xl mb-14 ring-1 ring-white/10 bg-gradient-to-br from-white/5 via-white/2 to-white/5 backdrop-blur-xl p-8">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(255,0,0,0.12),transparent_60%)]" />
        <div className="relative flex flex-col lg:flex-row gap-10">
          <div className="flex items-start gap-5 min-w-[180px]">
            <div className="text-yellow-400 text-5xl mt-1"><i className="fas fa-star" /></div>
            <div>
              <p className="text-5xl font-extrabold leading-none tracking-tight">{(imdbMeta?.imdbRating || (tmdbRatings.length ? (tmdbRatings.reduce((a,b)=>a+b,0)/tmdbRatings.length).toFixed(1) : '—'))}</p>
              <p className="text-xs uppercase tracking-wider text-white/50 mt-2">Primary Average</p>
              {imdbMeta?.imdbVotes && <p className="text-xs text-white/40 mt-1">{imdbMeta.imdbVotes.toLocaleString()} IMDb votes</p>}
              {tmdbRatings.length > 0 && <p className="text-[11px] text-white/30">{tmdbRatings.length} TMDB rated samples</p>}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {platformRatings.map(p => (
                <div key={p.key} className={`relative rounded-xl border ${p.color} px-4 py-3 bg-gradient-to-br`}>
                  <p className="text-lg font-semibold">{p.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-white/50">{p.label}</p>
                  {p.sub && <p className="text-[10px] text-white/35 mt-1">{p.sub}</p>}
                </div>
              ))}
              {platformRatings.length === 0 && <div className="text-sm text-white/50">No platform ratings available.</div>}
            </div>
            <div className="flex flex-wrap gap-6 text-[11px] text-white/40">
              <span>Total Reviews (local + TMDB): <strong className="text-white/60">{totalReviews}</strong></span>
              <span>User Added: <strong className="text-white/60">{userReviews.length}</strong></span>
              <span>TMDB Reviews Loaded: <strong className="text-white/60">{reviews.length}</strong></span>
              <span>Platforms: <strong className="text-white/60">{platformRatings.length}</strong></span>
              <span>Updated: <strong className="text-white/60">{new Date().toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Reviews Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Featured Reviews</h3>
        <div className="flex items-center gap-5">
          <button onClick={() => setAdding(a => !a)} className="text-sm text-red-400 hover:underline focus:outline-none">
            {adding ? 'Cancel' : 'Add Your Review'}
          </button>
          {reviews.length > 2 && (
            <button onClick={() => setShowAll(s => !s)} className="text-sm text-red-400 hover:underline focus:outline-none">
              {showAll ? 'Hide All' : 'See All Reviews'}
            </button>
          )}
        </div>
      </div>
      {adding && (
        <form onSubmit={handleAddReview} className="rounded-xl border border-red-500/20 bg-black/40 backdrop-blur-sm p-5 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <textarea ref={inputRef} required placeholder="Share your thoughts…" className="flex-1 bg-white/5 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/50 min-h-[110px]" />
            <div className="w-full md:w-48 flex flex-col gap-3">
              <input ref={ratingRef} type="number" step="0.5" min="1" max="10" placeholder="Rating (1-10)" className="bg-white/5 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/50" />
              <button type="submit" className="bg-red-600 hover:bg-red-500 transition-colors text-sm font-semibold rounded-md py-2">Submit</button>
            </div>
          </div>
          <p className="text-[11px] text-white/40">Local only — not persisted yet.</p>
        </form>
      )}
      {/* Featured Grid */}
      <div className="mb-12">
        {featured.length === 0 && userReviews.length === 0 && (
          <div className="glass-lite rounded-xl p-6 text-sm text-white/60">No reviews yet. Be the first!</div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          {[...userReviews, ...featured].map(r => (
            <div key={r.id} className="glass-lite rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {typeof r.author_details?.rating === 'number' && (
                    <span className="inline-flex items-center gap-1 text-yellow-400 text-xs bg-white/5 px-2 py-[2px] rounded"><i className="fas fa-star" />{r.author_details.rating}</span>
                  )}
                  <span className="text-sm font-semibold text-white/90">{r.author}</span>
                </div>
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-[11px] text-red-400 hover:underline">Full</a>}
              </div>
              <p className="text-sm leading-relaxed text-white/80 mb-3" style={{display:'-webkit-box', WebkitLineClamp:6, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{r.content}</p>
              <div className="mt-auto">
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-red-400 hover:underline">Read full review »</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* All Reviews */}
      {showAll && remaining.length > 0 && (
        <div className="mb-10" id="all-reviews">
          <h3 className="text-lg font-semibold mb-4">All Reviews</h3>
          <div className="space-y-6">
            {remaining.map(r => (
              <div key={r.id} className="glass-lite rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {typeof r.author_details?.rating === 'number' && (
                      <span className="inline-flex items-center gap-1 text-yellow-400 text-xs bg-white/5 px-2 py-[2px] rounded"><i className="fas fa-star" />{r.author_details.rating}</span>
                    )}
                    <span className="text-sm font-semibold text-white/90">{r.author}</span>
                  </div>
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-[11px] text-red-400 hover:underline">Full</a>}
                </div>
                <p className="text-sm leading-relaxed text-white/80 mb-3" style={{display:'-webkit-box', WebkitLineClamp:8, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{r.content}</p>
                <div className="mt-auto">
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-red-400 hover:underline">Read full review »</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MovieDetailPage = () => {
  const { id } = useParams();
  const { isWishlisted, toggle } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cast, setCast] = useState([]);
  const [genres, setGenres] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recs, setRecs] = useState([]);
  const [imdbMeta, setImdbMeta] = useState({ imdbRating: null, imdbVotes: null, metascore: null, rottenTomatoes: null });
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerTitle, setTrailerTitle] = useState('Trailer');
  const [runtimeMinutes, setRuntimeMinutes] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true); setError(null);
      try {
  const raw = await movieService.getMovieDetails(id);
  const transformed = transformIMDbMovie(raw);
        if (!cancelled) {
          setData(transformed);
          // Runtime (movie runtime or TV episode_run_time average)
          const rt = typeof raw?.runtime === 'number' && raw.runtime > 0
            ? raw.runtime
            : (Array.isArray(raw?.episode_run_time) && raw.episode_run_time.length ? Math.round(raw.episode_run_time.reduce((a,b)=>a+b,0)/raw.episode_run_time.length) : null);
          setRuntimeMinutes(rt || null);
          // IMDb meta (if external_ids present)
          if (transformed.imdbId) {
            getImdbMeta(transformed.imdbId).then(m => { if (!cancelled) setImdbMeta(m); });
          } else {
            setImdbMeta({ imdbRating: null, imdbVotes: null, metascore: null, rottenTomatoes: null });
          }
          // Cast (limit 12)
          const castList = raw?.credits?.cast ? raw.credits.cast.slice(0, 12) : [];
          setCast(castList);
          // Genres
          const gs = raw?.genres ? raw.genres.map(g => g.name) : [];
          setGenres(gs);
          // Reviews (TMDB) first page
          const reviewResp = await movieService.getMovieReviews(id, 1);
          const parsedReviews = (reviewResp?.results || []).slice(0, 6);
          setTotalReviews(typeof reviewResp?.total_results === 'number' ? reviewResp.total_results : parsedReviews.length);
          setReviews(parsedReviews);
          // Recommendations
            const mediaType = raw?.first_air_date ? 'tv' : 'movie';
          const recItems = await movieService.getRecommendations(id, mediaType);
          setRecs(recItems.slice(0, 12));
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (id) run();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-white">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-[60vh] text-red-400">{error}</div>;
  if (!data) return null;

  const poster = data.poster;
  const backdrop = data.backdrop;
  const { dateLabel, daysLeft, isFuture, iso, badgeColor } = computeReleaseMeta(data.releaseDate, data.year);
  const isFeatured = (data.popularity || 0) > 100; // simple heuristic

  const pickBestTrailer = (videos) => {
    const list = Array.isArray(videos?.results) ? videos.results : [];
    const yt = list.filter(v => v.site === 'YouTube');
    const official = yt.find(v => (v.type === 'Trailer' || v.type === 'Teaser') && v.official) || yt.find(v => v.type === 'Trailer') || yt[0];
    return official || null;
  };

  const onToggleWishlist = () => {
    if (!data) return;
    if (!isAuthenticated) { return; }
    // Use the transformed 'data' which has normalized fields and id
    toggle({ id: String(data.tmdbId || data.id), title: data.title, poster: data.poster, year: data.year });
  };

  const handleWatchTrailer = async () => {
    try {
      // We need fresh details to ensure videos are present
      const detail = await movieService.getMovieDetails(id);
      const best = pickBestTrailer(detail?.videos);
      if (best?.key) {
        setTrailerKey(best.key);
        setTrailerTitle(best.name || `${data.title} • Trailer`);
      } else {
        alert('Trailer not available for this title.');
      }
    } catch (e) {
      alert('Failed to load trailer. Please try again later.');
    }
  };

  return (
  <section className="relative min-h-[75vh] pt-24 pb-24 text-white overflow-hidden">
      {/* Backdrop */}
      {backdrop && (
        <img src={backdrop} alt="backdrop" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Poster */}
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 glass-panel">
              {poster ? (
                <img src={poster} alt={data.title} className="w-full h-full object-cover" />
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center text-sm text-white/60">No Poster</div>
              )}
            </div>
          </div>
          {/* Content */}
          <div className="flex-1">
            {isFeatured && (
              <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/30 mb-3">Featured</span>
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]">{data.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-6 items-center">
              {dateLabel && (
                <span className="inline-flex items-center gap-2" title={iso || (dateLabel==='TBD' ? 'Release date not yet announced' : '')}>
                  <span className="inline-flex items-center gap-1"><i className="far fa-calendar" />{dateLabel}</span>
                  {isFuture && daysLeft != null && (
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${badgeColor}`} title={`${daysLeft} day${daysLeft===1?'':'s'} left`}>
                      {daysLeft}d
                    </span>
                  )}
                  {dateLabel==='TBD' && (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-600/60 text-white" title="Release date to be determined">TBD</span>
                  )}
                </span>
              )}
              {/* Primary meta row inspired by mock: 4.5/5 (328 reviews) • 2025 • 142 min */}
              <span className="inline-flex items-center gap-1 text-yellow-400" title="Community rating out of 5"><i className="fas fa-star" />{(data.rating).toFixed(1)}/5</span>
              {typeof totalReviews === 'number' && (
                <span className="text-white/60">({totalReviews.toLocaleString()} reviews)</span>
              )}
              {data.year && <span className="text-white/70">• {data.year}</span>}
              {runtimeMinutes ? <span className="text-white/70">• {runtimeMinutes} min</span> : null}
              {imdbMeta.imdbRating && (
                <span className="inline-flex items-center gap-1 bg-black/40 border border-yellow-500/30 rounded-md px-2 py-[2px] text-[13px] shadow" title="IMDb rating">
                  <span className="font-semibold text-yellow-400">IMDb</span>
                  <span className="text-white">{imdbMeta.imdbRating}</span>
                  {imdbMeta.imdbVotes && <span className="text-white/50">({(imdbMeta.imdbVotes).toLocaleString()})</span>}
                </span>
              )}
              {imdbMeta.metascore && (
                <span className="inline-flex items-center gap-1 bg-black/40 border border-green-500/30 rounded-md px-2 py-[2px] text-[13px] shadow" title="Metascore (Metacritic)">
                  <span className="font-semibold text-green-400">MC</span>
                  <span className="text-white">{imdbMeta.metascore}</span>
                </span>
              )}
              {typeof imdbMeta.rottenTomatoes === 'number' && (
                <span className="inline-flex items-center gap-1 bg-black/40 border border-orange-500/30 rounded-md px-2 py-[2px] text-[13px] shadow" title="Rotten Tomatoes Tomatometer">
                  <span className="font-semibold text-orange-400">RT</span>
                  <span className="text-white">{imdbMeta.rottenTomatoes}%</span>
                </span>
              )}
            </div>
            {genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map(g => (
                  <span key={g} className="glass-pill-primary text-xs px-3 py-1 rounded-full tracking-wide">{g}</span>
                ))}
              </div>
            )}
            <p className="text-lg leading-relaxed text-white/85 max-w-3xl mb-8">{data.plot}</p>
            <div className="flex flex-wrap gap-4">
              <LiquidButton variant="primary" icon={<i className="fas fa-play" />} onClick={handleWatchTrailer}>Watch Trailer</LiquidButton>
              <SignedIn>
                <LiquidButton variant="ghost" icon={<i className={`fas ${isWishlisted(String(data.tmdbId || data.id)) ? 'fa-check text-green-400' : 'fa-plus'}`} />} onClick={onToggleWishlist}>
                  {isWishlisted(String(data.tmdbId || data.id)) ? 'In Watchlist' : 'Add to Watchlist'}
                </LiquidButton>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white text-sm ring-1 ring-white/10">
                    <i className="fas fa-plus" /> Sign in to Watchlist
                  </button>
                </SignInButton>
              </SignedOut>
              <LiquidButton
                variant="ghost"
                icon={<i className="fas fa-pen" />}
                onClick={() => {
                  const el = document.getElementById('reviews');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Write a Review
              </LiquidButton>
            </div>
          </div>
        </div>
        {/* Cast */}
        {cast.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {cast.map(person => {
                const card = (
                  <div className="glass-lite rounded-xl p-4 flex flex-col items-center text-center hover:scale-[1.02] transition">
                    {person.profile_path ? (
                      <img src={buildTmdbImageUrl(person.profile_path, 'w185')} alt={person.name} className="w-24 h-24 object-cover rounded-full mb-3 ring-2 ring-white/10" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-xs mb-3">No Img</div>
                    )}
                    <p className="text-sm font-medium text-white truncate w-full" title={person.name}>{person.name}</p>
                    {person.character && <p className="text-xs text-white/60 truncate w-full" title={person.character}>{person.character}</p>}
                  </div>
                );
                const key = person.cast_id || person.credit_id || person.id;
                return person.id ? (
                  <Link key={key} to={`/person/${person.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 rounded-xl">
                    {card}
                  </Link>
                ) : (
                  <div key={key}>{card}</div>
                );
              })}
            </div>
          </div>
        )}
        {/* Full Credits (directors, writers, full cast) */}
        {data && (data.id) && (
          <CreditsSection rawId={id} rawData={data} fullCredits={cast} raw={null} />
        )}
        {/* Reviews (summary + featured) */}
        <ReviewsSection reviews={reviews} imdbMeta={imdbMeta} />
        {/* Recommendations */}
        {recs.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-semibold mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {recs.map(item => {
                const poster = item.poster_path ? buildTmdbImageUrl(item.poster_path, 'w342') : null;
                return (
                  <a key={item.id} href={`/title/${item.id}`} className="group glass-lite rounded-xl overflow-hidden block hover:scale-[1.03] transition-transform duration-300">
                    {poster ? <img src={poster} alt={item.title || item.name} className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-60 bg-white/5 flex items-center justify-center text-xs">No Image</div>}
                    <div className="p-3">
                      <p className="text-sm font-medium text-white truncate" title={item.title || item.name}>{item.title || item.name}</p>
                      {typeof item.vote_average === 'number' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-yellow-400 mt-1"><i className="fas fa-star" />{item.vote_average.toFixed(1)}</span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {trailerKey && <TrailerModal videoKey={trailerKey} title={trailerTitle} onClose={() => setTrailerKey(null)} />}
    </section>
  );
};

export default MovieDetailPage;
