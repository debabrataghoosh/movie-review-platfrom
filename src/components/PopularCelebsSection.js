import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LiquidButton from './LiquidButton';

const PopularCelebsSection = ({ people = [] }) => {
  const [visible, setVisible] = useState(10); // initial count
  if (!people.length) return null;
  const showMore = () => setVisible(v => Math.min(v + 5, people.length));
  const canShowMore = visible < people.length;

  return (
    <div className="mt-24 mb-16">
      <div className="flex items-center justify-between mb-8 px-1">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">Popular Celebs</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 mb-8">
        {people.slice(0, visible).map(p => (
          <Link key={p.id} to={`/person/${p.id}`} className="group flex flex-col items-center text-center">
            {p.profile ? (
              <img src={p.profile} alt={p.name} className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-pink-400/60 transition shadow-lg group-hover:scale-105 duration-300" loading="lazy" />
            ) : (
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white/10 flex items-center justify-center text-[11px] text-white/50">No Img</div>
            )}
            <p className="mt-4 text-sm md:text-base font-semibold text-white truncate w-full" title={p.name}>{p.name}</p>
            {p.department && (
              <p className="text-[11px] md:text-[12px] text-white/50 truncate w-full" title={p.department}>{p.department}</p>
            )}
          </Link>
        ))}
      </div>
      {canShowMore && (
        <div className="flex justify-end px-1">
          <LiquidButton variant="ghost" size="sm" onClick={showMore} icon={<i className="fas fa-arrow-right text-xs" />}>See more</LiquidButton>
        </div>
      )}
    </div>
  );
};

export default PopularCelebsSection;
