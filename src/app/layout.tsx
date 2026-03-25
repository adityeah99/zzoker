import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import MusicPlayer from '@/components/layout/MusicPlayer';
import BottomNav from '@/components/layout/BottomNav';
import { PlayerProvider } from '@/context/PlayerContext';
import { ToastProvider } from '@/components/ui/Toast';
import InstallBanner from '@/components/ui/InstallBanner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Free Music by zZoker',
  description: 'Stream millions of songs for free with zZoker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Zzoker',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-black text-white antialiased">
        <PlayerProvider>
          <ToastProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar — desktop only */}
              <div className="hidden md:block">
                <Sidebar />
              </div>
              {/*
                Mobile: pb accounts for mini player (~68px) + bottom nav (~56px) + safe area
                Desktop: pb accounts for full player bar (~100px)
              */}
              <main className="flex-1 overflow-y-auto scrollbar-hide pb-[160px] md:pb-28">
                {children}
              </main>
            </div>

            {/* MusicPlayer: on mobile sits above BottomNav via --player-bottom CSS var */}
            <style>{`
              @media (max-width: 767px) {
                :root { --player-bottom: 56px; }
              }
              @media (min-width: 768px) {
                :root { --player-bottom: 0px; }
              }
            `}</style>

            <MusicPlayer />
            <BottomNav />
            <InstallBanner />
          </ToastProvider>
        </PlayerProvider>
      </body>
    </html>
  );
}
