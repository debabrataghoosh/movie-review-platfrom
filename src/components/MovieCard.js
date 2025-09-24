import React from 'react';
import { Link } from 'react-router-dom';
// Removed multi-star rating display for cards; we'll show a single star icon with numeric rating.

const MovieCard = ({ movie, userRating, onClick }) => {
  const { title, year, genre, poster, rating, ratingCount, releaseDate } = movie;
  const mediaType = movie.genre === 'TV' ? 'tv' : 'movie';

  // Compute date display, days left, and styling
  const today = new Date();
  let dateLabel = year;
  let daysLeft = null;
  let isoTooltip = '';
  let isFuture = false;
  if (releaseDate) {
    const rd = new Date(releaseDate);
    if (!isNaN(rd)) {
      isoTooltip = rd.toISOString();
      if (rd > today) {
        isFuture = true;
        const diffMs = rd.setHours(0,0,0,0) - today.setHours(0,0,0,0);
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        dateLabel = rd.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
      } else {
        // Past or current day: show year only (already default)
      }
    }
  } else {
    dateLabel = 'TBD';
  }

  const daysBadgeColor = daysLeft != null
    ? (daysLeft <= 7 ? 'bg-red-600/80 text-white' : daysLeft <= 30 ? 'bg-yellow-500/80 text-black' : 'bg-green-600/70 text-white')
    : 'bg-gray-600/60 text-white';

  const handleImageError = (e) => {
    console.log('Image failed to load for movie:', title, 'Original src:', e.target.src);
    // Use a working placeholder service
    e.target.src = `https://placehold.co/300x450/374151/white?text=${encodeURIComponent(title.slice(0, 20))}`;
  };

  // Provide a fallback poster if none exists
  const posterUrl = poster && poster !== '/placeholder-movie.jpg' 
    ? poster 
    : `https://placehold.co/300x450/374151/white?text=${encodeURIComponent(title.slice(0, 20))}`;

  const targetId = movie.tmdbId || movie.id;

  return (
    <Link
      to={`/title/${targetId}`}
      className="glass-lite rounded-xl overflow-hidden block cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-red-400/50"
      aria-label={title}
    >
      <div className="relative overflow-hidden">
        <img 
          src={posterUrl} 
          alt={`${title} poster`} 
          className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1 truncate" title={title}>{title}</h3>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-gray-400 text-sm" title={isoTooltip || (dateLabel === 'TBD' ? 'Release date not yet announced' : '')}>{dateLabel}</p>
          {daysLeft != null && isFuture && (
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${daysBadgeColor}`}
              title={`${daysLeft} day${daysLeft === 1 ? '' : 's'} left until release`}
            >
              {daysLeft}d
            </span>
          )}
          {dateLabel === 'TBD' && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-600/60 text-white" title="Release date to be determined">TBD</span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block glass-primary text-white text-xs px-2 py-1 rounded-full">
            {genre.charAt(0).toUpperCase() + genre.slice(1)}
          </span>
          <span className="inline-block bg-white/10 text-white/80 text-[10px] px-2 py-1 rounded-full uppercase tracking-wide">
            {mediaType === 'tv' ? 'TV' : 'Movie'}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-yellow-400">
            <i className="fas fa-star"></i>
            <span className="font-medium text-white">{(rating * 2).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;