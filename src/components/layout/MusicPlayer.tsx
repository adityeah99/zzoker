'use client';

import Image from 'next/image';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, Heart, Loader2, Download
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import { downloadSong } from '@/lib/download';
import { useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration, volume, isMuted,
    isShuffle, repeatMode, isLoading,
    togglePlay, nextSong, prevSong, seekTo, setVolume, toggleMute,
    toggleShuffle, toggleRepeat,
  } = usePlayer();

  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [dlLoading, setDlLoading] = useState(false);

  useEffect(() => {
    if (!currentSong) return;
    const likedIds: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    setLiked(likedIds.includes(currentSong.id));
  }, [currentSong]);

  const handleDownload = async () => {
    if (!currentSong || dlLoading) return;
    setDlLoading(true);
    showToast(`Downloading ${currentSong.name}...`, 'info');
    try {
      await downloadSong(currentSong, '320kbps');
      showToast(`Downloaded ${currentSong.name}`, 'success');
    } catch (e) {
      showToast('Download failed', 'error');
      console.error(e);
    } finally {
      setDlLoading(false);
    }
  };

  const handleLike = () => {
    if (!currentSong) return;
    const likedIds: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    let updated: string[];
    if (liked) {
      updated = likedIds.filter((id) => id !== currentSong.id);
    } else {
      updated = [...likedIds, currentSong.id];
    }
    localStorage.setItem('likedSongs', JSON.stringify(updated));
    setLiked(!liked);
  };

  const formatTime = (t: number) => {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const artistName = currentSong?.artists?.primary?.map((a) => a.name).join(', ') || '';
  const artwork = getImageUrl(currentSong?.image, '150x150');

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10">
      {/* Progress bar (thin, full width, above player) */}
      <div
        className="h-1 w-full bg-white/10 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          seekTo(ratio * duration);
        }}
      >
        <div
          className="h-full bg-red-500 relative transition-all"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 md:pb-safe">
        {/* Song info */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shrink-0 shadow-lg">
            <Image
              src={artwork}
              alt={currentSong.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="text-white text-sm font-medium truncate">{currentSong.name}</p>
            <p className="text-white/50 text-xs truncate">{artistName}</p>
          </div>
          <button
            onClick={handleLike}
            className="ml-2 hidden sm:flex text-white/40 hover:text-red-500 transition-colors shrink-0"
          >
            <Heart size={16} fill={liked ? '#fc3c44' : 'none'} className={liked ? 'text-red-500' : ''} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 w-[40%]">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={toggleShuffle}
              className={`hidden md:flex transition-colors ${isShuffle ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
            >
              <Shuffle size={16} />
            </button>
            <button onClick={prevSong} className="text-white/70 hover:text-white transition-colors">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              {isLoading ? (
                <Loader2 size={18} className="text-black animate-spin" />
              ) : isPlaying ? (
                <Pause size={18} className="text-black" fill="black" />
              ) : (
                <Play size={18} className="text-black ml-0.5" fill="black" />
              )}
            </button>
            <button onClick={nextSong} className="text-white/70 hover:text-white transition-colors">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`hidden md:flex transition-colors ${repeatMode !== 'none' ? 'text-red-500' : 'text-white/40 hover:text-white'}`}
            >
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>
          {/* Time */}
          <div className="hidden md:flex items-center gap-2 text-xs text-white/40 w-full max-w-xs">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                seekTo(ratio * duration);
              }}
            >
              <div className="h-full bg-white/70 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume + Download */}
        <div className="hidden md:flex items-center gap-2 w-[30%] justify-end">
          <button
            onClick={handleDownload}
            disabled={dlLoading}
            title="Download 320kbps"
            className="text-white/40 hover:text-white transition-colors disabled:opacity-40"
          >
            <Download size={18} className={dlLoading ? 'animate-bounce' : ''} />
          </button>
          <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 accent-white cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
