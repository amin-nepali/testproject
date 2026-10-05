// ────────────────────────────────────────────────────────────────
// WeatherProvider — the single source of truth for:
//   • selected place + its weather (via useWeather)
//   • unit preference (°C / °F, persisted)
//   • theme (dark / light, persisted, respects system default)
//   • recent searches & favorites (persisted to LocalStorage)
// Components consume it through `useWeatherApp()` — no prop drilling.
// ────────────────────────────────────────────────────────────────
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../config';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWeather } from '../hooks/useWeather';
import { reverseGeocode } from '../services/weatherService';
import { useGeolocation } from '../hooks/useGeolocation';

const WeatherContext = createContext(null);

/** Same-place test used to de-dupe recents/favorites. */
const samePlace = (a, b) =>
  a && b && Number(a.latitude).toFixed(2) === Number(b.latitude).toFixed(2) &&
  Number(a.longitude).toFixed(2) === Number(b.longitude).toFixed(2);

export function WeatherProvider({ children }) {
  /* ---------------- persisted preferences ---------------- */
  const [unit, setUnit] = useLocalStorage(CONFIG.storage.unit, 'C'); // 'C' | 'F'
  const [theme, setTheme] = useLocalStorage(CONFIG.storage.theme, null); // 'light'|'dark'|null(system)
  const [recents, setRecents] = useLocalStorage(CONFIG.storage.recents, []);
  const [favorites, setFavorites] = useLocalStorage(CONFIG.storage.favorites, []);

  /* ---------------- selected place ---------------- */
  // Restore last viewed location on reload for a seamless return visit.
  const [lastPlace] = useLocalStorage(CONFIG.storage.lastLocation, null);
  const [place, setPlaceState] = useState(() => lastPlace ?? null);
  const [geoLoading, setGeoLoading] = useState(false);
  const geolocation = useGeolocation();

  const weather = useWeather(place);

  /* ---------------- theme side-effects ---------------- */
  useEffect(() => {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
    const resolved = theme ?? (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [theme]);

  /* Keep "last location" persisted so a refresh restores the city. */
  useEffect(() => {
    if (place) {
      // write-through without re-reading: reuse storage helper via localStorage key
      try {
        window.localStorage.setItem(CONFIG.storage.lastLocation, JSON.stringify(place));
      } catch { /* noop */ }
    }
  }, [place]);

  /* ---------------- actions ---------------- */
  const pushRecent = useCallback(
    (p) => {
      setRecents((prev) => [p, ...prev.filter((r) => !samePlace(r, p))].slice(0, CONFIG.maxRecents));
    },
    [setRecents],
  );

  const selectPlace = useCallback(
    (p) => {
      if (!p) return;
      setPlaceState(p);
      pushRecent(p);
    },
    [pushRecent],
  );

  /** "Use my location": geolocate → reverse-geocode → select. */
  const useMyLocation = useCallback(async () => {
    setGeoLoading(true);
    try {
      const coords = await geolocation.getPosition();
      const located = await reverseGeocode(coords.latitude, coords.longitude);
      selectPlace(located);
      return located;
    } catch {
      // typed error already exposed through geolocation.error — swallow here
      return null;
    } finally {
      setGeoLoading(false);
    }
  }, [geolocation, selectPlace]);

  const toggleUnit = useCallback(() => setUnit((u) => (u === 'C' ? 'F' : 'C')), [setUnit]);

  const toggleTheme = useCallback(
    () => setTheme((t) => {
      const current = t ?? (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      return current === 'dark' ? 'light' : 'dark';
    }),
    [setTheme],
  );

  const isFavorite = useCallback((p) => favorites.some((f) => samePlace(f, p)), [favorites]);

  const toggleFavorite = useCallback(
    (p) => {
      if (!p) return;
      setFavorites((prev) =>
        prev.some((f) => samePlace(f, p)) ? prev.filter((f) => !samePlace(f, p)) : [p, ...prev].slice(0, 12),
      );
    },
    [setFavorites],
  );

  const removeRecent = useCallback(
    (p) => setRecents((prev) => prev.filter((r) => !samePlace(r, p))),
    [setRecents],
  );

  const clearRecents = useCallback(() => setRecents([]), [setRecents]);

  /* ---------------- context value ---------------- */
  const value = useMemo(
    () => ({
      place,
      selectPlace,
      useMyLocation,
      geoLoading,
      geoError: geolocation.error,

      data: weather.data,
      status: weather.status,
      error: weather.error,
      isLoading: weather.isLoading,
      isError: weather.isError,
      retry: weather.retry,
      refresh: weather.refresh,

      unit,
      toggleUnit,
      theme: theme ?? 'system',
      resolvedTheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      toggleTheme,

      recents,
      removeRecent,
      clearRecents,
      favorites,
      toggleFavorite,
      isFavorite,
    }),
    [
      place, selectPlace, useMyLocation, geoLoading, geolocation.error,
      weather.data, weather.status, weather.error, weather.isLoading,
      weather.isError, weather.retry, weather.refresh,
      unit, toggleUnit, theme, toggleTheme,
      recents, removeRecent, clearRecents, favorites, toggleFavorite, isFavorite,
    ],
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

/** Convenience accessor — throws early if used outside the provider. */
export function useWeatherApp() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeatherApp must be used inside <WeatherProvider>');
  return ctx;
}
