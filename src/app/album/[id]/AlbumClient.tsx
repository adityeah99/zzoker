'use client';

import Image from 'next/image';
import { Play, Shuffle, Heart, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import { downloadAll, type DownloadQuality } from '@/lib/download';
import { useToast } from '@/components/ui/Toast';
import QualityPicker from '@/components/ui/QualityPicker';
import SongRow from '@/components/ui/SongRow';
import type { Album } from '@/lib/types';
import Link from 'next/link';

interface Props { album: Album }

export default function AlbumClient({ album }: Props) {
  const { playSong, toggleShuffle } = usePlayer();
  const { showToast } = useToast();
  const songs = album.songs || [];
  const artwork = getImageUrl(album.image, '500x500');
  const primaryArtists = album.artists?.primary || [];

  const [showPicker, setShowPicker] = useState(false);
  const [dlProgress, setDlProgress] = useState<{ done: number; total: number } | null>(null);

  const handlePlayAll = () => {
    if (songs.length > 0) playSong(songs[0], songs);
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    toggleShuffle();
    playSong(songs[Math.floor(Math.random() * songs.length)], songs);
  };

  const handleDownloadAll = async (quality: DownloadQuality) => {
    setShowPicker(false);
    showToast(`Starting download of ${songs.length} songs...`, 'info');
    setDlProgress({ done: 0, total: songs.length });
    try {
      await downloadAll(songs, quality, (done, total) => {
        setDlProgress({ done, total });
        showToast(`Downloading ${done}/${total}...`, 'info');
      });
      showToast(`Downloaded all ${songs.length} songs!`, 'success');
    } catch {
      showToast('Some downloads failed', 'error');
    } finally {
      setDlProgress(null);
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden h-80">
          <Image src={artwork} alt={album.name} fill className="object-cover blur-2xl opacity-30 scale-110" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        </div>

        <div className="relative px-6 pt-8 pb-6 flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl shrink-0">
            <Image src={artwork} alt={album.name} fill className="object-cover" sizes="224px" />
          </div>

          <div className="pb-2">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Album</p>
            <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-3">{album.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {primaryArtists.map((a) => (
                <Link key={a.id} href={`/artist/${a.id}`} className="text-white/70 hover:text-white text-sm transition-colors">
                  {a.name}
                </Link>
              ))}
              {album.year && <span className="text-white/40 text-sm">• {album.year}</span>}
              {album.songCount && <span className="text-white/40 text-sm">• {album.songCount} songs</span>}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handlePlayAll} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm">
                <Play size={16} fill="white" />
                Play
              </button>
              <button onClick={handleShufflePlay} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm">
                <Shuffle size={16} />
                Shuffle
              </button>

              {/* Download All button */}
              <div className="relative">
                <button
                  onClick={() => setShowPicker((v) => !v)}
                  disabled={!!dlProgress}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm disabled:opacity-50"
                >
                  {dlProgress ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      {dlProgress.done}/{dlProgress.total}
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      Download All
                    </>
                  )}
                </button>
                {showPicker && (
                  <QualityPicker
                    onSelect={handleDownloadAll}
                    onClose={() => setShowPicker(false)}
                    position="above"
                  />
                )}
              </div>

              <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/70 hover:text-white">
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="px-2 md:px-4 mt-4">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 mb-2">
          <span className="w-8 text-center text-xs text-white/30">#</span>
          <span className="flex-1 text-xs text-white/30 uppercase tracking-wider">Title</span>
          <span className="text-xs text-white/30">Duration</span>
          <span className="w-6" />
        </div>
        <div className="space-y-0.5">
          {songs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} queue={songs} />
          ))}
        </div>
      </div>
    </div>
  );
}
