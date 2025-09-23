import React from 'react';
import MovieCard from './MovieCard';

const HorizontalScroller = ({ title, items = [], onItemClick, getUserRating, emptyText = 'No items' }) => {
  if (!items.length) return null;
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      <div className="relative group">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent snap-x snap-mandatory">
          {items.map(item => (
            <div key={item.id} className="w-48 flex-shrink-0 snap-start">
              <MovieCard movie={item} userRating={getUserRating ? getUserRating(item.id) : 0} onClick={() => onItemClick && onItemClick(item)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalScroller;
