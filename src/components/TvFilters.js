import React, { useState, useEffect } from 'react';
import { useMovieContext } from '../context/MovieContext';

const TvFilters = ({ onApply }) => {
  const { state } = useMovieContext();
  const { genres } = state;
  const tvGenres = genres.filter(g => g.id && g.name); // all merged genres currently

  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [rating, setRating] = useState('');

  useEffect(() => {
    onApply && onApply({ genre, year, rating });
  }, [genre, year, rating]);

  return (
    <div className="glass-lite rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Genre</label>
        <select value={genre} onChange={e => setGenre(e.target.value)} className="bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500">
          <option value="">All</option>
          {tvGenres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Year</label>
        <input type="number" min="1950" max={new Date().getFullYear()} value={year} onChange={e => setYear(e.target.value)} placeholder="Any" className="bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 w-28" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Min Rating</label>
        <select value={rating} onChange={e => setRating(e.target.value)} className="bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500">
          <option value="">Any</option>
          {[9,8,7,6,5].map(r => <option key={r} value={r}>{r}+</option>)}
        </select>
      </div>
      <div className="ml-auto text-sm text-gray-400">
        Auto filtering
      </div>
    </div>
  );
};

export default TvFilters;
