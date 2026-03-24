'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'install_banner_dismissed';

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari (not in standalone mode, not already dismissed)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);
    const dismissed = localStorage.getItem(STORAGE_KEY);

    if (isIOS && isSafari && !isStandalone && !dismissed) {
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] left-4 right-4 z-[300] animate-in slide-in-from-bottom-4 duration-300"
      role="banner"
    >
      <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 text-lg">
          📱
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-snug">
            Add to Home Screen
          </p>
          <p className="text-white/50 text-xs mt-0.5 leading-snug">
            Tap <span className="text-white/70">Share</span> → <span className="text-white/70">Add to Home Screen</span> for the best experience
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="text-white/30 hover:text-white/60 transition-colors shrink-0 mt-0.5"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
