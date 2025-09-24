import React, { useState, useEffect } from 'react';
import { computeReleaseMeta } from '../utils/releaseMeta';
import StarRating from './StarRating';

const MovieModal = ({ 
  movie, 
  userRating, 
  userReviews, 
  onClose, 
  onRate, 
  onAddReview 
}) => {
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [currentUserRating, setCurrentUserRating] = useState(userRating);

  // Combine original reviews with user reviews
  const allReviews = [...movie.reviews, ...userReviews];

  useEffect(() => {
    setCurrentUserRating(userRating);
  }, [userRating]);

  // Handle clicking outside modal to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRatingChange = (rating) => {
    setCurrentUserRating(rating);
    onRate(movie.id, rating);
  };

  const handleSubmitReview = () => {
    if (reviewText.trim()) {
      onAddReview(movie.id, reviewText.trim(), reviewRating);
      setReviewText('');
      setReviewRating(0);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const { dateLabel, daysLeft, isFuture, iso, badgeColor } = computeReleaseMeta(movie.releaseDate, movie.year);

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="modal-header">
          <img 
            src={movie.poster} 
            alt={`${movie.title} poster`} 
            className="modal-poster"
          />
          <div className="modal-info">
            <h2>{movie.title}</h2>
            <div className="modal-year flex items-center gap-2" title={iso || (dateLabel==='TBD' ? 'Release date not yet announced' : '')}>
              <span>{dateLabel}</span>
              {isFuture && daysLeft != null && (
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${badgeColor}`} title={`${daysLeft} day${daysLeft===1?'':'s'} left`}>{daysLeft}d</span>
              )}
              {dateLabel==='TBD' && (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-600/60 text-white" title="Release date to be determined">TBD</span>
              )}
            </div>
            <p className="modal-genre">
              {movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}
            </p>
            <div className="modal-rating">
              <StarRating rating={movie.rating} />
              <span className="rating-count">
                {(movie.rating * 2).toFixed(1)} / 10 {movie.ratingCount ? `(${movie.ratingCount.toLocaleString()} votes)` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="plot-section">
            <h3>Plot</h3>
            <p>{movie.plot}</p>
          </div>

          <div className="user-rating-section">
            <h3>Rate This Movie</h3>
            <StarRating 
              rating={currentUserRating}
              interactive={true}
              onRatingChange={handleRatingChange}
            />
            <p className="rating-text">
              {currentUserRating > 0 
                ? `You rated this movie ${currentUserRating} star${currentUserRating !== 1 ? 's' : ''}` 
                : 'Click to rate'
              }
            </p>
          </div>

          <div className="review-section">
            <h3>Write a Review</h3>
            <div className="review-form">
              <div className="review-rating-input">
                <label>Your rating for this review:</label>
                <StarRating 
                  rating={reviewRating}
                  interactive={true}
                  onRatingChange={setReviewRating}
                />
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                maxLength={500}
                rows={4}
              />
              <div className="review-actions">
                <small>{reviewText.length}/500 characters</small>
                <button 
                  onClick={handleSubmitReview}
                  className="submit-btn"
                  disabled={!reviewText.trim()}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>

          <div className="reviews-display">
            <h3>Reviews ({allReviews.length})</h3>
            {allReviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="reviews-list">
                {allReviews.map((review) => (
                  <div key={review.id} className={`review-item ${review.isUserReview ? 'user-review' : ''}`}>
                    <div className="review-header">
                      <div className="review-rating-stars">
                        <StarRating rating={review.rating} />
                        {review.isUserReview && <span className="user-badge">Your review</span>}
                      </div>
                      <span className="review-date">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <p className="review-text">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;