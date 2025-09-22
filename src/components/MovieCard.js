import React from 'react';
// Removed multi-star rating display for cards; we'll show a single star icon with numeric rating.

const MovieCard = ({ movie, userRating, onClick }) => {
  const { title, year, genre, poster, rating, ratingCount } = movie;

  const handleImageError = (e) => {
    console.log('Image failed to load for movie:', title, 'Original src:', e.target.src);
    // Use a working placeholder service
    e.target.src = `https://placehold.co/300x450/374151/white?text=${encodeURIComponent(title.slice(0, 20))}`;
  };

  // Provide a fallback poster if none exists
  const posterUrl = poster && poster !== '/placeholder-movie.jpg' 
    ? poster 
    : `https://placehold.co/300x450/374151/white?text=${encodeURIComponent(title.slice(0, 20))}`;

  return (
    <div 
      className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-500/50" 
      onClick={onClick} 
      role="button" 
      tabIndex={0}
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
        <h3 className="text-white font-semibold text-lg mb-1 truncate">{title}</h3>
        <p className="text-gray-400 text-sm mb-2">{year}</p>
        <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mb-3">
          {genre.charAt(0).toUpperCase() + genre.slice(1)}
        </span>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-yellow-400">
            <i className="fas fa-star"></i>
            <span className="font-medium text-white">{(rating * 2).toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;