'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { useLanguage, LANGUAGE_META, type Language } from '@/hooks/useLanguage';
import { useToast } from '@/components/ui/Toast';

const ALL_LANGUAGES = Object.keys(LANGUAGE_META) as Language[];

export default function LanguageSelector() {
  const { languages, setLanguages } = useLanguage();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Language[]>(languages);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sync draft when reopened
  useEffect(() => {
    if (open) setDraft(languages);
  }, [open, languages]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isMobile]);

  const toggle = (lang: Language) => {
    setDraft((prev) =>
      prev.includes(lang) ? (prev.length > 1 ? prev.filter((l) => l !== lang) : prev) : [...prev, lang]
    );
  };

  const apply = () => {
    setLanguages(draft);
    setOpen(false);
    const names = draft.map((l) => LANGUAGE_META[l].label).join(', ');
    showToast(`Switched to ${names}`, 'success');
  };

  // Button label: show max 2, then "+N more"
  const label = (() => {
    const names = languages.map((l) => LANGUAGE_META[l].label);
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  })();

  const Panel = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white font-semibold text-base">Languages</p>
        <button type="button" onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-1 flex-1">
        {ALL_LANGUAGES.map((lang) => {
          const { label: name, emoji } = LANGUAGE_META[lang];
          const selected = draft.includes(lang);
          return (
            <button
              type="button"
              key={lang}
              onClick={() => toggle(lang)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                selected ? 'bg-red-500/15 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="flex-1 text-left text-sm font-medium">{name}</span>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                selected ? 'bg-red-500 border-red-500' : 'border-white/20'
              }`}>
                {selected && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={apply}
        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
      >
        Done
      </button>
    </div>
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
          open
            ? 'bg-red-500/20 border-red-500/50 text-white'
            : 'bg-white/8 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span className="hidden sm:inline max-w-[120px] truncate">{label}</span>
        <span className="sm:hidden">🌐</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Desktop dropdown */}
      {!isMobile && open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <Panel />
        </div>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1c1c1e] rounded-t-3xl p-6 pb-10 transition-transform duration-300 ease-out ${
              open ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <Panel />
          </div>
        </>
      )}
    </div>
  );
}
