export interface DownloadUrl {
  quality: string;
  url: string;
}

export interface Image {
  quality: string;
  url: string;
}

export interface Artist {
  id: string;
  name: string;
  url?: string;
  role?: string;
  image?: Image[];
  type?: string;
  isFollowed?: boolean;
  followerCount?: number;
  bio?: string;
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
  availableLanguages?: string[];
  dominantLanguage?: string;
  dominantType?: string;
  topSongs?: Song[];
  topAlbums?: Album[];
  singles?: Album[];
  similarArtists?: Artist[];
}

export interface Song {
  id: string;
  name: string;
  type?: string;
  year?: string;
  releaseDate?: string;
  duration?: number;
  label?: string;
  explicitContent?: boolean;
  playCount?: number;
  language?: string;
  hasLyrics?: boolean;
  lyricsId?: string;
  url?: string;
  copyright?: string;
  album?: {
    id?: string;
    name?: string;
    url?: string;
  };
  artists?: {
    primary?: Artist[];
    featured?: Artist[];
    all?: Artist[];
  };
  image?: Image[];
  downloadUrl?: DownloadUrl[];
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  year?: number;
  type?: string;
  playCount?: number;
  language?: string;
  explicitContent?: boolean;
  songCount?: number;
  url?: string;
  image?: Image[];
  artists?: {
    primary?: Artist[];
    featured?: Artist[];
    all?: Artist[];
  };
  songs?: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  type?: string;
  year?: number;
  playCount?: number;
  fanCount?: number;
  url?: string;
  explicitContent?: boolean;
  songCount?: number;
  language?: string;
  image?: Image[];
  songs?: Song[];
  artists?: Artist[];
}

export interface SearchResult<T> {
  total: number;
  start: number;
  results: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LanguageSection {
  language: string;
  label: string;
  songs: Song[];
  albums: Album[];
  // English-only: split rap vs pop content
  rapSongs?: Song[];
  popSongs?: Song[];
  rapAlbums?: Album[];
  popAlbums?: Album[];
}

// Home data assembled from per-language searches
export interface HomeData {
  sections: LanguageSection[];
  topArtists: Artist[];
  featuredPlaylists: Playlist[];
}
