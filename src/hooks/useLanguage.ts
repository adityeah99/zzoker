'use client';

import { useLanguageContext } from '@/context/LanguageContext';

export type Language = 'tamil' | 'hindi' | 'english' | 'bhojpuri' | 'punjabi';

export const LANGUAGE_META: Record<Language, { label: string; emoji: string }> = {
  tamil:    { label: 'Tamil',    emoji: '🎬' },
  hindi:    { label: 'Hindi',    emoji: '🇮🇳' },
  english:  { label: 'English',  emoji: '🌍' },
  bhojpuri: { label: 'Bhojpuri', emoji: '🎵' },
  punjabi:  { label: 'Punjabi',  emoji: '🎸' },
};

export function useLanguage() {
  return useLanguageContext();
}
