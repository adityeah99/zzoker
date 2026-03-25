'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, Heart, Loader2, Download, ChevronUp,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import { downloadSong } from '@/lib/download';
import { useToast } from '@/components/ui/Toast';
import { useState, useEffect } from 'react';

export default function MusicPlayer() {
  const router = useRouter();
  const pathname = usePathname();
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
    const updated = liked
      ? likedIds.filter((id) => id !== currentSong.id)
      : [...likedIds, currentSong.id];
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

  // Hide player on nowplaying page (it has its own full controls)
  if (!currentSong || pathname === '/nowplaying') return null;

  return (
    <div
      className="fixed left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/10"
      style={{ bottom: 'var(--player-bottom, 0px)' }}
    >
      {/* Progress bar */}
      <div
        className="h-1 w-full bg-white/10 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seekTo(((e.clientX - rect.left) / rect.width) * duration);
        }}
      >
        <div
          className="h-full bg-red-500 relative transition-all"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* ── Mobile mini bar (tap to open now playing) ── */}
      <div className="flex md:hidden items-center gap-3 px-4 py-3">
        {/* Tap zone — song info */}
        <button
          onClick={() => router.push('/nowplaying')}
          className="flex items-center gap-3 flex-1 min-w-0 active:opacity-70 transition-opacity"
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 shadow-md">
            <Image src={artwork} alt={currentSong.name} fill className="object-cover" sizes="44px" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-white text-sm font-medium truncate">{currentSong.name}</p>
            <p className="text-white/50 text-xs truncate">{artistName}</p>
          </div>
          <ChevronUp size={16} className="text-white/30 shrink-0" />
        </button>
        {/* Play/Pause — separate from tap zone */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform shrink-0"
        >
          {isLoading ? (
            <Loader2 size={16} className="text-black animate-spin" />
          ) : isPlaying ? (
            <Pause size={16} className="text-black" fill="black" />
          ) : (
            <Play size={16} className="text-black ml-0.5" fill="black" />
          )}
        </button>
      </div>

      {/* ── Desktop full bar ── */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        {/* Song info */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-lg">
            <Image src={artwork} alt={currentSong.name} fill className="object-cover" sizes="56px" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentSong.name}</p>
            <p className="text-white/50 text-xs truncate">{artistName}</p>
          </div>
          <button onClick={handleLike} className="ml-2 text-white/40 hover:text-red-500 transition-colors shrink-0">
            <Heart size={16} fill={liked ? '#fc3c44' : 'none'} className={liked ? 'text-red-500' : ''} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 w-[40%]">
          <div className="flex items-center gap-6">
            <button onClick={toggleShuffle} className={`transition-colors ${isShuffle ? 'text-red-500' : 'text-white/40 hover:text-white'}`}>
              <Shuffle size={16} />
            </button>
            <button onClick={prevSong} className="text-white/70 hover:text-white transition-colors">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
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
            <button onClick={toggleRepeat} className={`transition-colors ${repeatMode !== 'none' ? 'text-red-500' : 'text-white/40 hover:text-white'}`}>
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>
          {/* Progress + time */}
          <div className="flex items-center gap-2 text-xs text-white/40 w-full max-w-xs">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seekTo(((e.clientX - rect.left) / rect.width) * duration);
              }}
            >
              <div className="h-full bg-white/70 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume + Download */}
        <div className="flex items-center gap-2 w-[30%] justify-end">
          <button onClick={handleDownload} disabled={dlLoading} title="Download 320kbps" className="text-white/40 hover:text-white transition-colors disabled:opacity-40">
            <Download size={18} className={dlLoading ? 'animate-bounce' : ''} />
          </button>
          <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 accent-white cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
