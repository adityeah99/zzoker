'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronDown, Heart, Shuffle, SkipBack, SkipForward,
  Repeat, Repeat1, Play, Pause, Loader2, Download,
  Mic2, ListMusic, Volume2, Share2,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { getImageUrl } from '@/lib/api';
import { downloadSong } from '@/lib/download';
import { useToast } from '@/components/ui/Toast';
import QueuePanel from '@/components/ui/QueuePanel';
import LyricsSheet from '@/components/ui/LyricsSheet';
import CreditsPanel from '@/components/ui/CreditsPanel';
import NextInQueue from '@/components/ui/NextInQueue';

export default function NowPlayingPage() {
  const router = useRouter();
  const {
    currentSong, isPlaying, currentTime, duration, volume,
    isShuffle, repeatMode, isLoading,
    togglePlay, nextSong, prevSong, seekTo, setVolume,
    toggleShuffle, toggleRepeat,
  } = usePlayer();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(false);
  const [dlLoading, setDlLoading] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (!currentSong) return;
    const ids: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    setLiked(ids.includes(currentSong.id));
  }, [currentSong]);

  useEffect(() => {
    if (!currentSong) router.replace('/');
  }, [currentSong, router]);

  const handleLike = () => {
    if (!currentSong) return;
    const ids: string[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    const updated = liked
      ? ids.filter((id) => id !== currentSong.id)
      : [...ids, currentSong.id];
    localStorage.setItem('likedSongs', JSON.stringify(updated));
    setLiked(!liked);
  };

  const handleDownload = async () => {
    if (!currentSong || dlLoading) return;
    setDlLoading(true);
    showToast(`Downloading ${currentSong.name}...`, 'info');
    try {
      await downloadSong(currentSong, '320kbps');
      showToast(`Downloaded ${currentSong.name}`, 'success');
    } catch {
      showToast('Download failed', 'error');
    } finally {
      setDlLoading(false);
    }
  };

  const handleShare = async () => {
    if (!currentSong) return;
    if (navigator.share) {
      await navigator.share({
        title: currentSong.name,
        text: `Listening to ${currentSong.name} on Zenvibe`,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(window.location.origin).catch(() => {});
      showToast('Link copied!', 'success');
    }
  };

  const formatTime = (t: number) => {
    if (!isFinite(t) || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const artistName = currentSong?.artists?.primary?.map((a) => a.name).join(', ') ?? '';
  const artwork = getImageUrl(currentSong?.image, '500x500');

  // Swipe down to close (only when sheets are closed)
  const onTouchStart = (e: React.TouchEvent) => {
    if (showQueue || showLyrics) return;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (showQueue || showLyrics) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 80) router.back();
  };

  if (!currentSong) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col animate-slide-up"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Blurred background — fixed behind everything */}
      <div
        className="absolute inset-0 scale-110 pointer-events-none"
        style={{
          backgroundImage: `url(${artwork})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(48px) brightness(0.35) saturate(1.8)',
        }}
      />
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Content — scrollable so desktop credits/queue section is reachable */}
      <div
        className="relative z-10 flex-1 overflow-y-auto overscroll-none"
        style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}
      >
        {/* ── Main player area — fills viewport height ── */}
        <div className="flex flex-col min-h-[calc(100dvh-env(safe-area-inset-top,20px))] px-6 pb-8">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mt-1 mb-2" />

          {/* Header */}
          <div className="flex items-center justify-between py-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20"
            >
              <ChevronDown size={20} className="text-white" />
            </button>
            <p className="text-white text-sm font-semibold tracking-wide uppercase opacity-60">Now Playing</p>
            <div className="w-9" />
          </div>

          {/* Artwork */}
          <div className="flex-1 md:flex-none flex items-center justify-center py-4 md:py-6">
            <div className="w-full max-w-[80vw] md:max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
              <Image
                src={artwork}
                alt={currentSong.name}
                width={500}
                height={500}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

        {/* Song info + like */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-white text-2xl font-bold truncate leading-tight">{currentSong.name}</h2>
            <p className="text-white/50 text-base mt-0.5 truncate">{artistName}</p>
          </div>
          <button
            onClick={handleLike}
            className="w-10 h-10 flex items-center justify-center rounded-full shrink-0 active:scale-90 transition-transform"
          >
            <Heart
              size={24}
              fill={liked ? '#fc3c44' : 'none'}
              className={liked ? 'text-red-500' : 'text-white/50'}
            />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div
            className="h-1 w-full bg-white/20 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seekTo(((e.clientX - rect.left) / rect.width) * duration);
            }}
          >
            <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md" />
            </div>
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-white/40 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 px-2">
          <button
            onClick={toggleShuffle}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              isShuffle ? 'text-red-500' : 'text-white/40'
            }`}
          >
            <Shuffle size={20} />
          </button>
          <button onClick={prevSong} className="w-12 h-12 flex items-center justify-center text-white active:scale-90 transition-transform">
            <SkipBack size={32} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"
          >
            {isLoading ? (
              <Loader2 size={28} className="text-black animate-spin" />
            ) : isPlaying ? (
              <Pause size={28} className="text-black" fill="black" />
            ) : (
              <Play size={28} className="text-black ml-1" fill="black" />
            )}
          </button>
          <button onClick={nextSong} className="w-12 h-12 flex items-center justify-center text-white active:scale-90 transition-transform">
            <SkipForward size={32} fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              repeatMode !== 'none' ? 'text-red-500' : 'text-white/40'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Volume slider (inline, shown on tap) */}
        {showVolume && (
          <div className="mb-4 flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
            <Volume2 size={16} className="text-white/50 shrink-0" />
            <input
              type="range"
              min={0} max={1} step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 accent-white"
            />
            <span className="text-white/40 text-xs w-8 text-right">{Math.round(volume * 100)}</span>
          </div>
        )}

        {/* Bottom icons */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => { setShowLyrics(true); setShowQueue(false); }}
            className="flex flex-col items-center gap-1 text-white/30 active:text-white/60 transition-colors"
          >
            <Mic2 size={20} />
            <span className="text-[9px]">Lyrics</span>
          </button>
          <button
            onClick={() => { setShowQueue(true); setShowLyrics(false); }}
            className="flex flex-col items-center gap-1 text-white/30 active:text-white/60 transition-colors"
          >
            <ListMusic size={20} />
            <span className="text-[9px]">Queue</span>
          </button>
          <button
            onClick={() => setShowVolume((v) => !v)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              showVolume ? 'text-red-400' : 'text-white/30 active:text-white/60'
            }`}
          >
            <Volume2 size={20} />
            <span className="text-[9px]">Volume</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={dlLoading}
            className="flex flex-col items-center gap-1 text-white/30 active:text-white/60 disabled:opacity-30 transition-colors"
          >
            <Download size={20} className={dlLoading ? 'animate-bounce' : ''} />
            <span className="text-[9px]">Download</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-white/30 active:text-white/60 transition-colors"
          >
            <Share2 size={20} />
            <span className="text-[9px]">Share</span>
          </button>
        </div>
        </div>{/* end main player area */}

        {/* ── Desktop: Credits + Next in Queue — below the fold ── */}
        <div className="hidden md:grid grid-cols-2 divide-x divide-white/10 mx-6 mb-8 rounded-2xl overflow-hidden border border-white/8 animate-in fade-in duration-500"
          style={{ background: '#1c1c1e' }}
        >
          <CreditsPanel songId={currentSong.id} />
          <NextInQueue onOpenQueue={() => { setShowLyrics(false); setShowQueue(true); }} />
        </div>

      </div>{/* end scrollable content */}

      {/* Queue panel — z above nowplaying */}
      <QueuePanel open={showQueue} onClose={() => setShowQueue(false)} />

      {/* Lyrics sheet */}
      <LyricsSheet
        open={showLyrics}
        onClose={() => setShowLyrics(false)}
        songId={currentSong.id}
        songName={currentSong.name}
      />
    </div>
  );
}
