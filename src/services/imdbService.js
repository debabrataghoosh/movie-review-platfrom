import axios from 'axios';

// RapidAPI IMDb configuration
const RAPIDAPI_BASE_URL = 'https://imdb8.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY || 'your_rapidapi_key_here';
const RAPIDAPI_HOST = process.env.REACT_APP_RAPIDAPI_HOST || 'imdb8.p.rapidapi.com';

// Create axios instance
const imdbApi = axios.create({
  baseURL: RAPIDAPI_BASE_URL,
  headers: {
    'X-RapidAPI-Host': RAPIDAPI_HOST,
    'X-RapidAPI-Key': RAPIDAPI_KEY
  },
});

// API service functions
export const movieService = {
  // Get popular movies (using auto-complete to get trending titles)
  getPopularMovies: async (page = 1) => {
    try {
      const response = await imdbApi.get('/auto-complete', {
        params: { q: 'popular' }
      });
      return {
        results: response.data.d || [],
        page: page,
        total_pages: 10,
        total_results: response.data.d ? response.data.d.length : 0
      };
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  // Get top rated movies (search for highly rated titles)
  getTopRatedMovies: async (page = 1) => {
    try {
      const response = await imdbApi.get('/auto-complete', {
        params: { q: 'top rated' }
      });
      return {
        results: response.data.d || [],
        page: page,
        total_pages: 10,
        total_results: response.data.d ? response.data.d.length : 0
      };
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      throw error;
    }
  },

  // Get now playing movies
  getNowPlayingMovies: async (page = 1) => {
    try {
      const response = await imdbApi.get('/auto-complete', {
        params: { q: 'new movies' }
      });
      return {
        results: response.data.d || [],
        page: page,
        total_pages: 10,
        total_results: response.data.d ? response.data.d.length : 0
      };
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      throw error;
    }
  },

  // Search movies
  searchMovies: async (query, page = 1) => {
    try {
      const response = await imdbApi.get('/auto-complete', {
        params: { q: query }
      });
      return {
        results: response.data.d || [],
        page: page,
        total_pages: 10,
        total_results: response.data.d ? response.data.d.length : 0
      };
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Get movie details by IMDb ID
  getMovieDetails: async (imdbId) => {
    try {
      // Get basic title info
      const response = await imdbApi.get('/title/get-overview-details', {
        params: { tconst: imdbId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  // Get movie reviews
  getMovieReviews: async (imdbId, page = 1) => {
    try {
      const response = await imdbApi.get('/title/get-reviews', {
        params: { 
          tconst: imdbId,
          limit: 25,
          offset: (page - 1) * 25
        }
      });
      return {
        results: response.data.reviews || [],
        page: page,
        total_pages: Math.ceil((response.data.totalReviews || 0) / 25),
        total_results: response.data.totalReviews || 0
      };
    } catch (error) {
      console.error('Error fetching movie reviews:', error);
      throw error;
    }
  },

  // Get genres (IMDb doesn't have a direct genres endpoint, so we'll use predefined)
  getGenres: async () => {
    try {
      // Return common movie genres as IMDb doesn't have a direct genres API
      return [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Adventure' },
        { id: 3, name: 'Animation' },
        { id: 4, name: 'Comedy' },
        { id: 5, name: 'Crime' },
        { id: 6, name: 'Documentary' },
        { id: 7, name: 'Drama' },
        { id: 8, name: 'Family' },
        { id: 9, name: 'Fantasy' },
        { id: 10, name: 'History' },
        { id: 11, name: 'Horror' },
        { id: 12, name: 'Music' },
        { id: 13, name: 'Mystery' },
        { id: 14, name: 'Romance' },
        { id: 15, name: 'Science Fiction' },
        { id: 16, name: 'TV Movie' },
        { id: 17, name: 'Thriller' },
        { id: 18, name: 'War' },
        { id: 19, name: 'Western' }
      ];
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },

  // Discover movies with filters (using search with genre terms)
  discoverMovies: async (filters = {}, page = 1) => {
    try {
      let query = 'movie';
      
      if (filters.genre) {
        query = filters.genre;
      }
      
      if (filters.year) {
        query += ` ${filters.year}`;
      }
      
      const response = await imdbApi.get('/auto-complete', {
        params: { q: query }
      });
      
      return {
        results: response.data.d || [],
        page: page,
        total_pages: 10,
        total_results: response.data.d ? response.data.d.length : 0
      };
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw error;
    }
  }
};

// Utility functions for image URLs
export const getImageUrl = (imageObj, size = 'medium') => {
  // Handle different possible image object structures
  if (imageObj) {
    if (typeof imageObj === 'string') {
      return imageObj;
    }
    if (imageObj.url) {
      return imageObj.url;
    }
    if (imageObj.imageUrl) {
      return imageObj.imageUrl;
    }
    if (imageObj.src) {
      return imageObj.src;
    }
  }
  return 'https://via.placeholder.com/300x450/374151/white?text=No+Image';
};

export const getBackdropUrl = (imageObj, size = 'large') => {
  // Handle different possible image object structures
  if (imageObj) {
    if (typeof imageObj === 'string') {
      return imageObj;
    }
    if (imageObj.url) {
      return imageObj.url;
    }
    if (imageObj.imageUrl) {
      return imageObj.imageUrl;
    }
    if (imageObj.src) {
      return imageObj.src;
    }
  }
  return 'https://via.placeholder.com/1280x720/374151/white?text=No+Image';
};

// Transform IMDb movie data to our format
export const transformIMDbMovie = (imdbMovie) => {
  // Handle different API response structures
  const movieData = {
    id: imdbMovie.id || imdbMovie.imdbID || `temp_${Date.now()}_${Math.random()}`,
    title: imdbMovie.l || imdbMovie.title || imdbMovie.originalTitle?.text || imdbMovie.s || 'Unknown Title',
    year: imdbMovie.y || imdbMovie.year || (imdbMovie.releaseYear ? imdbMovie.releaseYear.year : 2024),
    genre: imdbMovie.q || imdbMovie.genre || 'Movie',
    poster: getImageUrl(imdbMovie.i || imdbMovie.image || imdbMovie.poster),
    backdrop: getBackdropUrl(imdbMovie.i || imdbMovie.image || imdbMovie.backdrop),
    plot: imdbMovie.plot?.plotText?.text || imdbMovie.plotSummary?.text || imdbMovie.overview || 'Plot information not available',
    // Prefer precomputed/enriched fields if present (e.g., from OMDb), otherwise fallback to IMDb ratingsSummary
    rating: typeof imdbMovie.rating === 'number'
      ? imdbMovie.rating
      : (imdbMovie.ratingsSummary && typeof imdbMovie.ratingsSummary.aggregateRating === 'number')
        ? (imdbMovie.ratingsSummary.aggregateRating / 2)
        : 4.0,
    ratingCount: typeof imdbMovie.ratingCount === 'number'
      ? imdbMovie.ratingCount
      : (imdbMovie.ratingsSummary && typeof imdbMovie.ratingsSummary.voteCount === 'number')
        ? imdbMovie.ratingsSummary.voteCount
        : Math.floor(Math.random() * 1000) + 100,
    releaseDate: imdbMovie.releaseDate || imdbMovie.release_date || '',
    originalLanguage: imdbMovie.spokenLanguages?.[0]?.id || 'en',
    popularity: imdbMovie.popularity || Math.random() * 100,
    reviews: []
  };
  
  console.log('Transformed IMDb movie:', movieData);
  return movieData;
};

// Fallback data when API is not available
export const fallbackMovies = [
  {
    id: 'tt0111161',
    title: "The Shawshank Redemption",
    year: 1994,
    genre: "Drama",
    poster: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
    plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    rating: 4.9,
    ratingCount: 2847,
    reviews: []
  },
  {
    id: 'tt0468569',
    title: "The Dark Knight",
    year: 2008,
    genre: "Action",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.",
    rating: 4.8,
    ratingCount: 3421,
    reviews: []
  },
  {
    id: 'tt0108052',
    title: "Schindler's List",
    year: 1993,
    genre: "Drama",
    poster: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    plot: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
    rating: 4.9,
    ratingCount: 1853,
    reviews: []
  },
  {
    id: 'tt0167260',
    title: "The Lord of the Rings: The Return of the King",
    year: 2003,
    genre: "Fantasy",
    poster: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWI5MTktXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    backdrop: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWI5MTktXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    plot: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
    rating: 4.8,
    ratingCount: 2156,
    reviews: []
  }
];

export default movieService;