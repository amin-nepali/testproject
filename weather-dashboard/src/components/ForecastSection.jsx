// ────────────────────────────────────────────────────────────────
// ForecastSection — 5-day outlook. Each glass card shows: weekday,
// animated condition icon, a mini sparkline of low→high range
// (relative to the whole week), high/low temps and rain probability.
// Cards expand on hover/focus with a framer-motion height spring.
// ────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import WeatherIcon from './WeatherIcon';
import Icon from './icons';
import { useWeatherApp } from '../context/WeatherContext';
import { describeWeather } from '../utils/weatherCodes';
import { formatTemp, shortDate, uvLabel, weekdayName } from '../utils/format';

/**
 * Tiny inline SVG "range bar": a horizontal capsule showing where
 * this day's min/max sits within the week's overall temperature span.
 */
function RangeBar({ tMin, tMax, weekMin, weekMax, unit }) {
  if (tMin == null || tMax == null || weekMin == null || weekMax == null) return null;
  const span = Math.max(1, weekMax - weekMin);
  const left = ((tMin - weekMin) / span) * 100;
  const width = Math.max(8, ((tMax - tMin) / span) * 100);

  return (
    <div className="mt-3" aria-hidden="true">
      <div className="relative h-1.5 w-full rounded-full bg-slate-200/70 dark:bg-white/10">
        <motion.div
          className="absolute h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400"
          initial={{ left: `${left}%`, width: 0 }}
          animate={{ left: `${left}%`, width: `${width}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span>{formatTemp(tMin, unit)}</span>
        <span className="text-slate-700 dark:text-slate-200">{formatTemp(tMax, unit)}</span>
      </div>
    </div>
  );
}

export default function ForecastSection() {
  const { data, unit } = useWeatherApp();
  const [expanded, setExpanded] = useState(null); // index of expanded card

  if (!data?.daily?.length) return null;

  // Skip index 0 ("Today") — it lives in the hero card — show next 5.
  const days = data.daily.slice(1, 6);
  const weekMin = Math.min(...days.map((d) => d.tMin).filter((v) => v != null));
  const weekMax = Math.max(...days.map((d) => d.tMax).filter((v) => v != null));

  return (
    <section aria-label="5-day forecast">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
        <Icon.Clock size={15} /> 5-Day Forecast
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
        {days.map((d, i) => {
          const cond = describeWeather(d.code, true);
          const isOpen = expanded === i;
          return (
            <motion.button
              key={d.date}
              type="button"
              layout
              onClick={() => setExpanded(isOpen ? null : i)}
              aria-expanded={isOpen}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              whileHover={{ y: -3 }}
              className={`glass-card glass-card-hover p-4 text-left ${isOpen ? 'ring-2 ring-white/60 dark:ring-white/20' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{weekdayName(d.date, i + 1)}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{shortDate(d.date)}</p>
                </div>
                <WeatherIcon code={d.code} isDay size={44} />
              </div>

              <p className="mt-1 truncate text-xs font-semibold text-slate-600 dark:text-slate-300">{cond.label}</p>

              <RangeBar tMin={d.tMin} tMax={d.tMax} weekMin={weekMin} weekMax={weekMax} unit={unit} />

              {/* Expandable detail row */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <dl className="mt-3 space-y-1.5 border-t border-white/40 pt-3 text-xs dark:border-white/10">
                      <div className="flex justify-between">
                        <dt className="font-medium text-slate-500 dark:text-slate-400">Rain chance</dt>
                        <dd className="font-bold">{d.precipProb != null ? `${d.precipProb}%` : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-slate-500 dark:text-slate-400">Max UV</dt>
                        <dd className="font-bold">{d.uvMax != null ? `${Math.round(d.uvMax)} · ${uvLabel(d.uvMax)}` : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-slate-500 dark:text-slate-400">Sunrise</dt>
                        <dd className="font-bold">{shortDate(d.date) ? d.sunrise?.slice(11, 16) ?? '--' : '--'}</dd>
                      </div>
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isOpen && d.precipProb != null && (
                <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                  <Icon.Droplet size={12} /> {d.precipProb}%
                </p>
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
