import axios from 'axios';

// OMDb integration (IMDb ratings & basic metadata)
// Requires: REACT_APP_OMDB_API_KEY in environment (.env)

const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY || '';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

// Simple in-memory cache for session (client-side)
const cache = new Map();

export async function getImdbMeta(imdbId) {
  if (!imdbId || !imdbId.startsWith('tt')) return { imdbRating: null, imdbVotes: null, metascore: null, rottenTomatoes: null };
  if (!OMDB_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[OMDb] Missing REACT_APP_OMDB_API_KEY');
    }
  return { imdbRating: null, imdbVotes: null, metascore: null, rottenTomatoes: null };
  }
  if (cache.has(imdbId)) return cache.get(imdbId);
  try {
    const { data } = await axios.get(OMDB_BASE_URL, { params: { i: imdbId, apikey: OMDB_API_KEY } });
    if (!data || data.Response === 'False') {
      const miss = { imdbRating: null, imdbVotes: null, metascore: null, rottenTomatoes: null };
      cache.set(imdbId, miss);
      return miss;
    }
    const imdbRating = data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null;
    const imdbVotes = data.imdbVotes && data.imdbVotes !== 'N/A' ? parseInt(data.imdbVotes.replace(/[,]/g, ''), 10) : null;
    const metascore = data.Metascore && data.Metascore !== 'N/A' ? parseInt(data.Metascore, 10) : null;
    // Rotten Tomatoes rating is inside Ratings array with Source === 'Rotten Tomatoes'
    let rottenTomatoes = null;
    if (Array.isArray(data.Ratings)) {
      const rt = data.Ratings.find(r => r.Source === 'Rotten Tomatoes');
      if (rt && typeof rt.Value === 'string' && rt.Value.endsWith('%')) {
        const pct = parseInt(rt.Value.replace('%',''), 10);
        if (!Number.isNaN(pct)) rottenTomatoes = pct;
      }
    }
    const payload = { imdbRating, imdbVotes, metascore, rottenTomatoes };
    cache.set(imdbId, payload);
    return payload;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[OMDb] fetch failed', e?.message);
    }
    const errorPayload = { imdbRating: null, imdbVotes: null, metascore: null, rottenTomatoes: null };
    cache.set(imdbId, errorPayload);
    return errorPayload;
  }
}

export default { getImdbMeta };