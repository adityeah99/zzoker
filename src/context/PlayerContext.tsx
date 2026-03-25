'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import type { Song } from '@/lib/types';
import { getHighQualityUrl, searchSongs } from '@/lib/api';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isLoading: boolean;
}

interface PlayerActions {
  playSong: (song: Song, queue?: Song[]) => void;
  pauseSong: () => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

type PlayerContextType = PlayerState & PlayerActions;

const PlayerContext = createContext<PlayerContextType | null>(null);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Holds the pre-shuffle queue so we can restore it when shuffle is turned off
  const originalQueueRef = useRef<Song[]>([]);
  // Signals that the queue ran out and we should auto-fetch similar songs
  const autoFetchNeededRef = useRef(false);

  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    queueIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    isShuffle: false,
    repeatMode: 'none',
    isLoading: false,
  });

  // ── Audio element init ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    const onTimeUpdate    = () => setState((s) => ({ ...s, currentTime: audio.currentTime }));
    const onDurationChange = () => setState((s) => ({ ...s, duration: audio.duration || 0 }));
    const onEnded         = () => handleEnded();
    const onCanPlay       = () => setState((s) => ({ ...s, isLoading: false }));
    const onWaiting       = () => setState((s) => ({ ...s, isLoading: true }));
    const onPlay          = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause         = () => setState((s) => ({ ...s, isPlaying: false }));

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-fetch similar songs when queue exhausted ─────────────────────────
  useEffect(() => {
    if (state.isPlaying || !autoFetchNeededRef.current || !state.currentSong) return;
    autoFetchNeededRef.current = false;

    const song = state.currentSong;
    const artistName = song.artists?.primary?.[0]?.name;
    if (!artistName) return;

    searchSongs(artistName, 0, 8)
      .then((res) => {
        const similar = res.results.filter((s) => s.id !== song.id).slice(0, 5);
        if (similar.length === 0) return;
        const audio = audioRef.current;
        const firstUrl = getHighQualityUrl(similar[0].downloadUrl);
        if (!audio || !firstUrl) return;
        audio.src = firstUrl;
        audio.play().catch(console.error);
        setState((s) => ({
          ...s,
          queue: [...s.queue, ...similar],
          queueIndex: s.queue.length, // first of the similar songs
          currentSong: similar[0],
        }));
      })
      .catch(() => {});
  }, [state.isPlaying, state.currentSong]);

  // ── handleEnded ───────────────────────────────────────────────────────────
  const handleEnded = useCallback(() => {
    setState((s) => {
      const audio = audioRef.current;
      if (!audio) return s;

      if (s.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
        return s;
      }

      const nextIndex = s.isShuffle
        ? Math.floor(Math.random() * s.queue.length)
        : s.queueIndex + 1;

      if (nextIndex >= s.queue.length) {
        if (s.repeatMode === 'all') {
          const first = s.queue[0];
          const url = getHighQualityUrl(first.downloadUrl);
          if (url) { audio.src = url; audio.play(); }
          return { ...s, currentSong: first, queueIndex: 0 };
        }
        // Queue exhausted — signal auto-fetch
        autoFetchNeededRef.current = true;
        return { ...s, isPlaying: false };
      }

      const next = s.queue[nextIndex];
      const url = getHighQualityUrl(next.downloadUrl);
      if (url) { audio.src = url; audio.play(); }
      return { ...s, currentSong: next, queueIndex: nextIndex };
    });
  }, []);

  // ── playSong ──────────────────────────────────────────────────────────────
  const playSong = useCallback((song: Song, queue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = getHighQualityUrl(song.downloadUrl);
    if (!url) return;

    const newQueue = queue || [song];
    const idx = newQueue.findIndex((s) => s.id === song.id);

    // Reset shuffle original queue
    originalQueueRef.current = [];

    audio.src = url;
    audio.play().catch(console.error);

    // Track recently played
    try {
      const recent: Song[] = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      const filtered = recent.filter((s) => s.id !== song.id);
      localStorage.setItem('recentlyPlayed', JSON.stringify([song, ...filtered].slice(0, 50)));
    } catch {}

    // Track detailed listening history
    try {
      type HistoryEntry = { id: string; title: string; artist: string; artistId: string; language: string; timestamp: number };
      const history: HistoryEntry[] = JSON.parse(localStorage.getItem('listening_history') || '[]');
      const entry: HistoryEntry = {
        id: song.id,
        title: song.name,
        artist: song.artists?.primary?.map((a) => a.name).join(', ') || '',
        artistId: song.artists?.primary?.[0]?.id || '',
        language: song.language || '',
        timestamp: Date.now(),
      };
      const deduped = history.filter((h) => h.id !== song.id);
      localStorage.setItem('listening_history', JSON.stringify([entry, ...deduped].slice(0, 50)));
    } catch {}

    setState((s) => ({
      ...s,
      currentSong: song,
      queue: newQueue,
      queueIndex: idx >= 0 ? idx : 0,
      isLoading: true,
      isShuffle: false, // reset shuffle on new queue
    }));
  }, []);

  const pauseSong = useCallback(() => { audioRef.current?.pause(); }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(console.error);
    else audio.pause();
  }, []);

  const nextSong = useCallback(() => {
    setState((s) => {
      const audio = audioRef.current;
      if (!audio || s.queue.length === 0) return s;

      const nextIndex = s.isShuffle
        ? Math.floor(Math.random() * s.queue.length)
        : (s.queueIndex + 1) % s.queue.length;

      const next = s.queue[nextIndex];
      const url = getHighQualityUrl(next.downloadUrl);
      if (url) { audio.src = url; audio.play().catch(console.error); }
      return { ...s, currentSong: next, queueIndex: nextIndex };
    });
  }, []);

  const prevSong = useCallback(() => {
    setState((s) => {
      const audio = audioRef.current;
      if (!audio) return s;
      if (audio.currentTime > 3) { audio.currentTime = 0; return s; }
      const prevIndex = s.queueIndex === 0 ? s.queue.length - 1 : s.queueIndex - 1;
      const prev = s.queue[prevIndex];
      const url = getHighQualityUrl(prev.downloadUrl);
      if (url) { audio.src = url; audio.play().catch(console.error); }
      return { ...s, currentSong: prev, queueIndex: prevIndex };
    });
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState((s) => ({ ...s, currentTime: time }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = volume === 0;
    }
    setState((s) => ({ ...s, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    setState((s) => {
      if (audioRef.current) audioRef.current.muted = !s.isMuted;
      return { ...s, isMuted: !s.isMuted };
    });
  }, []);

  // ── toggleShuffle — saves/restores original order ─────────────────────────
  const toggleShuffle = useCallback(() => {
    setState((s) => {
      if (!s.isShuffle) {
        // Turning ON: save original, shuffle songs after current position
        originalQueueRef.current = s.queue;
        const before = s.queue.slice(0, s.queueIndex + 1);
        const after  = shuffle(s.queue.slice(s.queueIndex + 1));
        return { ...s, isShuffle: true, queue: [...before, ...after] };
      } else {
        // Turning OFF: restore original order
        const orig = originalQueueRef.current;
        if (orig.length > 0) {
          const currentId = s.currentSong?.id;
          const newIdx = orig.findIndex((sq) => sq.id === currentId);
          originalQueueRef.current = [];
          return { ...s, isShuffle: false, queue: orig, queueIndex: newIdx >= 0 ? newIdx : s.queueIndex };
        }
        return { ...s, isShuffle: false };
      }
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setState((s) => {
      const modes: Array<'none' | 'one' | 'all'> = ['none', 'all', 'one'];
      const idx = modes.indexOf(s.repeatMode);
      return { ...s, repeatMode: modes[(idx + 1) % modes.length] };
    });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setState((s) => ({ ...s, queue: [...s.queue, song] }));
  }, []);

  // Add song to play immediately after current
  const playNext = useCallback((song: Song) => {
    setState((s) => {
      const before = s.queue.slice(0, s.queueIndex + 1);
      const after  = s.queue.slice(s.queueIndex + 1);
      return { ...s, queue: [...before, song, ...after] };
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setState((s) => {
      const newQueue = s.queue.filter((_, i) => i !== index);
      const newIndex = index < s.queueIndex ? s.queueIndex - 1 : s.queueIndex;
      return { ...s, queue: newQueue, queueIndex: Math.min(newIndex, newQueue.length - 1) };
    });
  }, []);

  const clearQueue = useCallback(() => {
    setState((s) => ({
      ...s,
      queue: s.currentSong ? [s.currentSong] : [],
      queueIndex: 0,
    }));
  }, []);

  // ── Media Session — metadata ──────────────────────────────────────────────
  useEffect(() => {
    if (!state.currentSong || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const song = state.currentSong;
    const artwork = (song.image ?? [])
      .filter((img) => img.url)
      .map((img) => ({ src: img.url, sizes: img.quality, type: 'image/jpeg' as const }));
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.name,
      artist: song.artists?.primary?.map((a) => a.name).join(', ') ?? '',
      album: song.album?.name ?? '',
      artwork,
    });
  }, [state.currentSong]);

  // ── Media Session — playback state ────────────────────────────────────────
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
  }, [state.isPlaying]);

  // ── Media Session — position state ────────────────────────────────────────
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!state.isPlaying) return;
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration) || audio.duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: Math.min(audio.currentTime, audio.duration),
      });
    } catch {}
  }, [state.currentTime, state.isPlaying]);

  // ── Media Session — action handlers ───────────────────────────────────────
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => { audioRef.current?.play().catch(() => {}); });
    navigator.mediaSession.setActionHandler('pause', () => { audioRef.current?.pause(); });
    navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) seekTo(details.seekTime);
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skip = details.seekOffset ?? 15;
      seekTo(Math.max(0, (audioRef.current?.currentTime ?? 0) - skip));
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skip = details.seekOffset ?? 15;
      const dur = audioRef.current?.duration ?? 0;
      seekTo(Math.min(dur, (audioRef.current?.currentTime ?? 0) + skip));
    });
    return () => {
      (['play', 'pause', 'nexttrack', 'previoustrack', 'seekto', 'seekbackward', 'seekforward'] as const)
        .forEach((action) => { try { navigator.mediaSession.setActionHandler(action, null); } catch {} });
    };
  }, [nextSong, prevSong, seekTo]);

  const value: PlayerContextType = {
    ...state,
    playSong, pauseSong, togglePlay,
    nextSong, prevSong, seekTo,
    setVolume, toggleMute,
    toggleShuffle, toggleRepeat,
    addToQueue, playNext, removeFromQueue, clearQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
