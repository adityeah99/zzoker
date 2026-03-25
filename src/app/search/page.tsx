'use client';

import { useState, useCallback, useTransition, useEffect, useRef } from 'react';
import { Search, Loader2, X, Clock } from 'lucide-react';
import Image from 'next/image';
import { searchSongs, searchAlbums, searchArtists, getImageUrl } from '@/lib/api';
import type { Song, Album, Artist } from '@/lib/types';
import SongRow from '@/components/ui/SongRow';
import SongCard from '@/components/ui/SongCard';
import ArtistCard from '@/components/ui/ArtistCard';

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
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const refreshHistory = () => setHistory(loadHistory());

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) return;
      startTransition(async () => {
        const songQuery = `${q} rap pop english`;
        const [songsRes, albumsRes, artistsRes] = await Promise.allSettled([
          searchSongs(songQuery),
          searchAlbums(songQuery),
          searchArtists(q),
        ]);
        const songsData = songsRes.status === 'fulfilled' ? songsRes.value.results : [];
        const albumsData = albumsRes.status === 'fulfilled' ? albumsRes.value.results : [];
        const artistsData = artistsRes.status === 'fulfilled' ? artistsRes.value.results : [];

        setSongs(songsData);
        setAlbums(albumsData);
        setArtists(artistsData);
        setSearched(true);
        setFocused(false);

        // Save to history using first result as display metadata
        const topSong = songsData[0];
        const historyItem: HistoryItem = {
          query: q.trim(),
          timestamp: Date.now(),
          title: topSong?.name ?? q,
          subtitle: topSong
            ? topSong.artists?.primary?.map((a) => a.name).join(', ') ?? ''
            : 'Search',
          image: topSong ? getImageUrl(topSong.image, '150x150') : '',
        };
        saveToHistory(historyItem);
        refreshHistory();
      });
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Songs, artists, albums..."
              className="w-full bg-[#1c1c1e] text-white placeholder:text-white/30 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            />
            {isPending && (
              <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 animate-spin" />
            )}
            {query.length > 0 && !isPending && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSongs([]); setAlbums([]); setArtists([]); setSearched(false); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <X size={16} />
              </button>
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

      {searched && (
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

      {!searched && !isPending && !showHistory && (
        <div className="py-16 text-center">
          <Search size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-lg">Search for your favorite music</p>
        </div>
      )}
    </div>
  );
}
