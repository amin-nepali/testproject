// ────────────────────────────────────────────────────────────────
// Runtime configuration sourced from Vite environment variables.
// All values have safe defaults so the app never crashes because
// of a missing .env file.
// ────────────────────────────────────────────────────────────────
const env = import.meta.env;

export const CONFIG = Object.freeze({
  /** Base URL of the forecast endpoint (Open-Meteo by default). */
  weatherApiUrl: env.VITE_WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast',

  /** Base URL of the geocoding / autocomplete endpoint. */
  geocodingApiUrl:
    env.VITE_GEOCODING_API_URL || 'https://geocoding-api.open-meteo.com/v1/search',

  /** Optional provider key — empty for keyless Open-Meteo. */
  apiKey: env.VITE_WEATHER_API_KEY || '',

  /** In-memory + localStorage response cache TTL, in milliseconds. */
  cacheTtlMs:
    Math.max(1, Number(env.VITE_WEATHER_CACHE_TTL_MINUTES) || 10) * 60 * 1000,

  /** Debounce delay for the search box, in milliseconds. */
  searchDebounceMs: 350,

  /** How many autocomplete suggestions to request. */
  suggestionLimit: 6,

  /** Number of forecast days we ask the provider for (today + 5). */
  forecastDays: 6,

  /** Max entries kept in the "Recent Searches" list. */
  maxRecents: 6,

  /** localStorage namespaces (versioned for painless migrations). */
  storage: {
    theme: 'skycast:theme',
    unit: 'skycast:unit',
    recents: 'skycast:recents:v1',
    favorites: 'skycast:favorites:v1',
    cache: 'skycast:cache:v1',
    lastLocation: 'skycast:last-location:v1',
  },
});
