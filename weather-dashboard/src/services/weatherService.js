// ────────────────────────────────────────────────────────────────
// weatherService — the ONLY module that talks to the network.
// Components/hooks never fetch directly; they call these functions.
//
// Design notes:
//  • Provider-agnostic normalisation: everything downstream works
//    with our own shape, so swapping Open-Meteo for another vendor
//    only touches this file (+ weatherCodes.js).
//  • Two-layer cache: hot in-memory Map + persisted localStorage,
//    both TTL-bounded → revisiting a recent city is instant.
//  • AbortController support so rapid searches cancel stale calls.
//  • Every failure becomes a typed ApiError (see utils/errors.js).
// ────────────────────────────────────────────────────────────────

import { CONFIG } from '../config';
import { ApiError } from '../utils/errors';
import { coordKey, storage } from '../utils/helpers';

/* ------------------------------------------------------------------ */
/* Cache                                                               */
/* ------------------------------------------------------------------ */

/** In-memory layer (fast) with a localStorage mirror (survives reloads). */
const memoryCache = new Map();

function cacheKey(lat, lon) {
  return coordKey(lat, lon);
}

function readPersistedCache() {
  return storage.get(CONFIG.storage.cache, {}) ?? {};
}

function getFromCache(key) {
  // 1) memory
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.ts < CONFIG.cacheTtlMs) return mem.data;

  // 2) localStorage
  const persisted = readPersistedCache();
  const entry = persisted[key];
  if (entry && Date.now() - entry.ts < CONFIG.cacheTtlMs) {
    memoryCache.set(key, entry); // promote to memory for next time
    return entry.data;
  }
  return null;
}

function putInCache(key, data) {
  const entry = { ts: Date.now(), data };
  memoryCache.set(key, entry);

  try {
    const persisted = readPersistedCache();
    persisted[key] = entry;

    // Prune: expired entries first, then oldest beyond 40 keys.
    const now = Date.now();
    for (const k of Object.keys(persisted)) {
      if (now - persisted[k].ts > CONFIG.cacheTtlMs) delete persisted[k];
    }
    const keys = Object.keys(persisted);
    if (keys.length > 40) {
      keys
        .sort((a, b) => persisted[a].ts - persisted[b].ts)
        .slice(0, keys.length - 40)
        .forEach((k) => delete persisted[k]);
    }
    storage.set(CONFIG.storage.cache, persisted);
  } catch {
    /* storage full / disabled — memory cache still works */
  }
}

/** Public helper used by UI ("cached" badge, manual refresh). */
export function hasCachedWeather(lat, lon) {
  return getFromCache(cacheKey(lat, lon)) != null;
}

export function clearWeatherCache() {
  memoryCache.clear();
  storage.remove(CONFIG.storage.cache);
}

/* ------------------------------------------------------------------ */
/* Low-level fetch wrapper                                             */
/* ------------------------------------------------------------------ */

async function requestJson(url, { signal, timeoutMs = 12000 } = {}) {
  // Combine caller signal with a hard timeout so hung requests resolve.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'TimeoutError')), timeoutMs);
  const onOuterAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener('abort', onOuterAbort, { once: true });
  }

  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });

    if (!res.ok) {
      throw new ApiError(`The weather service responded with an error (${res.status}).`, {
        status: res.status,
        kind: res.status === 404 ? 'notFound' : 'api',
        retryable: res.status >= 500 || res.status === 429,
      });
    }
    return await res.json();
  } catch (err) {
    if (err?.name === 'AbortError') throw err; // cancellation — caller decides
    if (err instanceof ApiError) throw err;
    if (err?.name === 'TypeError') {
      // fetch itself failed → offline / DNS / CORS
      throw new ApiError('Network request failed.', { kind: 'network' });
    }
    if (err?.name === 'TimeoutError') {
      throw new ApiError('The weather service took too long to respond.', { kind: 'network' });
    }
    throw new ApiError('Unexpected error while contacting the weather service.', { kind: 'unknown' });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onOuterAbort);
  }
}

/* ------------------------------------------------------------------ */
/* Normalisers                                                         */
/* ------------------------------------------------------------------ */

/** Normalise one geocoding result into our internal Place shape. */
function normalizePlace(raw) {
  return {
    id: raw.id ?? `${raw.name}-${raw.latitude},${raw.longitude}`,
    name: raw.name,
    admin: raw.admin1 ?? null,          // state / province
    country: raw.country ?? raw.country_code ?? '',
    countryCode: raw.country_code ?? '',
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    timezone: raw.timezone ?? null,
    population: raw.population ?? null,
  };
}

/** Normalise the Open-Meteo payload into our WeatherData shape. */
function normalizeWeather(raw, place) {
  const c = raw.current ?? {};
  const d = raw.daily ?? {};
  const days = (d.time ?? []).map((date, i) => ({
    date,
    code: d.weather_code?.[i] ?? null,
    tMax: d.temperature_2m_max?.[i] ?? null,
    tMin: d.temperature_2m_min?.[i] ?? null,
    precipProb: d.precipitation_probability_max?.[i] ?? null,
    uvMax: d.uv_index_max?.[i] ?? null,
    sunrise: d.sunrise?.[i] ?? null,
    sunset: d.sunset?.[i] ?? null,
  }));

  return {
    place,
    fetchedAt: Date.now(),
    timezone: raw.timezone ?? null,
    utcOffsetSeconds: raw.utc_offset_seconds ?? 0,
    current: {
      time: c.time ?? null,
      tempC: c.temperature_2m ?? null,
      feelsC: c.apparent_temperature ?? null,
      humidity: c.relative_humidity_2m ?? null,
      windKmh: c.wind_speed_10m ?? null,
      windDeg: c.wind_direction_10m ?? null,
      pressure: c.surface_pressure ?? null,
      precipitation: c.precipitation ?? null,
      code: c.weather_code ?? null,
      isDay: c.is_day === undefined ? true : Boolean(c.is_day),
      uvIndex: days[0]?.uvMax ?? null, // today's daily max UV as headline value
    },
    daily: days,
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Autocomplete search. Returns [] for queries shorter than 2 chars.
 * @returns {Promise<Place[]>}
 */
export async function searchPlaces(query, { signal } = {}) {
  const q = (query ?? '').trim();
  if (q.length < 2) return [];

  const url =
    `${CONFIG.geocodingApiUrl}?name=${encodeURIComponent(q)}` +
    `&count=${CONFIG.suggestionLimit}&language=en&format=json`;

  const data = await requestJson(url, { signal, timeoutMs: 8000 });
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.map(normalizePlace);
}

/**
 * Fetch current + daily weather for a place.
 * Serves from cache when fresh (unless `force`).
 * @returns {Promise<WeatherData>}
 */
export async function fetchWeather(place, { signal, force = false } = {}) {
  if (!place || Number.isNaN(place.latitude) || Number.isNaN(place.longitude)) {
    throw new ApiError('Invalid coordinates for this location.', { kind: 'notFound', retryable: false });
  }

  const key = cacheKey(place.latitude, place.longitude);
  if (!force) {
    const cached = getFromCache(key);
    if (cached) return { ...cached, fromCache: true };
  }

  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: [
      'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
      'is_day', 'precipitation', 'weather_code', 'wind_speed_10m',
      'wind_direction_10m', 'surface_pressure',
    ].join(','),
    daily: [
      'weather_code', 'temperature_2m_max', 'temperature_2m_min',
      'precipitation_probability_max', 'uv_index_max', 'sunrise', 'sunset',
    ].join(','),
    timezone: 'auto',
    forecast_days: String(CONFIG.forecastDays),
  });
  if (CONFIG.apiKey) params.set('apikey', CONFIG.apiKey);

  const raw = await requestJson(`${CONFIG.weatherApiUrl}?${params.toString()}`, { signal });
  const data = normalizeWeather(raw, place);

  putInCache(key, data);
  return { ...data, fromCache: false };
}

/**
 * Reverse-geocode coordinates into a Place (for "Use my location").
 * Falls back to a synthetic "My location" place if lookup fails,
 * so weather can still be shown even without a nice name.
 */
export async function reverseGeocode(lat, lon, { signal } = {}) {
  const fallback = {
    id: `geo-${coordKey(lat, lon)}`,
    name: 'My location',
    admin: null,
    country: '',
    countryCode: '',
    latitude: Number(lat),
    longitude: Number(lon),
    timezone: null,
    population: null,
  };

  try {
    // Open-Meteo geocoding has no reverse endpoint; we reuse the
    // provider-agnostic pattern and label by rounded coordinates.
    // Swap for Nominatim/your proxy's reverse API in production if
    // you need street-level names.
    const url = `${CONFIG.geocodingApiUrl}?name=${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}&count=1&language=en&format=json`;
    const data = await requestJson(url, { signal, timeoutMs: 6000 });
    const hit = data?.results?.[0];
    return hit ? normalizePlace(hit) : fallback;
  } catch {
    return fallback; // graceful degradation — never block the user
  }
}
