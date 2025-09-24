import React, { useMemo, useState } from 'react';
import MovieCard from './MovieCard';
import LiquidButton from './LiquidButton';

/**
 * WeeklyPicks component
 * Displays items in fixed rows of 5 cards. Each click on "See more" reveals
 * the next row (next 5 items) until all items are visible.
 */
const WeeklyPicks = ({ title = "This Week's Picks", items = [], onItemClick, getUserRating, chunkSize = 5 }) => {
  const [visibleGroups, setVisibleGroups] = useState(1);

  const groups = useMemo(() => {
    const arr = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      arr.push(items.slice(i, i + chunkSize));
    }
    return arr;
  }, [items, chunkSize]);

  if (!items || !items.length) return null;

  const showMore = () => setVisibleGroups(v => Math.min(v + 1, groups.length));

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">{title}</h2>
      </div>

      {groups.slice(0, visibleGroups).map((group, idx) => (
  <div key={idx} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-10">
          {group.map(item => (
            <div key={item.id || item.tmdbId} className="w-full">
              <MovieCard
                movie={item}
                userRating={getUserRating ? getUserRating(item.id) : 0}
                onClick={() => onItemClick && onItemClick(item)}
              />
            </div>
          ))}
        </div>
      ))}

      {visibleGroups < groups.length && (
        <div className="flex justify-end px-1">
          <LiquidButton variant="ghost" size="sm" onClick={showMore} icon={<i className="fas fa-arrow-right text-xs" />}>See more</LiquidButton>
        </div>
      )}
    </section>
  );
};

export default WeeklyPicks;
