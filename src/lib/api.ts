import type { Song, Album, Artist, Playlist, HomeData, SearchResult, ApiResponse } from './types';
import {
  normalizeSong, normalizeAlbum, normalizeArtist, normalizePlaylist, normalizeSearchResult,
} from './utils';

// Hosted instance of https://github.com/sumitkolhe/jiosaavn-api
const BASE_URL = 'https://saavn.sumit.co/api';

async function fetchApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const json: ApiResponse<T> = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'API returned success: false');
  }
  return json.data as T;
}

// ─── SEARCH ─────────────────────────────────────────────────────────────────

export async function searchSongs(query: string, page = 0, limit = 20): Promise<SearchResult<Song>> {
  const res = await fetchApi<SearchResult<Song>>('/search/songs', { query, page: String(page), limit: String(limit) });
  return normalizeSearchResult(res, normalizeSong);
}

export async function searchAlbums(query: string, page = 0, limit = 20): Promise<SearchResult<Album>> {
  const res = await fetchApi<SearchResult<Album>>('/search/albums', { query, page: String(page), limit: String(limit) });
  return normalizeSearchResult(res, normalizeAlbum);
}

export async function searchArtists(query: string, page = 0, limit = 20): Promise<SearchResult<Artist>> {
  const res = await fetchApi<SearchResult<Artist>>('/search/artists', { query, page: String(page), limit: String(limit) });
  return normalizeSearchResult(res, normalizeArtist);
}

export async function searchPlaylists(query: string, page = 0, limit = 20): Promise<SearchResult<Playlist>> {
  const res = await fetchApi<SearchResult<Playlist>>('/search/playlists', { query, page: String(page), limit: String(limit) });
  return normalizeSearchResult(res, normalizePlaylist);
}

// ─── SONGS ──────────────────────────────────────────────────────────────────

// GET /api/songs/{id}  — returns Song[]
export async function getSong(id: string): Promise<Song[]> {
  const res = await fetchApi<Song[]>(`/songs/${id}`);
  return res.map(normalizeSong);
}

// GET /api/songs/{id}/suggestions
export async function getSongSuggestions(id: string, limit = 10): Promise<Song[]> {
  const res = await fetchApi<Song[]>(`/songs/${id}/suggestions`, { limit: String(limit) });
  return res.map(normalizeSong);
}

// GET /api/songs/{id}/lyrics
export async function getSongLyrics(id: string): Promise<{ lyrics?: string; snippet?: string } | null> {
  try {
    return await fetchApi<{ lyrics?: string; snippet?: string }>(`/songs/${id}/lyrics`);
  } catch {
    return null;
  }
}

// GET /api/modules?language=... (trending homepage data)
export async function getTrendingSongs(): Promise<Song[]> {
  try {
    const res = await fetchApi<{ trending?: { songs?: Song[] } }>('/modules', {
      language: 'hindi,punjabi,tamil,english,bhojpuri',
    });
    return (res?.trending?.songs ?? []).map(normalizeSong);
  } catch {
    return [];
  }
}

// ─── ALBUMS ─────────────────────────────────────────────────────────────────

// GET /api/albums?id=xxx
export async function getAlbum(id: string): Promise<Album> {
  const res = await fetchApi<Album>('/albums', { id });
  return normalizeAlbum(res);
}

// ─── PLAYLISTS ───────────────────────────────────────────────────────────────

// GET /api/playlists?id=xxx&page=0&limit=10
export async function getPlaylist(id: string, page = 0, limit = 50): Promise<Playlist> {
  const res = await fetchApi<Playlist>('/playlists', { id, page: String(page), limit: String(limit) });
  return normalizePlaylist(res);
}

// ─── ARTISTS ────────────────────────────────────────────────────────────────

// GET /api/artists/{id}?songCount=10&albumCount=10&sortBy=popularity&sortOrder=desc
export async function getArtist(
  id: string,
  songCount = 10,
  albumCount = 10,
): Promise<Artist> {
  const res = await fetchApi<Artist>(`/artists/${id}`, {
    songCount: String(songCount),
    albumCount: String(albumCount),
    sortBy: 'popularity',
    sortOrder: 'desc',
  });
  return normalizeArtist(res);
}

// GET /api/artists/{id}/songs
export async function getArtistSongs(
  id: string,
  page = 0,
  sortBy = 'popularity',
  sortOrder = 'desc',
): Promise<SearchResult<Song>> {
  const res = await fetchApi<SearchResult<Song>>(`/artists/${id}/songs`, { page: String(page), sortBy, sortOrder });
  return normalizeSearchResult(res, normalizeSong);
}

// GET /api/artists/{id}/albums
export async function getArtistAlbums(
  id: string,
  page = 0,
  sortBy = 'popularity',
  sortOrder = 'desc',
): Promise<SearchResult<Album>> {
  const res = await fetchApi<SearchResult<Album>>(`/artists/${id}/albums`, { page: String(page), sortBy, sortOrder });
  return normalizeSearchResult(res, normalizeAlbum);
}

// ─── HOME DATA ───────────────────────────────────────────────────────────────
// Assembled from parallel searches — no /modules endpoint in this API.

// Genre → search suffix mapping
const GENRE_QUERY: Record<string, string> = {
  All:          'hits 2025',
  Trending:     'trending 2025',
  'New Releases': 'new songs 2025',
  Romantic:     'romantic love songs',
  Party:        'party dance songs',
  Devotional:   'devotional bhakti songs',
  Workout:      'workout gym songs',
  Sad:          'sad emotional songs',
  Retro:        'retro classic old songs',
  Indie:        'indie independent songs',
};

// Language → artist query mapping (for "Popular Artists" row)
const LANG_ARTIST: Record<string, string> = {
  tamil:    'anirudh ravichander',
  hindi:    'arijit singh',
  english:  'taylor swift',
  bhojpuri: 'pawan singh',
  punjabi:  'diljit dosanjh',
};

// English-specific rap & pop queries
const ENGLISH_RAP_QUERIES = [
  'rap hits 2025',
  'hip hop songs drake kendrick',
  'travis scott rap',
];
const ENGLISH_POP_QUERIES = [
  'pop hits 2025',
  'taylor swift the weeknd',
  'billie eilish ariana grande pop',
];

async function buildEnglishSection(): Promise<import('./types').LanguageSection> {
  const [rap1, rap2, pop1, pop2, rapAlb, popAlb] = await Promise.all([
    searchSongs(ENGLISH_RAP_QUERIES[0], 0, 12).catch(() => null),
    searchSongs(ENGLISH_RAP_QUERIES[1], 0, 10).catch(() => null),
    searchSongs(ENGLISH_POP_QUERIES[0], 0, 12).catch(() => null),
    searchSongs(ENGLISH_POP_QUERIES[1], 0, 10).catch(() => null),
    searchAlbums('hip hop rap albums 2025', 0, 8).catch(() => null),
    searchAlbums('pop music albums 2025', 0, 8).catch(() => null),
  ]);

  const dedup = (songs: Song[]): Song[] => {
    const seen = new Set<string>();
    return songs.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
  };

  const rapSongs = dedup([...(rap1?.results ?? []), ...(rap2?.results ?? [])]);
  const popSongs = dedup([...(pop1?.results ?? []), ...(pop2?.results ?? [])]);
  const rapAlbums = rapAlb?.results ?? [];
  const popAlbums = popAlb?.results ?? [];

  // `songs` / `albums` = combined for compatibility with generic rendering
  return {
    language: 'english',
    label: 'English Rap & Pop',
    songs:  dedup([...rapSongs, ...popSongs]).slice(0, 20),
    albums: [...rapAlbums, ...popAlbums].slice(0, 12),
    rapSongs,
    popSongs,
    rapAlbums,
    popAlbums,
  };
}

const FIXED_LANGUAGES = ['hindi', 'punjabi', 'tamil', 'english', 'bhojpuri'];
const NON_ENGLISH = FIXED_LANGUAGES.filter((l) => l !== 'english');

export async function getHomeData(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _languages: string[] = FIXED_LANGUAGES,
  genre = 'All',
): Promise<HomeData> {
  const suffix = GENRE_QUERY[genre] ?? 'hits 2025';

  const songSearches = NON_ENGLISH.map((lang) =>
    searchSongs(`${lang} ${suffix}`, 0, 15).catch(() => null)
  );
  const albumSearches = NON_ENGLISH.map((lang) =>
    searchAlbums(`${lang} new album 2025`, 0, 10).catch(() => null)
  );

  const artistQuery = LANG_ARTIST['hindi'] ?? 'arijit singh';

  const [...songAndAlbumAndMeta] = await Promise.all([
    ...songSearches,
    ...albumSearches,
    searchArtists(artistQuery, 0, 10).catch(() => null),
    searchPlaylists('hindi top playlist', 0, 10).catch(() => null),
    buildEnglishSection(),
  ]);

  const n = NON_ENGLISH.length;
  const songResults    = songAndAlbumAndMeta.slice(0, n);
  const albumResults   = songAndAlbumAndMeta.slice(n, 2 * n);
  const artistResult   = songAndAlbumAndMeta[2 * n] as Awaited<ReturnType<typeof searchArtists>> | null;
  const playlistResult = songAndAlbumAndMeta[2 * n + 1] as Awaited<ReturnType<typeof searchPlaylists>> | null;
  const englishSection = songAndAlbumAndMeta[2 * n + 2] as import('./types').LanguageSection | null;

  const nonEnglishSections = NON_ENGLISH.map((lang, i) => ({
    language: lang,
    label: lang.charAt(0).toUpperCase() + lang.slice(1),
    songs:  (songResults[i] as Awaited<ReturnType<typeof searchSongs>> | null)?.results ?? [],
    albums: (albumResults[i] as Awaited<ReturnType<typeof searchAlbums>> | null)?.results ?? [],
  }));

  const finalSections = FIXED_LANGUAGES.map((lang) => {
    if (lang === 'english' && englishSection) return englishSection;
    return nonEnglishSections.find((s) => s.language === lang)!;
  }).filter(Boolean);

  return {
    sections: finalSections,
    topArtists:        artistResult?.results ?? [],
    featuredPlaylists: playlistResult?.results ?? [],
  };
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

export function getHighQualityUrl(
  downloadUrls: { quality: string; url: string }[] | undefined,
): string {
  if (!downloadUrls || downloadUrls.length === 0) return '';
  const preferred = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
  for (const quality of preferred) {
    const match = downloadUrls.find((d) => d.quality === quality);
    if (match) return match.url;
  }
  return downloadUrls[downloadUrls.length - 1].url;
}

export function getImageUrl(
  images: { quality: string; url: string }[] | undefined,
  preferred = '500x500',
): string {
  if (!images || images.length === 0) return '/placeholder.svg';
  const match = images.find((img) => img.quality === preferred);
  if (match) return match.url;
  return images[images.length - 1].url || '/placeholder.svg';
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
