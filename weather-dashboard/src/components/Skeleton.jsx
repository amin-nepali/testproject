// Skeleton screens with shimmer — rendered while weather loads.
// Mirrors the real dashboard layout so nothing "jumps" on data arrival.

function Block({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Big hero card + metrics grid + forecast strip skeleton. */
export default function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-label="Loading weather data">
      {/* Hero */}
      <Block className="h-64 w-full rounded-3xl sm:h-72" />

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Block key={i} className="h-24 rounded-3xl" />
        ))}
      </div>

      {/* Forecast */}
      <div className="space-y-3">
        <Block className="h-5 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Block key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      </div>

      <p className="sr-only">Loading weather…</p>
    </div>
  );
}

/** Compact variant for the sidebar lists. */
export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Block key={i} className="h-12 rounded-2xl" />
      ))}
    </div>
  );
}
