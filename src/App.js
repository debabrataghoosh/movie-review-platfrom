import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MovieModal from './components/MovieModal';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import TopRatedPage from './pages/TopRatedPage';
import TvSeriesPage from './pages/TvSeriesPage';
import NewReleasesPage from './pages/NewReleasesPage';
import ReviewsPage from './pages/ReviewsPage';
import PeoplePage from './pages/PeoplePage';
import PersonDetailPage from './pages/PersonDetailPage';
import MovieDetailPage from './pages/MovieDetailPage';
import WishlistPage from './pages/WishlistPage';
import { MovieProvider } from './context/MovieContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import ErrorBoundary from './components/ErrorBoundary';
import { useTheme, useUserRatings, useUserReviews } from './hooks/useLocalStorage';
import './App.css';

function AppContent() {
  // State management
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom hooks
  const { theme, toggleTheme } = useTheme();
  const { rateMovie, getUserRating } = useUserRatings();
  const { addReview, getUserReviews } = useUserReviews();

  // Event handlers
  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const handleRateMovie = (movieId, rating) => {
    rateMovie(movieId, rating);
  };

  const handleAddReview = (movieId, reviewText, rating) => {
    addReview(movieId, reviewText, rating);
    if (rating > 0) {
      rateMovie(movieId, rating);
    }
  };

  return (
    <div className="App min-h-screen bg-black transition-colors duration-300">
      <Router>
        <Header />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage onMovieClick={handleMovieClick} getUserRating={getUserRating} />} />
            <Route path="/movies" element={<MoviesPage onMovieClick={handleMovieClick} getUserRating={getUserRating} />} />
            <Route path="/tv" element={<TvSeriesPage onMovieClick={handleMovieClick} getUserRating={getUserRating} />} />
            <Route path="/new" element={<NewReleasesPage onMovieClick={handleMovieClick} getUserRating={getUserRating} />} />
            <Route path="/top-rated" element={<TopRatedPage onMovieClick={handleMovieClick} getUserRating={getUserRating} />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/person/:id" element={<PersonDetailPage />} />
            <Route path="/title/:id" element={<MovieDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
          </Routes>
        </main>

        {isModalOpen && selectedMovie && (
          <MovieModal
            movie={selectedMovie}
            userRating={getUserRating(selectedMovie.id)}
            userReviews={getUserReviews(selectedMovie.id)}
            onClose={handleCloseModal}
            onRate={handleRateMovie}
            onAddReview={handleAddReview}
          />
        )}

        <Footer />
      </Router>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <MovieProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </MovieProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;