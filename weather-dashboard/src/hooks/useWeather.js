// ────────────────────────────────────────────────────────────────
// useWeather — orchestrates a single location's data lifecycle:
//   • fetch on place change (served instantly from cache when fresh)
//   • request cancellation via AbortController (no race conditions)
//   • typed error state + retry
//   • manual refresh that bypasses the cache
// The component tree only consumes { data, status, error, actions }.
// ────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWeather } from '../services/weatherService';

export const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

export function useWeather(place) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);

  // Always the latest controller so we can abort superseded requests.
  const abortRef = useRef(null);
  // Tracks the in-flight place to ignore stale resolutions.
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (target, { force = false } = {}) => {
      if (!target) return;

      // Cancel any previous request and mark this one as current.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const id = ++requestIdRef.current;

      setStatus(STATUS.LOADING);
      setError(null);

      try {
        const result = await fetchWeather(target, { signal: controller.signal, force });
        if (id !== requestIdRef.current) return; // superseded — drop it
        setData(result);
        setStatus(STATUS.SUCCESS);
      } catch (err) {
        if (err?.name === 'AbortError') return; // intentional cancellation
        if (id !== requestIdRef.current) return;
        setError(err);
        setStatus(STATUS.ERROR);
      }
    },
    [],
  );

  // Re-fetch whenever the selected place changes.
  useEffect(() => {
    if (place) load(place);
    return () => abortRef.current?.abort();
  }, [place?.id ?? null, place?.latitude ?? null, place?.longitude ?? null]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => load(place), [load, place]);

  const refresh = useCallback(() => load(place, { force: true }), [load, place]);

  return {
    data,
    status,
    error,
    isLoading: status === STATUS.LOADING,
    isError: status === STATUS.ERROR,
    isSuccess: status === STATUS.SUCCESS,
    retry,
    refresh,
  };
}
