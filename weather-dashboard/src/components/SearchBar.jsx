// ────────────────────────────────────────────────────────────────
// SearchBar — autocomplete search with:
//   • debounced suggestions (useAutocomplete)
//   • full keyboard navigation (↑/↓/Enter/Esc) + ARIA combobox
//   • click-outside to dismiss
//   • "Use my location" button wired to the geolocation flow
//   • inline error surface for failed suggestion lookups
// ────────────────────────────────────────────────────────────────
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './icons';
import { useWeatherApp } from '../context/WeatherContext';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { placeLabel } from '../utils/format';
import { userFriendlyMessage } from '../utils/errors';

export default function SearchBar() {
  const { selectPlace, useMyLocation, geoLoading, geoError, isFavorite, toggleFavorite } = useWeatherApp();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { suggestions, loading, error } = useAutocomplete(query);

  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const listId = useId();

  // Open the dropdown as soon as we have something to show.
  useEffect(() => {
    setOpen(query.trim().length >= 2 && (loading || suggestions.length > 0 || !!error));
  }, [query, loading, suggestions, error]);

  // Dismiss on outside click / focus loss.
  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const choose = (place) => {
    if (!place) return;
    selectPlace(place);
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        choose(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        e.preventDefault();
        choose(suggestions[0]); // Enter picks the top match
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleMyLocation = async () => {
    await useMyLocation();
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="glass-card flex items-center gap-2 rounded-2xl px-4 py-2.5">
        <span className="text-slate-400 dark:text-slate-500"><Icon.Search size={18} /></span>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search for a city"
          placeholder="Search for a city…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            aria-label="Clear search"
            className="rounded-full p-1 text-slate-400 transition hover:bg-white/40 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
          >
            <Icon.X size={14} />
          </button>
        )}

        {/* Use-my-location affordance */}
        <button
          type="button"
          onClick={handleMyLocation}
          disabled={geoLoading}
          title="Use my location"
          aria-label="Use my location"
          className="group flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/40 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white/70 disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
        >
          <motion.span animate={geoLoading ? { rotate: 360 } : { rotate: 0 }} transition={geoLoading ? { repeat: Infinity, duration: 1.1, ease: 'linear' } : { duration: 0.3 }}>
            <Icon.Crosshair size={15} />
          </motion.span>
          <span className="hidden sm:inline">{geoLoading ? 'Locating…' : 'My location'}</span>
        </button>
      </div>

      {/* Geolocation error toast (permission denied etc.) */}
      <AnimatePresence>
        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="mt-2 flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-100/70 px-3 py-2 text-xs font-medium text-amber-800 backdrop-blur dark:bg-amber-950/40 dark:text-amber-300"
            role="alert"
          >
            <Icon.Alert size={14} />
            <span>{userFriendlyMessage(geoError)}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="glass-card absolute z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl p-1.5"
          >
            {loading && (
              <li className="px-3 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Searching “{query.trim()}”…
              </li>
            )}

            {!loading && error && (
              <li className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <Icon.Alert size={14} /> {userFriendlyMessage(error)}
              </li>
            )}

            {!loading && !error && suggestions.length === 0 && query.trim().length >= 2 && (
              <li className="px-3 py-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                No matches for “{query.trim()}”. Try a different spelling.
              </li>
            )}

            {!loading &&
              suggestions.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => choose(p)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      i === activeIndex ? 'bg-white/70 dark:bg-white/10' : ''
                    }`}
                  >
                    <span className="text-slate-400 dark:text-slate-500"><Icon.Pin size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.name}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {[p.admin, p.country].filter(Boolean).join(', ')}
                      </span>
                    </span>
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={isFavorite(p) ? 'Remove from favorites' : 'Add to favorites'}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}
                      className={`shrink-0 rounded-full p-1 transition hover:bg-white/60 dark:hover:bg-white/10 ${
                        isFavorite(p) ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'
                      }`}
                    >
                      {isFavorite(p) ? <Icon.StarFilled size={15} /> : <Icon.Star size={15} />}
                    </span>
                  </button>
                </li>
              ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
