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

// ── Normalize helpers (decode entities on all text fields) ────────────────────

function normalizeArtistShallow(a: Artist): Artist {
  return { ...a, name: decodeHtmlEntities(a.name) };
}

export function normalizeArtist(artist: Artist): Artist {
  return {
    ...artist,
    name: decodeHtmlEntities(artist.name),
    topSongs: artist.topSongs?.map(normalizeSong),
    topAlbums: artist.topAlbums?.map(normalizeAlbum),
    similarArtists: artist.similarArtists?.map(normalizeArtistShallow),
  };
}

export function normalizeSong(song: Song): Song {
  return {
    ...song,
    name: decodeHtmlEntities(song.name),
    album: song.album
      ? { ...song.album, name: decodeHtmlEntities(song.album.name ?? '') }
      : undefined,
    artists: song.artists
      ? {
          primary:  song.artists.primary?.map(normalizeArtistShallow),
          featured: song.artists.featured?.map(normalizeArtistShallow),
          all:      song.artists.all?.map(normalizeArtistShallow),
        }
      : undefined,
  };
}

export function normalizeAlbum(album: Album): Album {
  return {
    ...album,
    name:        decodeHtmlEntities(album.name),
    description: decodeHtmlEntities(album.description ?? ''),
    songs:       album.songs?.map(normalizeSong),
    artists: album.artists
      ? {
          primary:  album.artists.primary?.map(normalizeArtistShallow),
          featured: album.artists.featured?.map(normalizeArtistShallow),
          all:      album.artists.all?.map(normalizeArtistShallow),
        }
      : undefined,
  };
}

export function normalizePlaylist(playlist: Playlist): Playlist {
  return {
    ...playlist,
    name:        decodeHtmlEntities(playlist.name),
    description: decodeHtmlEntities(playlist.description ?? ''),
    songs:       playlist.songs?.map(normalizeSong),
    artists:     playlist.artists?.map(normalizeArtistShallow),
  };
}

export function normalizeSearchResult<T>(
  result: SearchResult<T>,
  fn: (item: T) => T,
): SearchResult<T> {
  return { ...result, results: result.results.map(fn) };
}
