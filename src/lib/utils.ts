import type { Song, Album, Artist, Playlist, SearchResult } from './types';

export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

// The vercel API returns image/downloadUrl with `link` instead of `url`.
// Normalise to always have `url`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fixUrl(arr: any[] | undefined): { quality: string; url: string }[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => ({
    quality: item.quality ?? '',
    url: item.url || item.link || '',
  }));
}

// The vercel API returns artists as a flat comma-separated string:
//   primaryArtists: "Arijit Singh, Shilpa Rao"
//   primaryArtistsId: "456323, 455148"
// Build the artists.primary[] array from those when artists.primary is absent.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fixArtists(raw: any): Song['artists'] {
  // Already normalised (new API format with nested objects)
  if (raw?.artists?.primary) return raw.artists;

  // Modules API: primaryArtists is an array of artist objects
  if (Array.isArray(raw?.primaryArtists)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const primary: Artist[] = (raw.primaryArtists as any[]).map((a) => ({
      id: a.id ?? '',
      name: decodeHtmlEntities(a.name ?? ''),
      image: fixUrl(a.image),
    }));
    return { primary };
  }

  const names: string[] = (raw.primaryArtists ?? '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const ids: string[] = (raw.primaryArtistsId ?? '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  const primary: Artist[] = names.map((name, i) => ({
    id: ids[i] ?? '',
    name: decodeHtmlEntities(name),
  }));

  return { primary };
}

// ── Normalize helpers ─────────────────────────────────────────────────────────

function normalizeArtistShallow(a: Artist): Artist {
  return {
    ...a,
    name: decodeHtmlEntities(a.name),
    image: fixUrl(a.image as unknown as never[]),
  };
}

export function normalizeArtist(artist: Artist): Artist {
  return {
    ...artist,
    name: decodeHtmlEntities(artist.name),
    image: fixUrl(artist.image as unknown as never[]),
    topSongs: artist.topSongs?.map(normalizeSong),
    topAlbums: artist.topAlbums?.map(normalizeAlbum),
    similarArtists: artist.similarArtists?.map(normalizeArtistShallow),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeSong(song: any): Song {
  return {
    ...song,
    name: decodeHtmlEntities(song.name ?? ''),
    image: fixUrl(song.image),
    downloadUrl: fixUrl(song.downloadUrl),
    album: song.album
      ? { ...song.album, name: decodeHtmlEntities(song.album.name ?? '') }
      : undefined,
    artists: fixArtists(song),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeAlbum(album: any): Album {
  const artists = album.artists?.primary
    ? album.artists
    : fixArtists(album);
  return {
    ...album,
    name: decodeHtmlEntities(album.name ?? ''),
    description: decodeHtmlEntities(album.description ?? ''),
    image: fixUrl(album.image),
    songs: album.songs?.map(normalizeSong),
    artists,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePlaylist(playlist: any): Playlist {
  return {
    ...playlist,
    name: decodeHtmlEntities(playlist.name ?? ''),
    description: decodeHtmlEntities(playlist.description ?? ''),
    image: fixUrl(playlist.image),
    songs: playlist.songs?.map(normalizeSong),
    artists: playlist.artists?.map(normalizeArtistShallow),
  };
}

export function normalizeSearchResult<T>(
  result: SearchResult<T>,
  fn: (item: T) => T,
): SearchResult<T> {
  return { ...result, results: (result.results ?? []).map(fn) };
}
