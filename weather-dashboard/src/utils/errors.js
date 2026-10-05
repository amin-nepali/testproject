// ────────────────────────────────────────────────────────────────
// Typed application errors. Every failure path funnels through one
// of these so the UI can render precise, friendly copy and the
// error boundary / hooks can branch on `err.kind`.
// ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, { status = 0, kind = 'api', retryable = true } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;           // api | network | notFound | permission | unknown
    this.retryable = retryable;
  }
}

/** Map a thrown value into a user-facing sentence. Never throws. */
export function userFriendlyMessage(err) {
  if (!err) return 'Something went wrong. Please try again.';
  if (err.kind === 'network') {
    return "We couldn't reach the weather service. Check your internet connection and try again.";
  }
  if (err.kind === 'notFound') {
    return err.message || "We couldn't find that location. Try a different city name.";
  }
  if (err.kind === 'permission') {
    return err.message || 'Location access was denied. You can enable it in your browser settings or search for a city instead.';
  }
  if (err instanceof ApiError) {
    return err.message;
  }
  return 'Something went wrong while loading the weather data.';
}
