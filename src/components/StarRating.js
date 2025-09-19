import React, { useState } from 'react';

const StarRating = ({ 
  rating = 0, 
  maxStars = 5, 
  size = 'normal', 
  interactive = false, 
  onRatingChange 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const getStarClass = (starIndex) => {
    const currentRating = interactive && hoverRating ? hoverRating : rating;
    return currentRating >= starIndex ? 'fas fa-star' : 'far fa-star';
  };

  const handleStarClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  const handleStarHover = (starIndex) => {
    if (interactive) {
      setHoverRating(starIndex);
    }
  };

  const handleStarLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const sizeClass = size === 'small' ? 'rating-stars-small' : 'rating-stars';

  return (
    <div className={`rating-stars ${sizeClass}`}>
      {[...Array(maxStars)].map((_, index) => {
        const starIndex = index + 1;
        return (
          <i
            key={index}
            className={getStarClass(starIndex)}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleStarHover(starIndex)}
            onMouseLeave={handleStarLeave}
            style={{ 
              cursor: interactive ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;