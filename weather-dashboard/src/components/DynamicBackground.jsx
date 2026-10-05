// ────────────────────────────────────────────────────────────────
// DynamicBackground — condition-driven visuals behind the glass:
//   • cross-fading gradient wash (day/night + weather bucket)
//   • slow-moving blurred orbs
//   • rain streaks / snowflakes particle fields (CSS keyframes,
//     GPU-friendly transforms only; count capped for performance)
// Memoised on (bucket, isDay) so it never re-renders on data ticks.
// ────────────────────────────────────────────────────────────────
import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { particlesForBucket, themeGradient } from '../utils/weatherCodes';
import { seededRandom } from '../utils/helpers';

const RAIN_COUNT = 36;
const SNOW_COUNT = 28;

function RainLayer({ seed }) {
  const drops = useMemo(() => {
    const rnd = seededRandom(seed);
    return Array.from({ length: RAIN_COUNT }, () => ({
      left: rnd() * 100,          // vw %
      delay: rnd() * 1.4,         // s
      duration: 0.9 + rnd() * 0.8,
      height: 14 + rnd() * 22,    // px
      opacity: 0.25 + rnd() * 0.4,
    }));
  }, [seed]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {drops.map((d, i) => (
        <span
          key={i}
          className="absolute top-0 w-px animate-rainfall rounded-full bg-gradient-to-b from-transparent via-sky-300/70 to-sky-100/90"
          style={{
            left: `${d.left}%`,
            height: `${d.height}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}

function SnowLayer({ seed }) {
  const flakes = useMemo(() => {
    const rnd = seededRandom(seed);
    return Array.from({ length: SNOW_COUNT }, () => ({
      left: rnd() * 100,
      delay: rnd() * 7,
      duration: 5 + rnd() * 6,
      size: 3 + rnd() * 5,
      opacity: 0.4 + rnd() * 0.5,
    }));
  }, [seed]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="absolute top-0 animate-snowfall rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            opacity: f.opacity,
          }}
        />
      ))}
    </div>
  );
}

function DynamicBackgroundInner({ bucket = 'clouds', isDay = true }) {
  const gradient = themeGradient(bucket, isDay);
  const particles = particlesForBucket(bucket);
  const seed = useMemo(() => Math.abs(Math.round((bucket.charCodeAt(0) ?? 1) * 9973)), [bucket]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden transition-colors duration-700" aria-hidden="true">
      {/* Base wash that follows dark/light mode */}
      <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 transition-colors duration-700" />

      {/* Condition gradient — cross-fades when the weather changes */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`${bucket}-${isDay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-gradient-to-br opacity-70 dark:opacity-50 ${gradient}`}
        />
      </AnimatePresence>

      {/* Slow drifting blurred orbs for depth */}
      <div className={`absolute -left-32 top-1/4 h-96 w-96 animate-pulseGlow rounded-full bg-white/25 blur-3xl dark:bg-white/5`} />
      <div className={`absolute -right-24 bottom-10 h-80 w-80 animate-pulseGlow rounded-full bg-sky-200/30 blur-3xl dark:bg-indigo-400/10`} style={{ animationDelay: '2.5s' }} />

      {/* Particle fields */}
      {particles === 'rain' && <RainLayer seed={seed} />}
      {particles === 'snow' && <SnowLayer seed={seed} />}
    </div>
  );
}

/** Only re-render when the *visual* inputs change, not every fetch. */
const DynamicBackground = memo(
  DynamicBackgroundInner,
  (a, b) => a.bucket === b.bucket && a.isDay === b.isDay,
);

export default DynamicBackground;
