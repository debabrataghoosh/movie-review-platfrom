import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { movieService, transformIMDbMovie, transformOMDbMovie, fallbackMovies } from '../services/movieService';

// Initial state
const initialState = {
  movies: [],
  topRatedMovies: [],
  nowPlayingMovies: [],
  searchResults: [],
  selectedMovie: null,
  genres: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  searchQuery: '',
  filters: {
    genre: '',
    year: '',
    rating: ''
  }
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_MOVIES: 'SET_MOVIES',
  SET_TOP_RATED_MOVIES: 'SET_TOP_RATED_MOVIES',
  SET_NOW_PLAYING_MOVIES: 'SET_NOW_PLAYING_MOVIES',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SELECTED_MOVIE: 'SET_SELECTED_MOVIE',
  SET_GENRES: 'SET_GENRES',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_TOTAL_PAGES: 'SET_TOTAL_PAGES',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_SEARCH: 'CLEAR_SEARCH'
};

// Reducer
const movieReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actionTypes.SET_MOVIES:
      return { 
        ...state, 
        movies: action.payload.append ? [...state.movies, ...action.payload.movies] : action.payload.movies,
        loading: false,
        error: null
      };
    case actionTypes.SET_TOP_RATED_MOVIES:
      return { ...state, topRatedMovies: action.payload, loading: false };
    case actionTypes.SET_NOW_PLAYING_MOVIES:
      return { ...state, nowPlayingMovies: action.payload, loading: false };
    case actionTypes.SET_SEARCH_RESULTS:
      return { 
        ...state, 
        searchResults: action.payload.append ? [...state.searchResults, ...action.payload.movies] : action.payload.movies,
        loading: false 
      };
    case actionTypes.SET_SELECTED_MOVIE:
      return { ...state, selectedMovie: action.payload };
    case actionTypes.SET_GENRES:
      return { ...state, genres: action.payload };
    case actionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case actionTypes.SET_TOTAL_PAGES:
      return { ...state, totalPages: action.payload };
    case actionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    case actionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case actionTypes.CLEAR_SEARCH:
      return { ...state, searchResults: [], searchQuery: '', currentPage: 1 };
    default:
      return state;
  }
};

// Create context
const MovieContext = createContext();

// Context provider component
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    // Fetch popular movies
    fetchPopularMovies: async (page = 1, append = false) => {
      try {
        if (!append) actions.setLoading(true);
        
        console.log('Attempting to fetch popular movies from API...');
        const response = await movieService.getPopularMovies(page);
        console.log('API Response:', response);
        
        if (response && response.results && response.results.length > 0) {
          const movies = response.results.map(transformIMDbMovie);
          console.log('Transformed movies:', movies);
          
          dispatch({ 
            type: actionTypes.SET_MOVIES, 
            payload: { movies, append } 
          });
          dispatch({ type: actionTypes.SET_TOTAL_PAGES, payload: response.total_pages });
          dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page });
        } else {
          throw new Error('No movie data received from API');
        }
      } catch (error) {
        console.error('Failed to fetch movies, using fallback data:', error);
        console.log('Using fallback movies:', fallbackMovies);
        dispatch({ 
          type: actionTypes.SET_MOVIES, 
          payload: { movies: fallbackMovies, append: false } 
        });
      } finally {
        actions.setLoading(false);
      }
    },

    // Fetch top rated movies
    fetchTopRatedMovies: async () => {
      try {
        actions.setLoading(true);
        const response = await movieService.getTopRatedMovies();
        const movies = response.results.map(transformIMDbMovie);
        dispatch({ type: actionTypes.SET_TOP_RATED_MOVIES, payload: movies });
      } catch (error) {
        actions.setError('Failed to fetch top rated movies');
      }
    },

    // Fetch now playing movies
    fetchNowPlayingMovies: async () => {
      try {
        const response = await movieService.getNowPlayingMovies();
        const movies = response.results.map(transformIMDbMovie);
        dispatch({ type: actionTypes.SET_NOW_PLAYING_MOVIES, payload: movies });
      } catch (error) {
        console.error('Failed to fetch now playing movies:', error);
      }
    },

    // Search movies
    searchMovies: async (query, page = 1, append = false) => {
      if (!query.trim()) {
        dispatch({ type: actionTypes.CLEAR_SEARCH });
        return;
      }

      try {
        if (!append) actions.setLoading(true);
        
        const response = await movieService.searchMovies(query, page);
        const movies = response.results.map(transformIMDbMovie);
        
        dispatch({ 
          type: actionTypes.SET_SEARCH_RESULTS, 
          payload: { movies, append } 
        });
        dispatch({ type: actionTypes.SET_SEARCH_QUERY, payload: query });
        dispatch({ type: actionTypes.SET_TOTAL_PAGES, payload: response.total_pages });
        dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page });
      } catch (error) {
        actions.setError('Failed to search movies');
      }
    },

    // Get movie details
    fetchMovieDetails: async (movieId) => {
      try {
        actions.setLoading(true);
        const movie = await movieService.getMovieDetails(movieId);
        const transformedMovie = transformIMDbMovie(movie);
        dispatch({ type: actionTypes.SET_SELECTED_MOVIE, payload: transformedMovie });
      } catch (error) {
        actions.setError('Failed to fetch movie details');
      }
    },

    // Fetch genres
    fetchGenres: async () => {
      try {
        const genres = await movieService.getGenres();
        dispatch({ type: actionTypes.SET_GENRES, payload: genres });
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    },

    // Discover movies with filters
    discoverMovies: async (filters, page = 1, append = false) => {
      try {
        if (!append) actions.setLoading(true);
        
        const response = await movieService.discoverMovies(filters, page);
        const movies = response.results.map(transformIMDbMovie);
        
        dispatch({ 
          type: actionTypes.SET_MOVIES, 
          payload: { movies, append } 
        });
        dispatch({ type: actionTypes.SET_TOTAL_PAGES, payload: response.total_pages });
        dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: page });
      } catch (error) {
        actions.setError('Failed to discover movies');
      }
    },

    // Set filters
    setFilters: (filters) => {
      dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
    },

    // Clear search
    clearSearch: () => {
      dispatch({ type: actionTypes.CLEAR_SEARCH });
    },

    // Set selected movie
    setSelectedMovie: (movie) => {
      dispatch({ type: actionTypes.SET_SELECTED_MOVIE, payload: movie });
    }
  };

  // Load initial data
  useEffect(() => {
    actions.fetchPopularMovies();
    actions.fetchGenres();
    actions.fetchNowPlayingMovies();
  }, []);

  return (
    <MovieContext.Provider value={{ state, actions }}>
      {children}
    </MovieContext.Provider>
  );
};

// Custom hook to use movie context
export const useMovieContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider');
  }
  return context;
};

export default MovieContext;