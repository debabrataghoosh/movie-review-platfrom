import React from 'react';
import { useUserReviews } from '../hooks/useLocalStorage';

const ReviewsPage = () => {
  const { userReviews } = useUserReviews();

  // Get all user reviews across all movies
  const allReviews = Object.entries(userReviews).reduce((acc, [movieId, reviews]) => {
    const reviewsWithMovieId = reviews.map(review => ({
      ...review,
      movieId: parseInt(movieId)
    }));
    return [...acc, ...reviewsWithMovieId];
  }, []).sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fas fa-star ${
          i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Reviews
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            All the reviews you've written
          </p>
        </div>

        {allReviews.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-pen-alt text-6xl text-gray-400 mb-6"></i>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Start watching movies and share your thoughts!
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 rounded-xl glass-primary text-white font-medium"
            >
              <i className="fas fa-film mr-2"></i>
              Discover Movies
            </a>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {allReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Movie ID: {review.movieId}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {review.rating}/5 stars
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(review.date)}
                  </div>
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.text}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium glass-button text-white">
                    <i className="fas fa-user mr-1"></i>
                    Your Review
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;