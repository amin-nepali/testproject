// ────────────────────────────────────────────────────────────────
// EmptyState — first-run welcome: brand pitch, "Use my location"
// CTA and quick-pick chips for popular cities (hand-built Place
// objects so no geocoding round-trip is needed).
// ────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import Icon from './icons';
import WeatherIcon from './WeatherIcon';
import { useWeatherApp } from '../context/WeatherContext';

const QUICK_CITIES = [
  { id: 'q-london', name: 'London', admin: 'England', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5085, longitude: -0.1257, timezone: 'Europe/London' },
  { id: 'q-nyc', name: 'New York', admin: 'NY', country: 'United States', countryCode: 'US', latitude: 40.7143, longitude: -74.006, timezone: 'America/New_York' },
  { id: 'q-tokyo', name: 'Tokyo', admin: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6895, longitude: 139.6917, timezone: 'Asia/Tokyo' },
  { id: 'q-sydney', name: 'Sydney', admin: 'NSW', country: 'Australia', countryCode: 'AU', latitude: -33.8679, longitude: 151.2073, timezone: 'Australia/Sydney' },
  { id: 'q-dubai', name: 'Dubai', admin: 'Dubai', country: 'UAE', countryCode: 'AE', latitude: 25.0657, longitude: 54.3577, timezone: 'Asia/Dubai' },
  { id: 'q-cape', name: 'Cape Town', admin: 'Western Cape', country: 'South Africa', countryCode: 'ZA', latitude: -33.9258, longitude: 18.4232, timezone: 'Africa/Johannesburg' },
];

export default function EmptyState() {
  const { selectPlace, useMyLocation, geoLoading, geoError } = useWeatherApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-card p-8 text-center sm:p-12"
    >
      <div className="mx-auto mb-5 w-fit animate-floaty">
        <WeatherIcon code={2} isDay size={92} />
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Where’s the weather to you?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400 text-balance">
        Search a city above, pin your favorites, or let SkyCast find you automatically.
      </p>

      <button
        type="button"
        onClick={useMyLocation}
        disabled={geoLoading}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-glass-sm transition hover:scale-[1.02] hover:bg-slate-700 active:scale-95 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <motion.span animate={geoLoading ? { rotate: 360 } : { rotate: 0 }} transition={geoLoading ? { repeat: Infinity, duration: 1.1, ease: 'linear' } : {}}>
          <Icon.Crosshair size={17} />
        </motion.span>
        {geoLoading ? 'Finding you…' : 'Use my location'}
      </button>

      {geoError && (
        <p className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400" role="alert">
          {geoError.message}
        </p>
      )}

      {/* Quick picks */}
      <div className="mt-8">
        <p className="metric-label">Popular right now</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {QUICK_CITIES.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectPlace(c)}
              className="rounded-full border border-white/50 bg-white/40 px-4 py-1.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {c.name}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
