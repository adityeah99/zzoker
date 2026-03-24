export function CardSkeleton() {
  return (
    <div className="bg-[#1c1c1e] rounded-xl p-3 animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-white/10 mb-3" />
      <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
      <div className="w-8 h-4 bg-white/10 rounded" />
      <div className="w-10 h-10 rounded-md bg-white/10 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-3 bg-white/10 rounded w-1/3" />
      </div>
      <div className="h-3 bg-white/10 rounded w-10" />
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 p-4 animate-pulse">
      <div className="w-full aspect-square rounded-full bg-white/10" />
      <div className="h-3 bg-white/10 rounded w-20" />
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <div className="w-full h-72 md:h-96 rounded-2xl bg-white/5 animate-pulse" />
  );
}

export function ScrollRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="space-y-4">
      <div className="h-7 bg-white/10 rounded w-48 animate-pulse" />
      <div className="flex gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="shrink-0 w-40">
            <CardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
