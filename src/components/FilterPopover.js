import React, { useState, useMemo } from 'react';
import { useMovieContext } from '../context/MovieContext';

/**
 * FilterPopover - compact advanced filtering UI for header dropdown
 */
const FilterPopover = ({ onClose }) => {
  const { state, actions } = useMovieContext();
  const { genres, movies, tvShows } = state;

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => Array.from({ length: 30 }, (_, i) => currentYear - i), [currentYear]);

  const [mediaType, setMediaType] = useState('all');
  const [score, setScore] = useState('');
  const [status, setStatus] = useState(''); // TV status
  const [cert, setCert] = useState(''); // movie certification
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState('popularity.desc');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genreSort, setGenreSort] = useState('alpha'); // 'alpha' | 'pop'

  const toggleGenre = (id) => {
    setSelectedGenres(g => g.includes(id) ? g.filter(x=>x!==id) : [...g, id]);
  };

  const clearAll = () => {
    setMediaType('all');
    setScore('');
    setLanguage('');
    setStatus('');
    setCert('');
    
    setSort('popularity.desc');
    setSelectedGenres([]);
    setGenreSort('alpha');
  };

  const clearGenres = () => setSelectedGenres([]);

  // Dynamic languages derived from loaded movies & tvShows
  const dynamicLanguages = useMemo(() => {
    const freq = new Map();
    [...movies, ...tvShows].forEach(m => {
      if (m?.originalLanguage) {
        freq.set(m.originalLanguage, (freq.get(m.originalLanguage) || 0) + 1);
      }
    });
    return Array.from(freq.entries())
      .sort((a,b) => b[1]-a[1])
      .map(([code]) => code);
  }, [movies, tvShows]);

  // Genre popularity counts (based on current loaded media arrays)
  const genrePopularity = useMemo(() => {
    const counts = new Map();
    const all = [...movies, ...tvShows];
    all.forEach(item => {
      (item.genreIds || []).forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
    });
    return counts;
  }, [movies, tvShows]);

  const sortedGenres = useMemo(() => {
    const base = [...genres];
    if (genreSort === 'alpha') {
      return base.sort((a,b) => a.name.localeCompare(b.name));
    }
    // popularity sort (descending by occurrence; then alpha)
    return base.sort((a,b) => {
      const diff = (genrePopularity.get(b.id) || 0) - (genrePopularity.get(a.id) || 0);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [genres, genreSort, genrePopularity]);

  const apply = async () => {
    const params = {};
    if (selectedGenres.length) params.with_genres = selectedGenres.join(',');
    if (score) params['vote_average.gte'] = score;
    if (language) params.with_original_language = language;
    if (cert && mediaType !== 'tv') { // certification only for movies
      params.certification_country = 'US';
      params.certification = cert;
    }
    params.sort_by = sort;

    if (mediaType === 'tv') {
      if (status) params.with_status = status; // not official; placeholder for potential extension
      actions.discoverTvShows(params);
    } else if (mediaType === 'movie') {
      actions.discoverMovies(params);
    } else {
      // For 'all' we fetch both, then rely on views that already read from movies & tvShows arrays.
      // We trigger both discover calls with same params. They update separately.
      // (Optional future: create combined list in context)
      actions.discoverMovies(params);
      actions.discoverTvShows(params);
    }
    if (onClose) onClose();
  };

  return (
  <div className="w-[640px] max-w-[95vw] text-white space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">Filters</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          <i className="fas fa-times" />
        </button>
      </div>
  <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">Type</label>
          <div className="flex flex-wrap gap-2">
            {['all','movie','tv'].map(t => (
              <button key={t} onClick={()=>setMediaType(t)} type="button" className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${mediaType===t?'bg-pink-500/20 border-pink-400 text-pink-200':'border-white/10 text-white/70 hover:bg-white/5'}`}>{t==='tv'?'TV Series': t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} disabled={mediaType==='movie'} className="w-full bg-white/5 rounded-md border border-white/10 text-sm px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-400/40">
            <option value="">All</option>
            <option value="0">Returning</option>
            <option value="1">Planned</option>
            <option value="2">In Production</option>
            <option value="3">Ended</option>
            <option value="4">Canceled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">Rated</label>
          <select value={cert} onChange={e=>setCert(e.target.value)} disabled={mediaType==='tv'} className="w-full bg-white/5 rounded-md border border-white/10 text-sm px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-400/40">
            <option value="">All</option>
            <option value="G">G</option>
            <option value="PG">PG</option>
            <option value="PG-13">PG-13</option>
            <option value="R">R</option>
            <option value="R+">R+</option>
            <option value="RX">RX</option>
            <option value="NC-17">NC-17</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">Score</label>
          <select value={score} onChange={e=>setScore(e.target.value)} className="w-full bg-white/5 rounded-md border border-white/10 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
            <option value="">All</option>
            <option value="5">5+</option>
            <option value="6">6+</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">Language</label>
          <select value={language} onChange={e=>setLanguage(e.target.value)} className="w-full bg-white/5 rounded-md border border-white/10 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
            <option value="">All</option>
            {dynamicLanguages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          {dynamicLanguages.length === 0 && (
            <p className="mt-1 text-[10px] text-white/40">Languages populate after data loads</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">Sort</label>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="w-full bg-white/5 rounded-md border border-white/10 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
            <option value="popularity.desc">Default</option>
            <option value="vote_average.desc">Rating (High)</option>
            <option value="release_date.desc">Newest</option>
            <option value="release_date.asc">Oldest</option>
          </select>
        </div>
        {/* Dates & Season removed per request */}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-white/60">Genres</h4>
          <div className="flex items-center gap-2">
            <button type="button" onClick={()=>setGenreSort(genreSort==='alpha'?'pop':'alpha')} className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/60">{genreSort==='alpha'?'Popularity':'A-Z'}</button>
            {selectedGenres.length>0 && (
              <button type="button" onClick={clearGenres} className="text-[10px] px-2 py-1 rounded bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400 text-pink-100">Clear</button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-auto pr-1">
          {sortedGenres.map(g => {
            const active = selectedGenres.includes(g.id);
            const count = genrePopularity.get(g.id) || 0;
            return (
              <button key={g.id} type="button" title={count?`${count} items`:'No items loaded yet'} onClick={()=>toggleGenre(g.id)} className={`px-2.5 py-1.5 rounded-md text-[11px] border transition ${active? 'bg-pink-500/25 border-pink-400 text-pink-100 shadow-inner':'border-white/10 text-white/70 hover:bg-white/5'}`}>
                {g.name}
                {count>0 && <span className="ml-1 text-[9px] text-white/40">{count}</span>}
              </button>
            );
          })}
        </div>
        {selectedGenres.length>0 && (
          <p className="mt-2 text-[10px] text-white/50">{selectedGenres.length} selected</p>
        )}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button onClick={apply} className="px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-black font-semibold text-sm shadow-lg shadow-pink-500/30 transition">Apply</button>
        <button onClick={clearAll} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition">Reset</button>
        <button onClick={onClose} className="ml-auto text-white/50 hover:text-white text-xs">Close</button>
      </div>
    </div>
  );
};

export default FilterPopover;
