'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library } from 'lucide-react';

const TABS = [
  { href: '/',        Icon: Home,    label: 'Home'    },
  { href: '/search',  Icon: Search,  label: 'Search'  },
  { href: '/library', Icon: Library, label: 'Library' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on nowplaying page (full screen player covers it anyway)
  if (pathname === '/nowplaying') return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[45] bg-black/90 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around py-2">
        {TABS.map(({ href, Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-8 py-1 transition-colors ${
                active ? 'text-[#fc3c44]' : 'text-white/40'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
