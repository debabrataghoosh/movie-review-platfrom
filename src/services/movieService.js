import { buildTmdbImageUrl, tmdbClient } from './tmdbService';

// Transform TMDB item to the app's normalized movie shape
export const transformIMDbMovie = (item) => {
  if (!item) return null;
  const mediaType = item.media_type || (item.name ? 'tv' : 'movie');
  const title = item.title || item.name || 'Unknown Title';
  const date = item.release_date || item.first_air_date || '';
  const year = date ? parseInt(String(date).slice(0, 4), 10) : undefined;
  const poster = buildTmdbImageUrl(item.poster_path, 'w780') || 'https://via.placeholder.com/300x450/374151/ffffff?text=No+Image';
  const backdrop = buildTmdbImageUrl(item.backdrop_path, 'original') || '';
  const rating10 = typeof item.vote_average === 'number' ? item.vote_average : undefined;
  const rating = typeof rating10 === 'number' ? rating10 / 2 : 4.0;
  const ratingCount = typeof item.vote_count === 'number' ? item.vote_count : Math.floor(Math.random() * 1000) + 100;
  return {
    id: String(item.id ?? `tmdb_${Date.now()}`),
    tmdbId: item.id, // preserve original TMDB numeric id separately for routing
  imdbId: item.imdb_id || item?.external_ids?.imdb_id || '',
    title,
    year: year || 2024,
    genre: mediaType === 'tv' ? 'TV' : 'Movie',
    genreIds: Array.isArray(item.genre_ids) ? item.genre_ids : (Array.isArray(item.genres) ? item.genres.map(g=>g.id) : []),
    poster,
    backdrop,
    plot: item.overview || 'Plot information not available',
    rating,
    ratingCount,
    releaseDate: date,
    originalLanguage: item.original_language || 'en',
    popularity: item.popularity || 0,
    reviews: []
  };
};

// TMDB-only service implementing the same interface
export const combinedMovieService = {
  getPopularMovies: async (page = 1) => {
    const resp = (await tmdbClient.get('/movie/popular', { params: { page } })).data;
    return { results: resp.results || [], page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getTopRatedMovies: async (page = 1) => {
    const resp = (await tmdbClient.get('/movie/top_rated', { params: { page } })).data;
    return { results: resp.results || [], page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getTrendingMoviesWeek: async (page = 1) => {
    const resp = (await tmdbClient.get('/trending/movie/week', { params: { page } })).data;
    return { results: resp.results || [], page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },
  
  // Mixed media trending (all) day & week
  getTrendingAllDay: async (page = 1) => {
    const resp = (await tmdbClient.get('/trending/all/day', { params: { page } })).data;
    // ensure each item carries media_type
    const results = (resp.results || []).map(r => ({ ...r, media_type: r.media_type || (r.name ? 'tv' : 'movie') }));
    return { results, page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getTrendingAllWeek: async (page = 1) => {
    const resp = (await tmdbClient.get('/trending/all/week', { params: { page } })).data;
    const results = (resp.results || []).map(r => ({ ...r, media_type: r.media_type || (r.name ? 'tv' : 'movie') }));
    return { results, page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getUpcomingMovies: async (page = 1) => {
    const resp = (await tmdbClient.get('/movie/upcoming', { params: { page, include_adult: false, region: 'US' } })).data;
    return { results: resp.results || [], page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  // Popular TV shows
  getPopularTvShows: async (page = 1) => {
    const resp = (await tmdbClient.get('/tv/popular', { params: { page } })).data;
    // Normalize results to include media_type for transformer
    const results = (resp.results || []).map(r => ({ ...r, media_type: r.media_type || 'tv' }));
    return { results, page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getTopRatedTvShows: async (page = 1) => {
    const resp = (await tmdbClient.get('/tv/top_rated', { params: { page } })).data;
    const results = (resp.results || []).map(r => ({ ...r, media_type: 'tv' }));
    return { results, page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getTrendingTvWeek: async (page = 1) => {
    const resp = (await tmdbClient.get('/trending/tv/week', { params: { page } })).data;
    const results = (resp.results || []).map(r => ({ ...r, media_type: 'tv' }));
    return { results, page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getAiringToday: async (page = 1) => {
    const resp = (await tmdbClient.get('/tv/airing_today', { params: { page } })).data;
    const results = (resp.results || []).map(r => ({ ...r, media_type: 'tv' }));
    return { results, page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getOnTheAir: async (page = 1) => {
    const resp = (await tmdbClient.get('/tv/on_the_air', { params: { page } })).data;
    const results = (resp.results || []).map(r => ({ ...r, media_type: 'tv' }));
    return { results, page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  getNowPlayingMovies: async (page = 1) => {
    const resp = (await tmdbClient.get('/movie/now_playing', { params: { page } })).data;
    return { results: resp.results || [], page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },

  searchMovies: async (query, page = 1) => {
    // Use TMDB multi-search so TV shows appear too
    const r = await tmdbClient.get('/search/multi', {
      params: { query, page, include_adult: false }
    });
    const results = (r.data.results || []).filter(it => it.media_type === 'movie' || it.media_type === 'tv');
    return { results, page: r.data.page, total_pages: r.data.total_pages, total_results: r.data.total_results };
  },

  // Multi search across movies, TV, and people (for autocomplete suggestions)
  multiSearch: async (query, page = 1) => {
    if (!query || !String(query).trim()) {
      return { results: [], page: 1, total_pages: 1, total_results: 0 };
    }
    const r = await tmdbClient.get('/search/multi', {
      params: { query, page, include_adult: false }
    });
    const results = (r.data.results || []).filter(it => ['movie', 'tv', 'person'].includes(it.media_type));
    return { results, page: r.data.page, total_pages: r.data.total_pages, total_results: r.data.total_results };
  },

  getMovieDetails: async (tmdbId) => {
    // Try movie then TV, include external_ids so we can map IMDb
    try {
      const r = await tmdbClient.get(`/movie/${tmdbId}`, { params: { append_to_response: 'videos,images,credits,external_ids' } });
      return r.data;
    } catch {}
    const r2 = await tmdbClient.get(`/tv/${tmdbId}`, { params: { append_to_response: 'videos,images,credits,external_ids' } });
    return r2.data;
  },

  getRecommendations: async (tmdbId, mediaType = 'movie') => {
    // Try appropriate endpoint; fallback to opposite
    try {
      const r = await tmdbClient.get(`/${mediaType}/${tmdbId}/recommendations`);
      return r.data?.results || [];
    } catch {
      try {
        const alt = mediaType === 'movie' ? 'tv' : 'movie';
        const r2 = await tmdbClient.get(`/${alt}/${tmdbId}/recommendations`);
        return r2.data?.results || [];
      } catch {
        return [];
      }
    }
  },

  getMovieReviews: async (tmdbId, page = 1) => {
    try {
      const r = await tmdbClient.get(`/movie/${tmdbId}/reviews`, { params: { page } });
      return r.data;
    } catch {}
    const r2 = await tmdbClient.get(`/tv/${tmdbId}/reviews`, { params: { page } });
    return r2.data;
  },

  getGenres: async () => {
    const [gm, gt] = await Promise.all([
      tmdbClient.get('/genre/movie/list'),
      tmdbClient.get('/genre/tv/list'),
    ]);
    const merge = [...(gm.data.genres || []), ...(gt.data.genres || [])];
    return merge;
  },

  discoverMovies: async (filters = {}, page = 1) => {
    const params = { page, include_adult: false, sort_by: 'popularity.desc', ...filters };
    const r = await tmdbClient.get('/discover/movie', { params });
    return { results: r.data.results || [], page: r.data.page, total_pages: r.data.total_pages, total_results: r.data.total_results };
  },

  // Discover TV shows (parallels discoverMovies but for /discover/tv)
  discoverTvShows: async (filters = {}, page = 1) => {
    const params = { page, include_adult: false, ...filters };
    const r = await tmdbClient.get('/discover/tv', { params });
    const results = (r.data.results || []).map(r => ({ ...r, media_type: r.media_type || 'tv' }));
    return { results, page: r.data.page, total_pages: r.data.total_pages, total_results: r.data.total_results };
  },

  searchByTitle: async (title, year = null) => {
    const params = { query: title };
    if (year) params.year = year;
    const r = await tmdbClient.get('/search/movie', { params });
    return r.data;
  },

  // People (Celebrities)
  getPopularPeople: async (page = 1) => {
    const resp = (await tmdbClient.get('/person/popular', { params: { page } })).data;
    return { results: resp.results || [], page: resp.page, total_pages: resp.total_pages, total_results: resp.total_results };
  },
  getPersonDetails: async (personId) => {
    const resp = (await tmdbClient.get(`/person/${personId}`, { params: { append_to_response: 'images,external_ids' } })).data;
    return resp;
  },
  getPersonCombinedCredits: async (personId) => {
    const resp = (await tmdbClient.get(`/person/${personId}/combined_credits`)).data;
    return resp;
  }
};

export const movieService = combinedMovieService;

// Provide transform symbols to callers; now they transform TMDB items
// Temporary: also export a no-op for OMDb to satisfy imports
export const transformOMDbMovie = (x) => x;

// Fallback data (minimal)
export const fallbackMovies = [
  { id: 1, title: 'Fallback Movie', year: 2024, genre: 'Movie', poster: '/placeholder-movie.jpg', backdrop: '/placeholder-backdrop.jpg', plot: 'No plot', rating: 4.0, ratingCount: 100 }
];

export default combinedMovieService;