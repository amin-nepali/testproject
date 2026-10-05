// ────────────────────────────────────────────────────────────────
// useAutocomplete — debounced, cancellable place suggestions.
// The debounce lives here (not in the component) so every consumer
// gets identical throttling behaviour and stale responses are
// aborted before they can flash old results on screen.
// ────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { searchPlaces } from '../services/weatherService';
import { useDebounce } from './useDebounce';
import { CONFIG } from '../config';

export function useAutocomplete(query) {
  const debounced = useDebounce((query ?? '').trim(), CONFIG.searchDebounceMs);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (debounced.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    searchPlaces(debounced, { signal: controller.signal })
      .then((places) => {
        if (controller.signal.aborted) return;
        setSuggestions(places);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return; // superseded request
        setSuggestions([]);
        setError(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [debounced]);

  return { suggestions, loading, error };
}
