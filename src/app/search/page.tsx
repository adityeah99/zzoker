'use client';

import { useState, useCallback, useTransition } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchSongs, searchAlbums, searchArtists } from '@/lib/api';
import type { Song, Album, Artist } from '@/lib/types';
import SongRow from '@/components/ui/SongRow';
import SongCard from '@/components/ui/SongCard';
import ArtistCard from '@/components/ui/ArtistCard';
import { useLanguage } from '@/hooks/useLanguage';

type Tab = 'songs' | 'albums' | 'artists';

export default function SearchPage() {
  const { languages } = useLanguage();
  const isEnglishActive = languages.includes('english');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('songs');
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) return;
      startTransition(async () => {
        // Bias queries toward Rap & Pop when English is active
        const songQuery = isEnglishActive ? `${q} rap pop english` : q;
        const albumQuery = isEnglishActive ? `${q} rap pop english` : q;
        const [songsRes, albumsRes, artistsRes] = await Promise.allSettled([
          searchSongs(songQuery),
          searchAlbums(albumQuery),
          searchArtists(q),
        ]);
        setSongs(songsRes.status === 'fulfilled' ? songsRes.value.results : []);
        setAlbums(albumsRes.status === 'fulfilled' ? albumsRes.value.results : []);
        setArtists(artistsRes.status === 'fulfilled' ? artistsRes.value.results : []);
        setSearched(true);
      });
    },
    [isEnglishActive]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'songs', label: 'Songs', count: songs.length },
    { key: 'albums', label: 'Albums', count: albums.length },
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
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Songs, artists, albums..."
              className="w-full bg-[#1c1c1e] text-white placeholder:text-white/30 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            />
            {isPending && (
              <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 animate-spin" />
            )}
          </div>
        </form>

        {isEnglishActive && searched && (
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium">
              🎤 Showing Rap &amp; Pop results
            </span>
          </div>
        )}
      </div>

      {searched && (
        <>
          {/* Tabs */}
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

          {/* Results */}
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
                albums.map((album) => (
                  <SongCard key={album.id} item={album} type="album" />
                ))
              )}
            </div>
          )}

          {tab === 'artists' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artists.length === 0 ? (
                <p className="text-white/40 text-sm py-8 text-center col-span-full">No artists found</p>
              ) : (
                artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))
              )}
            </div>
          )}
        </>
      )}

      {!searched && !isPending && (
        <div className="py-16 text-center">
          <Search size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-lg">Search for your favorite music</p>
        </div>
      )}
    </div>
  );
}
