// ────────────────────────────────────────────────────────────────
// Generic utilities: debounce, safe storage, cache keying.
// ────────────────────────────────────────────────────────────────

/**
 * Classic trailing-edge debounce. Cancelling on unmount is the
 * caller's responsibility (see useDebounce hook).
 */
export function debounce(fn, wait = 300) {
  let timer = null;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/** Round coordinates to ~1 km precision so nearby lookups share a cache slot. */
export function coordKey(lat, lon) {
  return `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
}

/**
 * localStorage wrappers that never throw (Safari private mode,
 * quota errors, SSR, disabled storage…).
 */
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

/** Deterministic-ish pseudo random for stable particle fields. */
export function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Clamp helper used by the mini temperature chart. */
export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
