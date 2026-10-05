// Header — brand, global search and the animated dark/light toggle.
import { motion } from 'framer-motion';
import Icon from './icons';
import SearchBar from './SearchBar';
import { useWeatherApp } from '../context/WeatherContext';

export default function Header() {
  const { resolvedTheme, toggleTheme } = useWeatherApp();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-glass-sm">
              <Icon.Sun size={20} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Sky<span className="text-sky-500 dark:text-sky-400">Cast</span>
              </h1>
              <p className="-mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Live weather dashboard
              </p>
            </div>
          </div>

          {/* Theme toggle lives here on mobile (search moves below) */}
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} className="sm:hidden" />
        </div>

        {/* Desktop controls */}
        <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>

      <div className="mt-5">
        <SearchBar />
      </div>
    </header>
  );
}

/** Sliding-pill theme switch with sun/moon crossfade. */
function ThemeToggle({ isDark, toggleTheme, className = '' }) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex h-9 w-[68px] items-center rounded-full border border-white/50 bg-white/40 p-1 backdrop-blur transition-colors dark:border-white/10 dark:bg-white/5 ${className}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow ${
          isDark ? 'ml-auto bg-indigo-500' : 'mr-auto bg-amber-400'
        }`}
      >
        {isDark ? <Icon.Moon size={14} /> : <Icon.Sun size={14} />}
      </motion.span>
    </button>
  );
}
