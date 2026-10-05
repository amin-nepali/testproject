// ────────────────────────────────────────────────────────────────
// Pure formatting helpers. No React, no side effects — trivially
// unit-testable and shared by every component.
// ────────────────────────────────────────────────────────────────

/** Convert Celsius to Fahrenheit. */
export function cToF(c) {
  return c * 1.8 + 32;
}

/**
 * Render a temperature in the active unit.
 * @param {number} celsius
 * @param {'C'|'F'} unit
 * @param {boolean} showDecimal
 */
export function formatTemp(celsius, unit = 'C', showDecimal = false) {
  if (celsius == null || Number.isNaN(celsius)) return '--°';
  const v = unit === 'F' ? cToF(celsius) : celsius;
  return `${showDecimal ? v.toFixed(1) : Math.round(v)}°`;
}

/** Wind speed: provider sends km/h → convert to mph when imperial. */
export function formatWind(kmh, unit = 'C') {
  if (kmh == null) return '--';
  return unit === 'F' ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`;
}

/** Compass direction from bearing degrees ("284° → WNW"). */
export function windDirection(deg) {
  if (deg == null) return '';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(((deg % 360) / 22.5)) % 16];
}

/** Qualitative UV-index label. */
export function uvLabel(uv) {
  if (uv == null) return '—';
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very high';
  return 'Extreme';
}

/** Pressure hPa with unit label. */
export function formatPressure(hpa) {
  return hpa == null ? '--' : `${Math.round(hpa)} hPa`;
}

/** Short weekday name from an ISO date string ("2026-10-05" → "Mon"). */
export function weekdayName(iso, indexFromToday = -1) {
  if (indexFromToday === 0) return 'Today';
  if (indexFromToday === 1) return 'Tomorrow';
  const d = new Date(`${iso}T12:00:00`); // noon to dodge DST edge cases
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

/** "Oct 5" style date label. */
export function shortDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Local HH:mm from an ISO timestamp, using the location's timezone offset. */
export function formatClock(iso, utcOffsetSeconds = 0) {
  if (!iso) return '--:--';
  const base = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  if (Number.isNaN(base.getTime())) return '--:--';
  const local = new Date(base.getTime() + utcOffsetSeconds * 1000);
  return local.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** Human "updated x min ago" string. */
export function timeAgo(ts) {
  if (!ts) return 'just now';
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
}

/** Single-line place label: "London, United Kingdom". */
export function placeLabel(place) {
  if (!place) return 'Unknown location';
  return [place.name, place.country].filter(Boolean).join(', ');
}
