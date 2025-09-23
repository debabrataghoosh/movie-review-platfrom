import axios from 'axios';

// TMDB API configuration (v3 key)
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

const tmdb = axios.create({ baseURL: TMDB_BASE_URL });

// Apply static defaults once at init
(() => {
  const v4 = process.env.REACT_APP_TMDB_BEARER;
  const v3 = TMDB_API_KEY;
  if (v4) {
    tmdb.defaults.headers.common = tmdb.defaults.headers.common || {};
    tmdb.defaults.headers.common['Authorization'] = `Bearer ${v4}`;
  } else if (v3) {
    tmdb.defaults.params = { ...(tmdb.defaults.params || {}), api_key: v3 };
  }
  if (process.env.NODE_ENV === 'development') {
    if (!v4 && !v3) {
      // eslint-disable-next-line no-console
      console.warn('[TMDB] No credentials found. Set REACT_APP_TMDB_BEARER or REACT_APP_TMDB_API_KEY in .env');
    }
  }
})();

// Attach API credentials automatically to every TMDB request
tmdb.interceptors.request.use((config) => {
  const v4 = process.env.REACT_APP_TMDB_BEARER;
  const v3 = TMDB_API_KEY;
  config.headers = config.headers || {};
  config.params = config.params || {};
  if (v4) {
    config.headers.Authorization = `Bearer ${v4}`;
  } else if (v3) {
    // Fall back to v3 api_key query param
    if (!('api_key' in config.params)) {
      config.params.api_key = v3;
    }
  } else {
    // Helpful console for missing credentials
    // eslint-disable-next-line no-console
    console.warn('TMDB credentials missing: set REACT_APP_TMDB_API_KEY or REACT_APP_TMDB_BEARER in .env');
  }
  return config;
});

// Response interceptor: if bearer token is invalid (401), retry once with v3 key
tmdb.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (response && response.status === 401) {
      const hasBearer = !!process.env.REACT_APP_TMDB_BEARER;
      const v3 = TMDB_API_KEY;
      const canRetry = hasBearer && v3 && !config.__retriedWithV3;
      if (canRetry) {
        // eslint-disable-next-line no-console
        console.warn('[TMDB] 401 with bearer token. Retrying request using v3 api_key fallback.');
        config.__retriedWithV3 = true; // mark to avoid infinite loop
        // Remove bearer auth & inject api_key param
        if (config.headers && config.headers.Authorization) delete config.headers.Authorization;
        config.params = config.params || {};
        config.params.api_key = v3;
        try {
          return await tmdb(config);
        } catch (e) {
          // propagate the second error
          return Promise.reject(e);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const buildTmdbImageUrl = (filePath, size = 'original') => {
  if (!filePath) return '';
  return `${TMDB_IMAGE_BASE}/${size}${filePath}`;
};

// Try to normalize titles like "Title: Part 2 - Arc" -> "Title"
const normalizeTitle = (t) => {
  if (!t) return t;
  let s = t;
  if (s.includes(':')) s = s.split(':')[0];
  if (s.includes(' - ')) s = s.split(' - ')[0];
  return s.trim();
};

export const tmdbService = {
  // Find TMDB movie by IMDb ID
  async findByImdbId(imdbId) {
    if (!imdbId) return null;
    try {
      const { data } = await tmdb.get(`/find/${imdbId}`, {
        params: { external_source: 'imdb_id' },
      });
      if (data.movie_results && data.movie_results[0]) {
        return { ...data.movie_results[0], media_type: 'movie' };
      }
      if (data.tv_results && data.tv_results[0]) {
        return { ...data.tv_results[0], media_type: 'tv' };
      }
      return null;
    } catch (e) {
      console.warn('TMDB findByImdbId failed:', e?.response?.status || e?.message);
      return null;
    }
  },

  // Search TMDB by title/year
  async searchByTitle(title, year) {
    if (!title) return null;
    try {
      const [movieRes, tvRes, multiRes] = await Promise.all([
        tmdb.get('/search/movie', { params: { query: title, year } }),
        tmdb.get('/search/tv', { params: { query: title, first_air_date_year: year } }),
        tmdb.get('/search/multi', { params: { query: title } }),
      ]);
      const movieTop = movieRes.data?.results?.[0] ? { ...movieRes.data.results[0], media_type: 'movie' } : null;
      const tvTop = tvRes.data?.results?.[0] ? { ...tvRes.data.results[0], media_type: 'tv' } : null;
      const multiTopRaw = multiRes.data?.results?.find(r => r.media_type === 'movie' || r.media_type === 'tv');
      const multiTop = multiTopRaw ? { ...multiTopRaw } : null;
      if (movieTop && tvTop) {
        // choose by vote_count/popularity
        const mv = movieTop.vote_count || movieTop.popularity || 0;
        const tvv = tvTop.vote_count || tvTop.popularity || 0;
        const primary = mv >= tvv ? movieTop : tvTop;
        return primary;
      }
      const primary = movieTop || tvTop || (multiTop ? { ...multiTop } : null);
      if (primary) return primary;

      // Retry with normalized title
      const norm = normalizeTitle(title);
      if (!norm || norm === title) return null;
      return await this.searchByTitle(norm, year);
    } catch (e) {
      console.warn('TMDB searchByTitle failed:', e?.response?.status || e?.message);
      return null;
    }
  },

  // Get images (backdrops) for a TMDB movie ID
  async getImagesByTmdbId(tmdbId, mediaType = 'movie') {
    if (!tmdbId) return null;
    try {
      const endpoint = mediaType === 'tv' ? `/tv/${tmdbId}/images` : `/movie/${tmdbId}/images`;
      const { data } = await tmdb.get(endpoint, {
        params: { include_image_language: 'en,null' },
      });
      return data?.backdrops || [];
    } catch (e) {
      console.warn('TMDB getImages failed:', e?.response?.status || e?.message);
      return [];
    }
  },
};

// Get the best landscape backdrop URL for a movie using TMDB
export const getBestTmdbBackdrop = async ({ imdbId, title, year }) => {
  try {
    let tmdbMovie = null;
    if (imdbId && imdbId.startsWith('tt')) {
      tmdbMovie = await tmdbService.findByImdbId(imdbId);
    }
    if (!tmdbMovie && title) {
      tmdbMovie = await tmdbService.searchByTitle(title, year);
    }
    if (!tmdbMovie) return null;
    const backdrops = await tmdbService.getImagesByTmdbId(tmdbMovie.id, tmdbMovie.media_type || 'movie');
    if (!backdrops.length) return null;
    // Prefer English or highest vote/size
    const landscapes = backdrops
      .filter(b => (b.width || 0) >= 1920 && (b.aspect_ratio || 0) >= 1.6);
    const preferred = landscapes.find(b => b.iso_639_1 === 'en')
      || landscapes.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0]
      || backdrops.find(b => b.iso_639_1 === 'en')
      || backdrops.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0]
      || backdrops[0];
    return buildTmdbImageUrl(preferred.file_path, 'original');
  } catch (e) {
    return null;
  }
};

// Resolve best TMDB item (movie or tv) by imdbId or title/year
export const resolveBestTmdbItem = async ({ imdbId, title, year }) => {
  let tmdbItem = null;
  if (imdbId && imdbId.startsWith('tt')) {
    tmdbItem = await tmdbService.findByImdbId(imdbId);
  }
  if (!tmdbItem && title) {
    tmdbItem = await tmdbService.searchByTitle(title, year);
  }
  return tmdbItem;
};

export const getTmdbPosterUrl = (poster_path, size = 'w500') => {
  return poster_path ? buildTmdbImageUrl(poster_path, size) : '';
};

export const getTmdbBackdropUrl = (backdrop_path, size = 'original') => {
  return backdrop_path ? buildTmdbImageUrl(backdrop_path, size) : '';
};

export default tmdbService;
export const tmdbClient = tmdb;
