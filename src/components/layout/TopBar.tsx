'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function TopBar() {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 px-6 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5">
      <button
        onClick={() => router.back()}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => router.forward()}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
      >
        <ChevronRight size={18} />
      </button>

      {/* Push language selector to the right */}
      <div className="flex-1" />
      <LanguageSelector />
    </div>
  );
}
