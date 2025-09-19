import axios from 'axios';

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
// You'll need to get your own API key from https://www.themoviedb.org/settings/api
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'your_api_key_here';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// API service functions
export const movieService = {
  // Get popular movies
  getPopularMovies: async (page = 1) => {
    try {
      const response = await tmdbApi.get('/movie/popular', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  // Get top rated movies
  getTopRatedMovies: async (page = 1) => {
    try {
      const response = await tmdbApi.get('/movie/top_rated', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      throw error;
    }
  },

  // Get now playing movies
  getNowPlayingMovies: async (page = 1) => {
    try {
      const response = await tmdbApi.get('/movie/now_playing', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      throw error;
    }
  },

  // Search movies
  searchMovies: async (query, page = 1) => {
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: { query, page }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'credits,reviews,videos'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  // Get movie reviews
  getMovieReviews: async (movieId, page = 1) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}/reviews`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie reviews:', error);
      throw error;
    }
  },

  // Get genres
  getGenres: async () => {
    try {
      const response = await tmdbApi.get('/genre/movie/list');
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },

  // Discover movies with filters
  discoverMovies: async (filters = {}, page = 1) => {
    try {
      const response = await tmdbApi.get('/discover/movie', {
        params: {
          page,
          sort_by: 'popularity.desc',
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw error;
    }
  }
};

// Utility functions for image URLs
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-movie.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Transform TMDB movie data to our format
export const transformTMDBMovie = (tmdbMovie) => {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    year: new Date(tmdbMovie.release_date).getFullYear(),
    genre: tmdbMovie.genre_ids?.[0] || tmdbMovie.genres?.[0]?.name || 'Unknown',
    poster: getImageUrl(tmdbMovie.poster_path),
    backdrop: getBackdropUrl(tmdbMovie.backdrop_path),
    plot: tmdbMovie.overview,
    rating: tmdbMovie.vote_average / 2, // Convert from 10 to 5 scale
    ratingCount: tmdbMovie.vote_count,
    releaseDate: tmdbMovie.release_date,
    originalLanguage: tmdbMovie.original_language,
    popularity: tmdbMovie.popularity,
    reviews: []
  };
};

// Fallback data when API is not available
export const fallbackMovies = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama",
    poster: "https://via.placeholder.com/500x750/2c3e50/white?text=Shawshank+Redemption",
    backdrop: "https://via.placeholder.com/1280x720/34495e/white?text=Shawshank+Redemption",
    plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    rating: 4.9,
    ratingCount: 2847,
    reviews: []
  },
  {
    id: 2,
    title: "The Dark Knight",
    year: 2008,
    genre: "Action",
    poster: "https://via.placeholder.com/500x750/1a1a1a/white?text=Dark+Knight",
    backdrop: "https://via.placeholder.com/1280x720/1a1a1a/white?text=Dark+Knight",
    plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.",
    rating: 4.8,
    ratingCount: 3421,
    reviews: []
  }
];

export default movieService;