import React, { useEffect } from 'react';
import { useMovieContext } from '../context/MovieContext';
import PersonCard from '../components/PersonCard';

const PeoplePage = () => {
  const { state, actions } = useMovieContext();
  const { popularPeople, loading } = state;

  useEffect(() => {
    if (!popularPeople.length) actions.fetchPopularPeople();
  }, [popularPeople.length]);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-white mb-10 text-center tracking-tight">People</h1>
        {loading && !popularPeople.length && <p className="text-white/70 text-center">Loading...</p>}
        <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 auto-rows-fr">
          {popularPeople.map(p => (
            <PersonCard key={p.id} person={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeoplePage;
