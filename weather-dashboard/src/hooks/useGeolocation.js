// ────────────────────────────────────────────────────────────────
// useGeolocation — wraps navigator.geolocation with typed errors,
// permission-denied UX and cleanup. Never throws synchronously.
// ────────────────────────────────────────────────────────────────
import { useCallback, useRef, useState } from 'react';
import { ApiError } from '../utils/errors';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const getPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Environment without geolocation (older browsers / insecure http)
      if (!('geolocation' in navigator)) {
        const err = new ApiError('Geolocation is not supported by this browser.', {
          kind: 'permission',
          retryable: false,
        });
        setError(err);
        reject(err);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (geoErr) => {
          setLoading(false);
          let message = 'We could not determine your location.';
          if (geoErr.code === geoErr.PERMISSION_DENIED) {
            message = 'Location access was denied. Enable it in your browser settings, or search for a city instead.';
          } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
            message = 'Your location is currently unavailable. Try again in a moment.';
          } else if (geoErr.code === geoErr.TIMEOUT) {
            message = 'Locating you took too long. Please try again.';
          }
          const err = new ApiError(message, {
            kind: 'permission',
            retryable: geoErr.code !== geoErr.PERMISSION_DENIED,
          });
          setError(err);
          reject(err);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
      );
    });
  }, []);

  // Cleanup guard (getCurrentPosition has no cancel API, but we keep
  // the pattern future-proof if we ever switch to watchPosition).
  const stop = useCallback(() => {
    if (watchIdRef.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { getPosition, loading, error, stop };
}
