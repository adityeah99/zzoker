'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import type { Song } from '@/lib/types';
import { getHighQualityUrl } from '@/lib/api';

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
}

type PlayerContextType = PlayerState & PlayerActions;

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Init audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    const onTimeUpdate = () =>
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    const onDurationChange = () =>
      setState((s) => ({ ...s, duration: audio.duration || 0 }));
    const onEnded = () => handleEnded();
    const onCanPlay = () => setState((s) => ({ ...s, isLoading: false }));
    const onWaiting = () => setState((s) => ({ ...s, isLoading: true }));
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));

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

  const handleEnded = useCallback(() => {
    setState((s) => {
      const audio = audioRef.current;
      if (!audio) return s;

      if (s.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
        return s;
      }

      let nextIndex: number;
      if (s.isShuffle) {
        nextIndex = Math.floor(Math.random() * s.queue.length);
      } else {
        nextIndex = s.queueIndex + 1;
      }

      if (nextIndex >= s.queue.length) {
        if (s.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return { ...s, isPlaying: false };
        }
      }

      const nextSong = s.queue[nextIndex];
      const url = getHighQualityUrl(nextSong.downloadUrl);
      if (url) {
        audio.src = url;
        audio.play();
      }
      return { ...s, currentSong: nextSong, queueIndex: nextIndex };
    });
  }, []);

  const playSong = useCallback((song: Song, queue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = getHighQualityUrl(song.downloadUrl);
    if (!url) return;

    const newQueue = queue || [song];
    const idx = newQueue.findIndex((s) => s.id === song.id);

    audio.src = url;
    audio.play().catch(console.error);

    // Track recently played
    try {
      const recent: Song[] = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      const filtered = recent.filter((s) => s.id !== song.id);
      localStorage.setItem('recentlyPlayed', JSON.stringify([song, ...filtered].slice(0, 50)));
    } catch {}

    // Track detailed listening history for personalization
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
    }));
  }, []);

  const pauseSong = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, []);

  const nextSong = useCallback(() => {
    setState((s) => {
      const audio = audioRef.current;
      if (!audio || s.queue.length === 0) return s;

      let nextIndex: number;
      if (s.isShuffle) {
        nextIndex = Math.floor(Math.random() * s.queue.length);
      } else {
        nextIndex = (s.queueIndex + 1) % s.queue.length;
      }

      const next = s.queue[nextIndex];
      const url = getHighQualityUrl(next.downloadUrl);
      if (url) {
        audio.src = url;
        audio.play().catch(console.error);
      }
      return { ...s, currentSong: next, queueIndex: nextIndex };
    });
  }, []);

  const prevSong = useCallback(() => {
    setState((s) => {
      const audio = audioRef.current;
      if (!audio) return s;

      // If > 3 seconds in, restart current song
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return s;
      }

      const prevIndex = s.queueIndex === 0 ? s.queue.length - 1 : s.queueIndex - 1;
      const prev = s.queue[prevIndex];
      const url = getHighQualityUrl(prev.downloadUrl);
      if (url) {
        audio.src = url;
        audio.play().catch(console.error);
      }
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
      if (audioRef.current) {
        audioRef.current.muted = !s.isMuted;
      }
      return { ...s, isMuted: !s.isMuted };
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((s) => ({ ...s, isShuffle: !s.isShuffle }));
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

  const value: PlayerContextType = {
    ...state,
    playSong,
    pauseSong,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
