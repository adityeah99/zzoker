'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Music2 } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/library', icon: Library, label: 'Library' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-black border-r border-white/5 backdrop-blur-xl z-30">
        {/* Logo */}
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Music2 size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Zen<span className="text-red-500">vibe</span></span>
        </div>

        {/* Nav */}
        <nav className="px-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${active ? 'text-red-500' : 'group-hover:text-white'}`}
                />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Library section */}
        <div className="mt-6 px-6">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">
            Your Library
          </p>
          <div className="space-y-1">
            {[
              { label: 'Liked Songs', sub: 'Auto playlist' },
              { label: 'Recently Played', sub: 'Playlist' },
            ].map(({ label, sub }) => (
              <Link
                key={label}
                href="/library"
                className="flex items-center gap-3 py-2 rounded-lg group hover:bg-white/5 transition-colors px-2"
              >
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center shrink-0">
                  <Music2 size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{label}</p>
                  <p className="text-xs text-white/40">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 flex pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            >
              <Icon size={22} className={active ? 'text-red-500' : 'text-white/40'} />
              <span className={`text-[10px] font-medium ${active ? 'text-red-500' : 'text-white/40'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
