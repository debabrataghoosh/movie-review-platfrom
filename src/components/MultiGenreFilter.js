import React from 'react';

/**
 * MultiGenreFilter
 * Props:
 *  - genres: [{ id, name }]
 *  - selected: number[] (genre IDs)
 *  - onChange: (newIds:number[]) => void
 */
const MultiGenreFilter = ({ genres = [], selected = [], onChange }) => {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(g => g !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const clear = () => onChange([]);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {genres.map(g => {
        const active = selected.includes(g.id);
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => toggle(g.id)}
            className={`relative px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border backdrop-blur-sm select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 ${active ? 'bg-gradient-to-br from-red-500/80 to-red-600/80 text-white border-red-400/50 shadow-md scale-[1.04]' : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10 hover:border-white/20'}`}
            title={active ? 'Remove genre' : 'Add genre'}
          >
            {g.name}
            {active && (
              <span className="ml-1 text-[10px] opacity-80">×</span>
            )}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={clear}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white/80 border border-white/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default MultiGenreFilter;
