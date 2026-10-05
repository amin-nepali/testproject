// ────────────────────────────────────────────────────────────────
// WeatherCard — the hero panel: place name, giant temperature with
// C/F toggle, condition + animated icon, feels-like, high/low,
// local time & sunrise/sunset, favorite star and refresh button.
// Uses framer-motion for mount transitions + unit-change spring.
// ────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import Icon from './icons';
import WeatherIcon from './WeatherIcon';
import { useWeatherApp } from '../context/WeatherContext';
import { describeWeather } from '../utils/weatherCodes';
import { formatClock, formatTemp, placeLabel, timeAgo, windDirection, formatWind } from '../utils/format';

export default function WeatherCard() {
  const { data, unit, toggleUnit, refresh, isLoading, place, isFavorite, toggleFavorite } = useWeatherApp();

  if (!data?.current) return null;

  const c = data.current;
  const today = data.daily?.[0] ?? {};
  const cond = describeWeather(c.code, c.isDay);

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="glass-card relative overflow-hidden p-6 sm:p-8"
      aria-label={`Current weather in ${placeLabel(place)}`}
    >
      {/* soft radial glow tied to condition accent */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl dark:from-white/10"
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Icon.Pin size={16} />
            <h2 className="truncate text-lg font-bold text-slate-800 dark:text-slate-100">
              {placeLabel(data.place)}
            </h2>
            {data.place.admin && (
              <span className="hidden truncate text-sm sm:inline">· {data.place.admin}</span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Local time {formatClock(c.time, data.utcOffsetSeconds)} · Updated {timeAgo(data.fetchedAt)}
            {data.fromCache && ' · from cache'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            type="button"
            onClick={() => toggleFavorite(data.place)}
            aria-pressed={isFavorite(data.place)}
            aria-label={isFavorite(data.place) ? 'Remove from favorites' : 'Add to favorites'}
            className={`rounded-xl border border-white/50 bg-white/40 p-2 transition hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 ${
              isFavorite(data.place) ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            {isFavorite(data.place) ? <Icon.StarFilled size={16} /> : <Icon.Star size={16} />}
          </button>

          {/* Refresh */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={refresh}
            disabled={isLoading}
            aria-label="Refresh weather data"
            className="rounded-xl border border-white/50 bg-white/40 p-2 text-slate-500 transition hover:bg-white/70 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <motion.span
              className="block"
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={isLoading ? { repeat: Infinity, ease: 'linear', duration: 1 } : { duration: 0.3 }}
            >
              <Icon.Refresh size={16} />
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* Temperature hero */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-end gap-5">
          <motion.div
            key={`${c.tempC}-${unit}`}
            initial={{ opacity: 0.4, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="select-none text-[84px] font-extrabold leading-none tracking-tighter text-slate-900 drop-shadow-sm dark:text-white sm:text-[110px]"
          >
            {formatTemp(c.tempC, unit)}
          </motion.div>

          {/* Unit toggle */}
          <div className="mb-3 flex rounded-2xl border border-white/50 bg-white/40 p-1 backdrop-blur dark:border-white/10 dark:bg-white/5" role="group" aria-label="Temperature units">
            {['C', 'F'].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => u !== unit && toggleUnit()}
                aria-pressed={unit === u}
                className={`relative rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                  unit === u
                    ? 'bg-slate-900 text-white shadow dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                °{u}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pb-1">
          <div className="animate-floaty">
            <WeatherIcon code={c.code} isDay={c.isDay} size={84} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{cond.label}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              Feels like {formatTemp(c.feelsC, unit)}
            </p>
            <div className="mt-1 flex items-center gap-3 text-sm font-semibold">
              <span className="text-slate-800 dark:text-slate-100">H {formatTemp(today.tMax, unit)}</span>
              <span className="text-slate-500 dark:text-slate-400">L {formatTemp(today.tMin, unit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sunrise / sunset / wind footer strip */}
      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/40 pt-4 text-center dark:border-white/10">
        <div>
          <p className="metric-label flex items-center justify-center gap-1"><Icon.Sunrise size={13} /> Sunrise</p>
          <p className="metric-value text-sm">{today.sunrise ? formatClock(today.sunrise, data.utcOffsetSeconds) : '--'}</p>
        </div>
        <div>
          <p className="metric-label flex items-center justify-center gap-1"><Icon.Sunset size={13} /> Sunset</p>
          <p className="metric-value text-sm">{today.sunset ? formatClock(today.sunset, data.utcOffsetSeconds) : '--'}</p>
        </div>
        <div>
          <p className="metric-label flex items-center justify-center gap-1"><Icon.Wind size={13} /> Wind</p>
          <p className="metric-value text-sm">
            {formatWind(c.windKmh, unit)} {windDirection(c.windDeg) && <span className="text-slate-400">({windDirection(c.windDeg)})</span>}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
