// ────────────────────────────────────────────────────────────────
// Dashboard — composes the layout and maps context state → views:
//   idle  → EmptyState (welcome + quick-pick cities)
//   load  → Skeleton shimmer
//   error → friendly ErrorNotice with Retry
//   ok    → WeatherCard + MetricsGrid + ForecastSection
// Responsive grid: single column on mobile, sidebar rail ≥ lg.
// ────────────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import DynamicBackground from './DynamicBackground';
import Header from './Header';
import WeatherCard from './WeatherCard';
import MetricsGrid from './MetricsGrid';
import ForecastSection from './ForecastSection';
import SavedPlaces from './SavedPlaces';
import DashboardSkeleton from './Skeleton';
import EmptyState from './EmptyState';
import Icon from './icons';
import { useWeatherApp } from '../context/WeatherContext';
import { userFriendlyMessage } from '../utils/errors';
import { describeWeather } from '../utils/weatherCodes';

function ErrorNotice() {
  const { error, retry } = useWeatherApp();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mx-auto max-w-lg p-8 text-center"
      role="alert"
    >
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
        <Icon.Alert size={24} />
      </span>
      <h2 className="text-base font-bold">Couldn’t load the weather</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{userFriendlyMessage(error)}</p>
      <button
        type="button"
        onClick={retry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <Icon.Refresh size={15} /> Try again
      </button>
    </motion.div>
  );
}

export default function Dashboard() {
  const { place, data, isLoading, isError, status, retry } = useWeatherApp();

  // Drive the dynamic background from current conditions.
  const cond = data?.current ? describeWeather(data.current.code, data.current.isDay) : null;

  return (
    <>
      {/* Background is part of the dashboard so it can read the data */}
      <DynamicBackground bucket={cond?.bucket ?? (place ? 'clouds' : 'clear')} isDay={cond?.isDay ?? true} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
        <Header />

        <main className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-6">
            {!place && status === 'idle' && !isLoading && <EmptyState />}
            {place && isLoading && !data && <DashboardSkeleton />}
            {place && isError && !data && <ErrorNotice />}

            {data && (
              <div className="space-y-6">
                {/* Keep stale data visible while a refresh spins */}
                {isError ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-100/60 px-4 py-2 text-xs font-semibold text-amber-800 backdrop-blur dark:bg-amber-950/30 dark:text-amber-300">
                    <Icon.Alert size={14} /> Couldn’t refresh — showing the last known data.{' '}
                    <button type="button" onClick={retry} className="underline underline-offset-2">Retry</button>
                  </div>
                ) : null}
                <WeatherCard />
                <MetricsGrid />
                <ForecastSection />
              </div>
            )}
          </div>

          {/* Sidebar rail — stacks under content on mobile */}
          <SavedPlaces />
        </main>

        <footer className="mt-12 pb-6 text-center text-[11px] font-medium text-slate-500 dark:text-slate-500">
          SkyCast · Weather data by{' '}
          <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-300">
            Open-Meteo
          </a>
        </footer>
      </div>
    </>
  );
}
