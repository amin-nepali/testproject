// ────────────────────────────────────────────────────────────────
// SavedPlaces — sidebar with Favorites + Recent Searches, both
// persisted to LocalStorage through the context. Chips re-select a
// place instantly (cache makes it network-free) and can be removed.
// ────────────────────────────────────────────────────────────────
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './icons';
import { useWeatherApp } from '../context/WeatherContext';

function PlaceRow({ place, active, onRemove }) {
  const { selectPlace } = useWeatherApp();
  return (
    <motion.li layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8, transition: { duration: 0.15 } }}>
      <div
        className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition ${
          active ? 'bg-white/70 shadow-sm dark:bg-white/10' : 'hover:bg-white/40 dark:hover:bg-white/5'
        }`}
      >
        <button type="button" onClick={() => selectPlace(place)} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-semibold">{place.name}</span>
          <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
            {[place.admin, place.country].filter(Boolean).join(', ')}
          </span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${place.name}`}
          className="rounded-full p-1 text-slate-300 opacity-0 transition hover:bg-white/60 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-white/10"
        >
          <Icon.X size={13} />
        </button>
      </div>
    </motion.li>
  );
}

export default function SavedPlaces() {
  const { favorites, recents, removeRecent, clearRecents, toggleFavorite, place } = useWeatherApp();

  const isActive = (p) =>
    place && Number(p.latitude).toFixed(2) === Number(place.latitude).toFixed(2) &&
    Number(p.longitude).toFixed(2) === Number(place.longitude).toFixed(2);

  return (
    <aside className="space-y-6" aria-label="Saved locations">
      {/* Favorites */}
      <section className="glass-card p-4">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
          <span className="text-amber-400"><Icon.StarFilled size={14} /></span> Favorites
        </h3>
        {favorites.length === 0 ? (
          <p className="px-1 py-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            Tap the ★ on a city to pin it here.
          </p>
        ) : (
          <ul className="space-y-1">
            <AnimatePresence initial={false}>
              {favorites.map((p) => (
                <PlaceRow key={`${p.id}-fav`} place={p} active={isActive(p)} onRemove={() => toggleFavorite(p)} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      {/* Recent searches */}
      <section className="glass-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
            <Icon.Clock size={14} /> Recent
          </h3>
          {recents.length > 0 && (
            <button
              type="button"
              onClick={clearRecents}
              className="text-[11px] font-semibold text-slate-400 transition hover:text-rose-500 dark:text-slate-500"
            >
              Clear all
            </button>
          )}
        </div>
        {recents.length === 0 ? (
          <p className="px-1 py-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            Your searched cities will appear here.
          </p>
        ) : (
          <ul className="space-y-1">
            <AnimatePresence initial={false}>
              {recents.map((p) => (
                <PlaceRow key={`${p.id}-recent`} place={p} active={isActive(p)} onRemove={() => removeRecent(p)} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </aside>
  );
}
