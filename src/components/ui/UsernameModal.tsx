'use client';

import { useState, useEffect, useRef } from 'react';
import { Music2 } from 'lucide-react';
import { getUsername, setUsername } from '@/hooks/usePersonalization';

interface UsernameModalProps {
  onDone: (name: string) => void;
}

export default function UsernameModal({ onDone }: UsernameModalProps) {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only show if no username stored yet
    const existing = getUsername();
    if (!existing) {
      // Small delay so it feels natural after page load
      setTimeout(() => {
        setVisible(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 600);
    } else {
      onDone(existing);
    }
  }, [onDone]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = value.trim() || 'You';
    setUsername(name);
    setVisible(false);
    onDone(name);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#1c1c1e] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          {/* Icon */}
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Music2 size={28} className="text-white" />
          </div>

          <h2 className="text-white text-2xl font-bold text-center mb-1">
            Welcome to Zenvibe
          </h2>
          <p className="text-white/40 text-sm text-center mb-8">
            What should we call you?
          </p>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter your name..."
              maxLength={30}
              className="w-full bg-[#2c2c2e] text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/50 transition-all mb-4"
            />
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Let&apos;s Go →
            </button>
          </form>

          <button
            onClick={() => handleSubmit()}
            className="w-full text-white/30 hover:text-white/50 text-xs mt-3 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  );
}
