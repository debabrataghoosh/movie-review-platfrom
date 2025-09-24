import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMovieContext } from '../context/MovieContext';
import MovieCard from '../components/MovieCard';

const PersonDetailPage = () => {
  const { id } = useParams();
  const { state, actions } = useMovieContext();
  const { personDetails, loading } = state;

  useEffect(() => {
    if (id) actions.fetchPersonDetails(id);
  }, [id]);

  if (loading && !personDetails) {
    return <div className="pt-24 text-center text-white/70">Loading person...</div>;
  }

  if (!personDetails) {
    return <div className="pt-24 text-center text-white/70">No data available.</div>;
  }

  const {
    name,
    biography,
    birthday,
    deathday,
    placeOfBirth,
    profile,
    knownFor,
    knownForDepartment,
    popularity,
    gender,
    homepage,
  } = personDetails;

  const shortBio = biography && biography.length > 900 ? biography.slice(0, 900) + '…' : biography;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900">
              <img src={profile} alt={name} className="w-full h-auto object-cover" />
            </div>
            <div className="mt-6 space-y-2 text-sm text-white/70">
              {birthday && <p><span className="text-white/50">Born:</span> {birthday}</p>}
              {deathday && <p><span className="text-white/50">Died:</span> {deathday}</p>}
              {placeOfBirth && <p><span className="text-white/50">Place:</span> {placeOfBirth}</p>}
              {knownForDepartment && <p><span className="text-white/50">Department:</span> {knownForDepartment}</p>}
              {popularity && <p><span className="text-white/50">Popularity:</span> {Math.round(popularity)}</p>}
              {gender && <p><span className="text-white/50">Gender:</span> {gender === 1 ? 'Female' : gender === 2 ? 'Male' : 'Other'}</p>}
              {homepage && <p><a href={homepage} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-300">Official Site</a></p>}
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-4">{name}</h1>
              {shortBio ? (
                <p className="text-white/70 leading-relaxed whitespace-pre-line text-sm md:text-base">{shortBio}</p>
              ) : (
                <p className="text-white/40 italic">No biography available.</p>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight mb-4">Known For</h2>
              {knownFor && knownFor.length > 0 ? (
                <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {knownFor.map(m => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-sm">No notable credits available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetailPage;
