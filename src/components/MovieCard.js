import React from 'react';
import StarRating from './StarRating';

const MovieCard = ({ movie, userRating, onClick }) => {
  const { title, year, genre, poster, rating, ratingCount } = movie;

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x450/374151/white?text=' + encodeURIComponent(title);
  };

  return (
    <div 
      className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-500/50" 
      onClick={onClick} 
      role="button" 
      tabIndex={0}
    >
      <div className="relative overflow-hidden">
        <img 
          src={poster} 
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
          <div className="flex items-center gap-2">
            <StarRating rating={rating} />
            <span className="text-yellow-400 font-medium">{rating.toFixed(1)}</span>
          </div>
          {userRating > 0 && (
            <div className="text-sm">
              <small className="text-gray-400 block">Your rating:</small>
              <StarRating rating={userRating} size="small" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;