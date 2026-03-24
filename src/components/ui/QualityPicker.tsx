'use client';

import { useEffect, useRef } from 'react';
import type { DownloadQuality } from '@/lib/download';

const QUALITIES: { value: DownloadQuality; label: string; sub: string }[] = [
  { value: '96kbps',  label: '96 kbps',  sub: 'Low' },
  { value: '160kbps', label: '160 kbps', sub: 'Medium' },
  { value: '320kbps', label: '320 kbps', sub: 'Best' },
];

interface QualityPickerProps {
  onSelect: (quality: DownloadQuality) => void;
  onClose: () => void;
  position?: 'above' | 'below';
}

export default function QualityPicker({
  onSelect,
  onClose,
  position = 'above',
}: QualityPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // small delay so the click that opened it doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  const posClass = position === 'above'
    ? 'bottom-full mb-2'
    : 'top-full mt-2';

  return (
    <div
      ref={ref}
      className={`
        absolute right-0 ${posClass} z-50 w-40
        bg-[#2c2c2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden
        animate-in fade-in zoom-in-95 duration-150
      `}
    >
      <p className="px-3 pt-2.5 pb-1 text-[10px] text-white/30 font-semibold uppercase tracking-widest">
        Quality
      </p>
      {QUALITIES.map(({ value, label, sub }) => (
        <button
          key={value}
          onClick={(e) => { e.stopPropagation(); onSelect(value); }}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors text-left"
        >
          <span className="text-sm text-white font-medium">{label}</span>
          <span className={`text-[10px] font-semibold ${value === '320kbps' ? 'text-red-400' : 'text-white/30'}`}>
            {sub}
          </span>
        </button>
      ))}
    </div>
  );
}
