import axios from 'axios';

// OMDb API configuration
const OMDB_BASE_URL = 'http://www.omdbapi.com/';
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY || '5bb5262';

// Create axios instance
const omdbApi = axios.create({
  baseURL: OMDB_BASE_URL,
  params: {
    apikey: OMDB_API_KEY,
  },
});

// OMDb API service functions
export const omdbService = {
  // Get movie by IMDb ID
  getMovieByImdbId: async (imdbId) => {
    try {
      const response = await omdbApi.get('/', {
        params: { i: imdbId, plot: 'full' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie by IMDb ID:', error);
      throw error;
    }
  },

  // Get movie by title
  getMovieByTitle: async (title, year = null) => {
    try {
      const params = { t: title, plot: 'full' };
      if (year) params.y = year;
      
      const response = await omdbApi.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie by title:', error);
      throw error;
    }
  },

  // Search movies
  searchMovies: async (query, page = 1) => {
    try {
      const response = await omdbApi.get('/', {
        params: { 
          s: query, 
          page: page,
          type: 'movie'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  }
};

// Transform OMDb movie data to our format
export const transformOMDbMovie = (omdbMovie) => {
  if (!omdbMovie || omdbMovie.Response === 'False') {
    return null;
  }

  return {
    id: omdbMovie.imdbID,
    title: omdbMovie.Title,
    year: parseInt(omdbMovie.Year),
    genre: omdbMovie.Genre ? omdbMovie.Genre.split(', ')[0] : 'Unknown',
    poster: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : '/placeholder-movie.jpg',
    backdrop: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : '/placeholder-backdrop.jpg',
    plot: omdbMovie.Plot !== 'N/A' ? omdbMovie.Plot : 'No plot available',
    rating: omdbMovie.imdbRating !== 'N/A' ? parseFloat(omdbMovie.imdbRating) / 2 : 4.0,
    ratingCount: omdbMovie.imdbVotes !== 'N/A' ? parseInt(omdbMovie.imdbVotes.replace(/,/g, '')) : 0,
    releaseDate: omdbMovie.Released !== 'N/A' ? omdbMovie.Released : '',
    runtime: omdbMovie.Runtime !== 'N/A' ? omdbMovie.Runtime : '',
    director: omdbMovie.Director !== 'N/A' ? omdbMovie.Director : '',
    actors: omdbMovie.Actors !== 'N/A' ? omdbMovie.Actors : '',
    language: omdbMovie.Language !== 'N/A' ? omdbMovie.Language.split(', ')[0] : 'English',
    country: omdbMovie.Country !== 'N/A' ? omdbMovie.Country : '',
    awards: omdbMovie.Awards !== 'N/A' ? omdbMovie.Awards : '',
    boxOffice: omdbMovie.BoxOffice !== 'N/A' ? omdbMovie.BoxOffice : '',
    metascore: omdbMovie.Metascore !== 'N/A' ? omdbMovie.Metascore : '',
    reviews: []
  };
};

export default omdbService;