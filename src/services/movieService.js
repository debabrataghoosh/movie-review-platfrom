import { movieService as imdbService, transformIMDbMovie } from './imdbService';
import { omdbService, transformOMDbMovie } from './omdbService';

// Helper: enrich raw IMDb search/list items with OMDb rating data
const enhanceWithOMDbDetails = async (items, limit = 12) => {
  try {
    const slice = Array.isArray(items) ? items.slice(0, limit) : [];
    const rest = Array.isArray(items) ? items.slice(limit) : [];

    const results = await Promise.allSettled(
      slice.map(async (it) => {
        try {
          const imdbId = it.id || it.imdbID || '';
          if (typeof imdbId === 'string' && imdbId.startsWith('tt')) {
            const omdb = await omdbService.getMovieByImdbId(imdbId);
            if (omdb && omdb.Response === 'True') {
              const rating10 = parseFloat(omdb.imdbRating);
              const rating = isNaN(rating10) ? undefined : rating10 / 2; // convert 10->5
              const ratingCount = omdb.imdbVotes ? parseInt(omdb.imdbVotes.replace(/,/g, ''), 10) : undefined;
              return {
                ...it,
                // attach enriched fields; transformIMDbMovie will prefer these
                rating: typeof rating === 'number' ? rating : it.rating,
                ratingCount: typeof ratingCount === 'number' ? ratingCount : it.ratingCount,
                // Prefer higher quality poster if available
                poster: (omdb.Poster && omdb.Poster !== 'N/A') ? omdb.Poster : it.poster,
              };
            }
          }
        } catch (e) {
          // ignore per-item failure
        }
        return it;
      })
    );

    const enriched = results.map(r => r.status === 'fulfilled' ? r.value : items[0]).filter(Boolean);
    return [...enriched, ...rest];
  } catch (e) {
    return items;
  }
};

// Combined movie service that uses both IMDb and OMDb APIs
export const combinedMovieService = {
  // Get popular movies (using IMDb)
  getPopularMovies: async (page = 1) => {
    try {
      const base = await imdbService.getPopularMovies(page);
      const enhanced = await enhanceWithOMDbDetails(base.results);
      return { ...base, results: enhanced };
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  // Get top rated movies (using IMDb)
  getTopRatedMovies: async (page = 1) => {
    try {
      const base = await imdbService.getTopRatedMovies(page);
      const enhanced = await enhanceWithOMDbDetails(base.results);
      return { ...base, results: enhanced };
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      throw error;
    }
  },

  // Get now playing movies (using IMDb)
  getNowPlayingMovies: async (page = 1) => {
    try {
      const base = await imdbService.getNowPlayingMovies(page);
      const enhanced = await enhanceWithOMDbDetails(base.results);
      return { ...base, results: enhanced };
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      throw error;
    }
  },

  // Search movies (try both APIs for better results)
  searchMovies: async (query, page = 1) => {
    try {
      // First try IMDb search
      const imdbResults = await imdbService.searchMovies(query, page);
      // Enrich IMDb results with real IMDb ratings via OMDb details
      const enrichedImdb = {
        ...imdbResults,
        results: await enhanceWithOMDbDetails(imdbResults.results)
      };
      
      // Also try OMDb search for additional results
      try {
        const omdbResults = await omdbService.searchMovies(query, page);
        
        if (omdbResults.Response === 'True' && omdbResults.Search) {
          // Transform OMDb results and merge with IMDb results
          const transformedOMDbResults = omdbResults.Search
            .map(movie => transformOMDbMovie({
              imdbID: movie.imdbID,
              Title: movie.Title,
              Year: movie.Year,
              Type: movie.Type,
              Poster: movie.Poster
            }))
            .filter(movie => movie !== null);

          // Combine results (avoiding duplicates by IMDb ID)
          const combinedResults = [...enrichedImdb.results];
          const existingIds = new Set(enrichedImdb.results.map(movie => movie.id));
          
          transformedOMDbResults.forEach(omdbMovie => {
            if (!existingIds.has(omdbMovie.id)) {
              combinedResults.push(omdbMovie);
            }
          });

          return {
            results: combinedResults,
            page: page,
            total_pages: Math.max(enrichedImdb.total_pages || 1, Math.ceil(parseInt(omdbResults.totalResults || '0') / 10)),
            total_results: (enrichedImdb.total_results || 0) + parseInt(omdbResults.totalResults || '0')
          };
        }
      } catch (omdbError) {
        console.warn('OMDb search failed, using only IMDb results:', omdbError);
      }
      
      return enrichedImdb;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Get movie details (enhanced with both APIs)
  getMovieDetails: async (movieId) => {
    try {
      let movieDetails = null;
      
      // Try to get details from OMDb first (more detailed info)
      if (movieId.startsWith('tt')) {
        try {
          const omdbMovie = await omdbService.getMovieByImdbId(movieId);
          if (omdbMovie.Response === 'True') {
            movieDetails = transformOMDbMovie(omdbMovie);
          }
        } catch (omdbError) {
          console.warn('OMDb details failed, trying IMDb:', omdbError);
        }
      }
      
      // Fallback to IMDb if OMDb fails or for non-IMDb IDs
      if (!movieDetails) {
        const imdbMovie = await imdbService.getMovieDetails(movieId);
        movieDetails = transformIMDbMovie(imdbMovie);
      }
      
      return movieDetails;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  // Get movie reviews (using IMDb)
  getMovieReviews: async (movieId, page = 1) => {
    try {
      return await imdbService.getMovieReviews(movieId, page);
    } catch (error) {
      console.error('Error fetching movie reviews:', error);
      throw error;
    }
  },

  // Get genres (using IMDb)
  getGenres: async () => {
    try {
      return await imdbService.getGenres();
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },

  // Discover movies with filters
  discoverMovies: async (filters = {}, page = 1) => {
    try {
      // Use IMDb for discovery
      const imdbResults = await imdbService.discoverMovies(filters, page);
      
      // Enhance results with OMDb data for better details
      const enhancedResults = await Promise.allSettled(
        imdbResults.results.map(async (movie) => {
          if (movie.id && movie.id.startsWith('tt')) {
            try {
              const omdbMovie = await omdbService.getMovieByImdbId(movie.id);
              if (omdbMovie.Response === 'True') {
                const enhancedMovie = transformOMDbMovie(omdbMovie);
                return enhancedMovie || movie;
              }
            } catch (error) {
              console.warn(`Failed to enhance movie ${movie.id} with OMDb:`, error);
            }
          }
          return movie;
        })
      );
      
      const finalResults = enhancedResults
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      return {
        ...imdbResults,
        results: finalResults
      };
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw error;
    }
  },

  // Enhanced search by title (using OMDb for precise matches)
  searchByTitle: async (title, year = null) => {
    try {
      return await omdbService.getMovieByTitle(title, year);
    } catch (error) {
      console.error('Error searching by title:', error);
      throw error;
    }
  }
};

// Export combined service as default movie service
export const movieService = combinedMovieService;

// Export transform functions
export { transformIMDbMovie, transformOMDbMovie };

// Export fallback data
export { fallbackMovies } from './imdbService';

export default combinedMovieService;