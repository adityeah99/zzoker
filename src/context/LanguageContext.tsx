'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language } from '@/hooks/useLanguage';

const STORAGE_KEY = 'preferred_languages';
const DEFAULT: Language[] = ['tamil', 'hindi'];

interface LanguageContextValue {
  languages: Language[];
  setLanguages: (langs: Language[]) => void;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languages, setLanguagesState] = useState<Language[]>(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Language[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLanguagesState(parsed);
        }
      }
    } catch {}
    setMounted(true);
  }, []);

  const setLanguages = useCallback((langs: Language[]) => {
    const safe = langs.length > 0 ? langs : DEFAULT;
    setLanguagesState(safe);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ languages, setLanguages, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguageContext must be used within LanguageProvider');
  return ctx;
}
