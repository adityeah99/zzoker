'use client';

import { useState, useEffect } from 'react';
import { Heart, History } from 'lucide-react';
import { getSong } from '@/lib/api';
import type { Song } from '@/lib/types';
import SongRow from '@/components/ui/SongRow';

type Tab = 'liked' | 'recent';

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>('liked');
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'liked') {
      loadLikedSongs();
    } else {
      loadRecentSongs();
    }
  }, [tab]);

  const loadLikedSongs = async () => {
    const ids: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    if (ids.length === 0) return;
    setLoading(true);
    try {
      const results = await Promise.all(ids.map((id) => getSong(id)));
      setLikedSongs(results.flat());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSongs = () => {
    const recent: Song[] = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    setRecentSongs(recent);
  };

  const songs = tab === 'liked' ? likedSongs : recentSongs;

  return (
    <div className="px-6 pt-6 pb-8 space-y-8">
      <div>
        <h1 className="text-white text-3xl font-bold mb-1">Your Library</h1>
        <p className="text-white/40 text-sm">Your music, all in one place</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('liked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'liked'
              ? 'bg-red-500 text-white'
              : 'bg-[#1c1c1e] text-white/60 hover:text-white hover:bg-[#2c2c2e]'
          }`}
        >
          <Heart size={14} />
          Liked Songs
        </button>
        <button
          onClick={() => setTab('recent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === 'recent'
              ? 'bg-red-500 text-white'
              : 'bg-[#1c1c1e] text-white/60 hover:text-white hover:bg-[#2c2c2e]'
          }`}
        >
          <History size={14} />
          Recently Played
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2 animate-pulse">
              <div className="w-8 h-4 bg-white/10 rounded" />
              <div className="w-10 h-10 rounded-md bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : songs.length > 0 ? (
        <div className="space-y-0.5">
          {songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={songs} showAlbum />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-white/30">
          {tab === 'liked' ? (
            <>
              <Heart size={48} className="mb-4 text-white/10" />
              <p className="text-lg font-medium">No liked songs yet</p>
              <p className="text-sm mt-2">Heart songs you love to see them here</p>
            </>
          ) : (
            <>
              <History size={48} className="mb-4 text-white/10" />
              <p className="text-lg font-medium">Nothing played yet</p>
              <p className="text-sm mt-2">Your recently played songs will appear here</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
