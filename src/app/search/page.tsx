'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Loader2, X, Clock } from 'lucide-react';
import Image from 'next/image';
import { searchSongs, searchAlbums, searchArtists, getSearchSuggestions, getImageUrl } from '@/lib/api';
import type { Song, Album, Artist } from '@/lib/types';
import type { SuggestionItem } from '@/lib/api';
import SongRow from '@/components/ui/SongRow';
import SongCard from '@/components/ui/SongCard';
import ArtistCard from '@/components/ui/ArtistCard';
import SearchSuggestions from '@/components/ui/SearchSuggestions';
import { usePlayer } from '@/context/PlayerContext';
import { useToast } from '@/components/ui/Toast';

type Tab = 'songs' | 'albums' | 'artists';

interface HistoryItem {
  query: string;
  timestamp: number;
  // top result metadata for display
  title: string;
  subtitle: string;
  image: string;
}

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(item: HistoryItem) {
  try {
    const existing = loadHistory().filter((h) => h.query !== item.query);
    const updated = [item, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

function deleteFromHistory(query: string) {
  try {
    const updated = loadHistory().filter((h) => h.query !== query);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);

  const { addToQueue, playSong } = usePlayer();
  const { showToast } = useToast();

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const refreshHistory = () => setHistory(loadHistory());

  // Debounced autocomplete
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSuggestionsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const items = await getSearchSuggestions(query.trim(), controller.signal);
        setSuggestions(items);
      } catch {
        // aborted or error — ignore
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    setSearchError(false);
    try {
      const [songsRes, albumsRes, artistsRes] = await Promise.allSettled([
        searchSongs(q),
        searchAlbums(q),
        searchArtists(q),
      ]);

      const allFailed = [songsRes, albumsRes, artistsRes].every((r) => r.status === 'rejected');
      if (allFailed) {
        setSearchError(true);
        return;
      }

      const songsData = songsRes.status === 'fulfilled' ? songsRes.value.results : [];
      const albumsData = albumsRes.status === 'fulfilled' ? albumsRes.value.results : [];
      const artistsData = artistsRes.status === 'fulfilled' ? artistsRes.value.results : [];

      setSongs(songsData);
      setAlbums(albumsData);
      setArtists(artistsData);
      setSearched(true);
      setFocused(false);

      const topSong = songsData[0];
      saveToHistory({
        query: q.trim(),
        timestamp: Date.now(),
        title: topSong?.name ?? q,
        subtitle: topSong ? topSong.artists?.primary?.map((a) => a.name).join(', ') ?? '' : 'Search',
        image: topSong ? getImageUrl(topSong.image, '150x150') : '',
      });
      refreshHistory();
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(true);
    } finally {
      setIsSearching(false);
      setFocused(false);
    }
  }, []);

  const showSuggestions = focused && (suggestionsLoading || suggestions.length > 0) && query.trim().length >= 2;

  const handleSelectQuery = (text: string) => {
    setQuery(text);
    setSuggestions([]);
    setActiveIndex(-1);
    doSearch(text);
  };

  const handleSelectSong = (song: Song) => {
    setSuggestions([]);
    setActiveIndex(-1);
    setFocused(false);
    playSong(song, [song]);
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
    showToast(`Added "${song.name}" to queue`, 'success');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    const total = suggestions.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % total);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + total) % total);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const item = suggestions[activeIndex];
      if (item.type === 'query') handleSelectQuery(item.text);
      else if (item.type === 'song') handleSelectSong(item.song);
      else if (item.type === 'album') handleSelectQuery(item.album.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    setActiveIndex(-1);
    doSearch(query);
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setQuery(item.query);
    doSearch(item.query);
  };

  const handleDeleteHistory = (q: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFromHistory(q);
    refreshHistory();
  };

  const handleClearAll = () => {
    localStorage.removeItem(HISTORY_KEY);
    refreshHistory();
  };

  const showHistory = focused && query.trim() === '' && history.length > 0;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'songs',   label: 'Songs',   count: songs.length   },
    { key: 'albums',  label: 'Albums',  count: albums.length  },
    { key: 'artists', label: 'Artists', count: artists.length },
  ];

  return (
    <div className="px-6 pt-6 pb-8 space-y-8">
      <div>
        <h1 className="text-white text-3xl font-bold mb-6">Search</h1>
        <form onSubmit={handleSubmit}>
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="Songs, artists, albums..."
              className="w-full bg-[#1c1c1e] text-white placeholder:text-white/30 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            />
            {(isSearching || suggestionsLoading) && (
              <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 animate-spin" />
            )}
            {query.length > 0 && !isSearching && !suggestionsLoading && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSongs([]); setAlbums([]); setArtists([]); setSearched(false); setSuggestions([]); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <X size={16} />
              </button>
            )}
            {showSuggestions && (
              <SearchSuggestions
                query={query}
                items={suggestions}
                loading={suggestionsLoading}
                activeIndex={activeIndex}
                onSelectQuery={handleSelectQuery}
                onSelectSong={handleSelectSong}
                onAddToQueue={handleAddToQueue}
                onSetActiveIndex={setActiveIndex}
              />
            )}
          </div>
        </form>

        {/* Recent Searches */}
        {showHistory && (
          <div className="mt-4 max-w-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">Recent</p>
              <button onClick={handleClearAll} className="text-xs text-white/30 hover:text-red-400 transition-colors">
                Clear All
              </button>
            </div>
            <div className="space-y-1">
              {history.map((item) => (
                <button
                  key={item.query}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 group transition-colors text-left"
                >
                  {item.image ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-white/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-white/40 text-xs truncate">{item.subtitle || item.query}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistory(item.query, e)}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-white/20 hover:text-white/60 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <X size={13} />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {searched && searchError && (
        <div className="py-12 text-center">
          <p className="text-white/50 text-sm">Something went wrong. Please try again.</p>
          <button
            onClick={() => doSearch(query)}
            className="mt-3 px-4 py-2 rounded-full bg-[#1c1c1e] text-white/60 hover:text-white text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {searched && !searchError && (
        <>
          <div className="flex gap-2">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === key
                    ? 'bg-red-500 text-white'
                    : 'bg-[#1c1c1e] text-white/60 hover:text-white hover:bg-[#2c2c2e]'
                }`}
              >
                {label} {count > 0 && <span className="opacity-60">({count})</span>}
              </button>
            ))}
          </div>

          {tab === 'songs' && (
            <div className="space-y-1">
              {songs.length === 0 ? (
                <p className="text-white/40 text-sm py-8 text-center">No songs found</p>
              ) : (
                songs.map((song, i) => (
                  <SongRow key={song.id} song={song} index={i} queue={songs} showAlbum />
                ))
              )}
            </div>
          )}

          {tab === 'albums' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {albums.length === 0 ? (
                <p className="text-white/40 text-sm py-8 text-center col-span-full">No albums found</p>
              ) : (
                albums.map((album) => <SongCard key={album.id} item={album} type="album" />)
              )}
            </div>
          )}

          {tab === 'artists' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artists.length === 0 ? (
                <p className="text-white/40 text-sm py-8 text-center col-span-full">No artists found</p>
              ) : (
                artists.map((artist) => <ArtistCard key={artist.id} artist={artist} />)
              )}
            </div>
          )}
        </>
      )}

      {!searched && !isSearching && !showHistory && (
        <div className="py-16 text-center">
          <Search size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-lg">Search for your favorite music</p>
        </div>
      )}
    </div>
  );
}
