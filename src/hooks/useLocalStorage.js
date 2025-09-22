import { useState, useEffect } from 'react';

// Hook for managing localStorage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for managing theme (forced to dark/black theme)
export const useTheme = () => {
  const theme = 'dark';

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.documentElement.classList.add('dark');
  }, [theme]);

  const toggleTheme = () => {
    // Theme is permanently set to dark - no toggle functionality
  };

  return { theme, toggleTheme };
};

// Hook for managing user ratings
export const useUserRatings = () => {
  const [userRatings, setUserRatings] = useLocalStorage('cinerank-ratings', {});

  const rateMovie = (movieId, rating) => {
    setUserRatings(prev => ({
      ...prev,
      [movieId]: rating
    }));
  };

  const getUserRating = (movieId) => {
    return userRatings[movieId] || 0;
  };

  return { userRatings, rateMovie, getUserRating };
};

// Hook for managing user reviews
export const useUserReviews = () => {
  const [userReviews, setUserReviews] = useLocalStorage('cinerank-reviews', {});

  const addReview = (movieId, reviewText, rating) => {
    const review = {
      id: Date.now(),
      rating,
      text: reviewText,
      date: new Date().toISOString().split('T')[0],
      isUserReview: true
    };

    setUserReviews(prev => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), review]
    }));
  };

  const getUserReviews = (movieId) => {
    return userReviews[movieId] || [];
  };

  return { userReviews, addReview, getUserReviews };
};