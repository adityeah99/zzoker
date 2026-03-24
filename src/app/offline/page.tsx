export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <div className="text-6xl mb-6">🎵</div>
      <h1 className="text-white text-2xl font-bold mb-3">You&apos;re offline</h1>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed">
        No internet connection. Connect to the internet and try again.
      </p>
    </div>
  );
}
