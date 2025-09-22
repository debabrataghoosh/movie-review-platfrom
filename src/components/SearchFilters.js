import React from 'react';
import { useMovieContext } from '../context/MovieContext';

const SearchFilters = () => {
  const { state, actions } = useMovieContext();
  const { filters, genres } = state;

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    actions.setFilters(newFilters);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <section className="bg-black shadow-lg border-b border-gray-700 py-6 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-6 justify-center">
          {/* Genre Filter */}
          <div className="flex flex-col">
            <label 
              htmlFor="genreFilter" 
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              <i className="fas fa-film mr-2 text-blue-600"></i>
              Genre
            </label>
            <select
              id="genreFilter"
              value={filters.genre || ''}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.name.toLowerCase()}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex flex-col">
            <label 
              htmlFor="yearFilter" 
              className="text-sm font-semibold text-gray-300 mb-2"
            >
              <i className="fas fa-calendar mr-2 text-green-600"></i>
              Year
            </label>
            <select
              id="yearFilter"
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex flex-col">
            <label 
              htmlFor="ratingFilter" 
              className="text-sm font-semibold text-gray-300 mb-2"
            >
              <i className="fas fa-star mr-2 text-yellow-500"></i>
              Min Rating
            </label>
            <select
              id="ratingFilter"
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(filters.genre || filters.year || filters.rating) && (
            <div className="flex flex-col justify-end">
              <button
                onClick={() => actions.setFilters({ genre: '', year: '', rating: '' })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <i className="fas fa-times"></i>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;