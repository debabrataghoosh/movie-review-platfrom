import React from 'react';
import { Link } from 'react-router-dom';

const PersonCard = ({ person }) => {
  if (!person) return null;
  return (
    <Link to={`/person/${person.id}`} className="group relative w-40 flex-shrink-0">
      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 ring-1 ring-white/10 shadow-lg">
        <img
          src={person.profile}
          alt={person.name}
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
        <div className="absolute bottom-2 left-2 right-2 space-y-1">
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 drop-shadow">{person.name}</h3>
          {person.department && (
            <p className="text-[10px] uppercase tracking-wide text-pink-300/80 font-medium">{person.department}</p>
          )}
        </div>
      </div>
      {person.popularity && (
        <div className="absolute -top-2 -right-2 bg-pink-500 text-black text-[10px] font-semibold px-2 py-1 rounded-full shadow-md">{Math.round(person.popularity)}</div>
      )}
    </Link>
  );
};

export default PersonCard;
