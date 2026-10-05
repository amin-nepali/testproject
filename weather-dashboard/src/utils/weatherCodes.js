// ────────────────────────────────────────────────────────────────
// WMO weather-code mapping (used by Open-Meteo) + theme metadata.
// Every consumer of "condition" data goes through this module so
// labels, icons and visual themes stay consistent app-wide.
// ────────────────────────────────────────────────────────────────

/**
 * High-level condition buckets. `theme` drives the dynamic
 * background; `icon` selects the glyph in <WeatherIcon />.
 */
const WMO = {
  0: { label: 'Clear sky', bucket: 'clear' },
  1: { label: 'Mainly clear', bucket: 'clear' },
  2: { label: 'Partly cloudy', bucket: 'clouds' },
  3: { label: 'Overcast', bucket: 'clouds' },
  45: { label: 'Fog', bucket: 'fog' },
  48: { label: 'Depositing rime fog', bucket: 'fog' },
  51: { label: 'Light drizzle', bucket: 'drizzle' },
  53: { label: 'Moderate drizzle', bucket: 'drizzle' },
  55: { label: 'Dense drizzle', bucket: 'drizzle' },
  56: { label: 'Freezing drizzle', bucket: 'drizzle' },
  57: { label: 'Dense freezing drizzle', bucket: 'drizzle' },
  61: { label: 'Slight rain', bucket: 'rain' },
  63: { label: 'Moderate rain', bucket: 'rain' },
  65: { label: 'Heavy rain', bucket: 'rain' },
  66: { label: 'Freezing rain', bucket: 'rain' },
  67: { label: 'Heavy freezing rain', bucket: 'rain' },
  71: { label: 'Slight snowfall', bucket: 'snow' },
  73: { label: 'Moderate snowfall', bucket: 'snow' },
  75: { label: 'Heavy snowfall', bucket: 'snow' },
  77: { label: 'Snow grains', bucket: 'snow' },
  80: { label: 'Slight rain showers', bucket: 'showers' },
  81: { label: 'Moderate rain showers', bucket: 'showers' },
  82: { label: 'Violent rain showers', bucket: 'showers' },
  85: { label: 'Slight snow showers', bucket: 'snow' },
  86: { label: 'Heavy snow showers', bucket: 'snow' },
  95: { label: 'Thunderstorm', bucket: 'thunderstorm' },
  96: { label: 'Thunderstorm with hail', bucket: 'thunderstorm' },
  99: { label: 'Thunderstorm with heavy hail', bucket: 'thunderstorm' },
};

/** Fallback for unknown / missing codes. */
const UNKNOWN = { label: 'Unknown conditions', bucket: 'clouds' };

/**
 * @typedef {{label:string, bucket:string}} ConditionInfo
 */

/** Resolve a WMO code into { label, bucket }. Never throws. */
export function describeWeather(code, isDay = true) {
  const info = WMO[Number(code)] ?? UNKNOWN;
  return { ...info, isDay: Boolean(isDay) };
}

/**
 * Visual theme tokens per bucket — consumed by <DynamicBackground />.
 * Gradients are expressed as Tailwind arbitrary classes so they can
 * be applied declaratively.
 */
export const THEME_BY_BUCKET = {
  clear: {
    day: 'from-sky-400 via-cyan-300 to-amber-200 dark:from-sky-900 dark:via-indigo-900 dark:to-amber-900/60',
    night: 'from-indigo-950 via-slate-900 to-violet-950 dark:from-indigo-950 dark:via-black dark:to-violet-950',
    accent: 'text-amber-500',
  },
  clouds: {
    day: 'from-slate-300 via-sky-200 to-zinc-200 dark:from-slate-800 dark:via-slate-900 dark:to-sky-950',
    night: 'from-slate-800 via-slate-900 to-zinc-950 dark:from-slate-900 dark:via-black dark:to-zinc-950',
    accent: 'text-slate-500',
  },
  fog: {
    day: 'from-slate-200 via-gray-100 to-slate-300 dark:from-slate-800 dark:via-gray-900 dark:to-slate-700',
    night: 'from-slate-700 via-gray-800 to-slate-900 dark:from-slate-900 dark:via-gray-950 dark:to-slate-900',
    accent: 'text-slate-400',
  },
  drizzle: {
    day: 'from-sky-300 via-slate-200 to-cyan-200 dark:from-sky-950 dark:via-slate-900 dark:to-cyan-950',
    night: 'from-sky-950 via-slate-900 to-cyan-950 dark:from-sky-950 dark:via-black dark:to-cyan-950',
    accent: 'text-sky-500',
  },
  rain: {
    day: 'from-slate-400 via-sky-300 to-blue-300 dark:from-slate-900 dark:via-blue-950 dark:to-sky-950',
    night: 'from-slate-900 via-blue-950 to-slate-950 dark:from-black dark:via-blue-950 dark:to-slate-950',
    accent: 'text-blue-500',
  },
  showers: {
    day: 'from-cyan-300 via-sky-200 to-blue-200 dark:from-cyan-950 dark:via-sky-950 dark:to-blue-950',
    night: 'from-cyan-950 via-slate-900 to-blue-950 dark:from-cyan-950 dark:via-black dark:to-blue-950',
    accent: 'text-cyan-500',
  },
  snow: {
    day: 'from-sky-100 via-slate-100 to-indigo-100 dark:from-sky-900 dark:via-slate-900 dark:to-indigo-950',
    night: 'from-slate-700 via-slate-800 to-indigo-950 dark:from-slate-800 dark:via-slate-950 dark:to-indigo-950',
    accent: 'text-indigo-400',
  },
  thunderstorm: {
    day: 'from-violet-400 via-slate-300 to-indigo-300 dark:from-violet-950 dark:via-slate-900 dark:to-indigo-950',
    night: 'from-violet-950 via-slate-950 to-indigo-950 dark:from-violet-950 dark:via-black dark:to-indigo-950',
    accent: 'text-violet-500',
  },
};

/** Particle animation used behind the glass panels, or null. */
export function particlesForBucket(bucket) {
  if (['rain', 'showers', 'drizzle', 'thunderstorm'].includes(bucket)) return 'rain';
  if (bucket === 'snow') return 'snow';
  return null;
}

/** Gradient class pair for a bucket + day/night combination. */
export function themeGradient(bucket, isDay) {
  const t = THEME_BY_BUCKET[bucket] ?? THEME_BY_BUCKET.clouds;
  return isDay ? t.day : t.night;
}
