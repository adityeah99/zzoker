import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import MusicPlayer from '@/components/layout/MusicPlayer';
import { PlayerProvider } from '@/context/PlayerContext';
import { ToastProvider } from '@/components/ui/Toast';
import { LanguageProvider } from '@/context/LanguageContext';
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
        <LanguageProvider>
        <PlayerProvider>
          <ToastProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto scrollbar-hide pb-32 md:pb-28">
                {children}
              </main>
            </div>
            <MusicPlayer />
            <InstallBanner />
          </ToastProvider>
        </PlayerProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
