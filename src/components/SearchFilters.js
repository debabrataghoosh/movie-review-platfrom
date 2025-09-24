import React, { useState } from 'react';
import { useMovieContext } from '../context/MovieContext';

// Redesigned advanced filter panel
const SearchFilters = ({ onApply }) => {
  const { state, actions } = useMovieContext();
  const { genres } = state;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const [mediaType, setMediaType] = useState('all'); // all | movie | tv
  const [status, setStatus] = useState(''); // TMDB status not directly exposed in list endpoints; placeholder
  const [rated, setRated] = useState(''); // placeholder (could map certification later)
  const [score, setScore] = useState(''); // min vote average
  const [language, setLanguage] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [sort, setSort] = useState('popularity.desc');
  const [selectedGenres, setSelectedGenres] = useState([]); // multi-select

  const toggleGenre = (id) => {
    setSelectedGenres(g => g.includes(id) ? g.filter(x=>x!==id) : [...g, id]);
  };

  const clearAll = () => {
    setMediaType('all');
    setStatus('');
    setRated('');
    setScore('');
    setLanguage('');
    setStartYear('');
    setEndYear('');
    setSort('popularity.desc');
    setSelectedGenres([]);
  };

  const apply = () => {
    // Build discover filters
    const baseFilters = {};
    if (selectedGenres.length) baseFilters.with_genres = selectedGenres.join(',');
    if (score) baseFilters['vote_average.gte'] = score;
    if (language) baseFilters.with_original_language = language;
    if (startYear) baseFilters['primary_release_date.gte'] = `${startYear}-01-01`;
    if (endYear) baseFilters['primary_release_date.lte'] = `${endYear}-12-31`;
    baseFilters.sort_by = sort;

    if (mediaType === 'tv') {
      actions.discoverTvShows(baseFilters);
    } else if (mediaType === 'movie') {
      actions.discoverMovies(baseFilters);
    } else {
      // If all, fetch both; we only have one grid currently so prefer movies and could later merge
      actions.discoverMovies(baseFilters);
    }
    if (typeof onApply === 'function') onApply({ mediaType, ...baseFilters });
  };

  const genreChips = genres.map(g => {
    const active = selectedGenres.includes(g.id);
    return (
      <button
        key={g.id}
        type="button"
        onClick={() => toggleGenre(g.id)}
        className={`px-3 py-1.5 rounded-md text-sm border transition-all ${active ? 'bg-pink-500/20 border-pink-400 text-pink-200' : 'border-gray-600 text-gray-300 hover:bg-white/5'}`}
      >
        {g.name}
      </button>
    );
  });

  return (
    <section className="rounded-xl mx-4 md:mx-0 mt-6 bg-[#242530] border border-white/5 shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Filter</h2>
        <div className="grid gap-4 md:gap-5" style={{gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))'}}>
          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Type <span className="font-normal text-white/50">{mediaType === 'all' ? 'All' : mediaType}</span></label>
            <div className="flex gap-2 flex-wrap">
              {['all','movie','tv'].map(t => (
                <button key={t} type="button" onClick={()=>setMediaType(t)} className={`px-3 py-1.5 rounded-md text-sm border ${mediaType===t?'bg-pink-500/20 border-pink-400 text-pink-200':'border-gray-600 text-gray-300 hover:bg-white/5'}`}>{t === 'tv' ? 'TV Series' : t.charAt(0).toUpperCase()+t.slice(1)}</button>
              ))}
            </div>
          </div>
          {/* Status (placeholder) */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Status <span className="font-normal text-white/50">All</span></label>
            <div className="flex gap-2 flex-wrap text-xs text-white/40">N/A</div>
          </div>
          {/* Rated placeholder */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Rated <span className="font-normal text-white/50">All</span></label>
              <div className="flex gap-2 flex-wrap text-xs text-white/40">N/A</div>
            </div>
          {/* Score (vote average) */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Score</label>
            <select value={score} onChange={e=>setScore(e.target.value)} className="w-full bg-[#1d1e26] border border-gray-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/50">
              <option value="">All</option>
              <option value="5">5+</option>
              <option value="6">6+</option>
              <option value="7">7+</option>
              <option value="8">8+</option>
            </select>
          </div>
          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Language</label>
            <input value={language} onChange={e=>setLanguage(e.target.value)} placeholder="en" className="w-full bg-[#1d1e26] border border-gray-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/50" />
          </div>
          {/* Start Year */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Start Year</label>
            <select value={startYear} onChange={e=>setStartYear(e.target.value)} className="w-full bg-[#1d1e26] border border-gray-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/50">
              <option value="">Year</option>
              {years.map(y=> <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {/* End Year */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">End Year</label>
            <select value={endYear} onChange={e=>setEndYear(e.target.value)} className="w-full bg-[#1d1e26] border border-gray-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/50">
              <option value="">Year</option>
              {years.map(y=> <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Sort</label>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="w-full bg-[#1d1e26] border border-gray-600 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400/50">
              <option value="popularity.desc">Default</option>
              <option value="vote_average.desc">Rating (High)</option>
              <option value="release_date.desc">Newest</option>
              <option value="release_date.asc">Oldest</option>
            </select>
          </div>
        </div>
        {/* Genre Chips */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Genre</h3>
          <div className="flex flex-wrap gap-2">
            {genreChips}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 items-center">
          <button onClick={apply} className="px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-400 text-black font-semibold shadow-lg shadow-pink-500/30 transition focus:outline-none focus:ring-2 focus:ring-pink-400/60">Filter</button>
          <button onClick={clearAll} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition">Reset</button>
          {selectedGenres.length > 0 && (
            <span className="text-xs text-white/50">{selectedGenres.length} genre{selectedGenres.length>1?'s':''} selected</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;