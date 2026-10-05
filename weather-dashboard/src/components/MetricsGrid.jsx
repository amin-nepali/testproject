// MetricsGrid — six glass tiles: humidity, wind, UV index (with a
// colour-coded progress bar), feels-like, pressure and precipitation.
import { motion } from 'framer-motion';
import Icon from './icons';
import { useWeatherApp } from '../context/WeatherContext';
import { formatPressure, formatTemp, formatWind, uvLabel } from '../utils/format';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function Tile({ icon, label, children, delayKey }) {
  return (
    <motion.div variants={item} className="glass-card glass-card-hover p-4">
      <p className="metric-label flex items-center gap-1.5">{icon} {label}</p>
      <div className="metric-value" key={delayKey}>{children}</div>
    </motion.div>
  );
}

/** Green→red gradient bar for the UV index (0–11+ scale). */
function UvBar({ value }) {
  const pct = Math.min(100, ((value ?? 0) / 11) * 100);
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10" aria-hidden="true">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function MetricsGrid() {
  const { data, unit } = useWeatherApp();
  if (!data?.current) return null;
  const c = data.current;

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      aria-label="Weather details"
    >
      <Tile icon={<Icon.Droplet size={13} />} label="Humidity" delayKey={c.humidity}>
        {c.humidity != null ? `${Math.round(c.humidity)}%` : '--'}
      </Tile>

      <Tile icon={<Icon.Wind size={13} />} label="Wind" delayKey={c.windKmh}>
        {formatWind(c.windKmh, unit)}
      </Tile>

      <Tile icon={<Icon.Uv size={13} />} label="UV Index" delayKey={c.uvIndex}>
        <span>{c.uvIndex != null ? `${Math.round(c.uvIndex)} · ${uvLabel(c.uvIndex)}` : '--'}</span>
        <UvBar value={c.uvIndex} />
      </Tile>

      <Tile icon={<Icon.Thermometer size={13} />} label="Feels like" delayKey={c.feelsC}>
        {formatTemp(c.feelsC, unit)}
      </Tile>

      <Tile icon={<Icon.Gauge size={13} />} label="Pressure" delayKey={c.pressure}>
        {formatPressure(c.pressure)}
      </Tile>

      <Tile icon={<Icon.Droplet size={13} />} label="Precipitation" delayKey={c.precipitation}>
        {c.precipitation != null ? `${c.precipitation.toFixed(1)} mm` : '--'}
      </Tile>
    </motion.section>
  );
}
