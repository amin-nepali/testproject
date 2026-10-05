// ────────────────────────────────────────────────────────────────
// WeatherIcon — hand-drawn animated SVG set (no icon library, no
// emoji font inconsistency). `size` scales the whole glyph; the
// micro-animations (rotating sun, bobbing clouds, falling flakes)
// are pure CSS keyframes inside each variant.
// ────────────────────────────────────────────────────────────────

const SUN = '#fbbf24';
const SUN_DEEP = '#f59e0b';
const MOON = '#e2e8f0';
const CLOUD = '#cbd5e1';
const CLOUD_DARK = '#94a3b8';
const RAIN = '#60a5fa';
const SNOW = '#dbeafe';
const BOLT = '#facc15';

function Svg({ size, children, title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      className="overflow-visible"
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

/** Slowly rotating sun-ray group. */
function SunRays({ cx = 26, cy = 26, r = 16 }) {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <g stroke={SUN_DEEP} strokeWidth="3" strokeLinecap="round" style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'spin 18s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {rays.map((a) => {
        const rad = (a * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * r;
        const y1 = cy + Math.sin(rad) * r;
        const x2 = cx + Math.cos(rad) * (r + 7);
        const y2 = cy + Math.sin(rad) * (r + 7);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </g>
  );
}

function CloudShape({ x = 0, y = 0, scale = 1, color = CLOUD, drift = false }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill={color}
      style={drift ? { animation: 'drift 5s ease-in-out infinite' } : undefined}
    >
      <style>{`@keyframes drift{0%,100%{transform:translate(${x}px,${y}px) scale(${scale})}50%{transform:translate(${x - 3}px,${y}px) scale(${scale})}}`}</style>
      <circle cx="24" cy="34" r="10" />
      <circle cx="36" cy="30" r="12" />
      <circle cx="46" cy="36" r="9" />
      <rect x="22" y="34" width="26" height="11" rx="5.5" />
    </g>
  );
}

export default function WeatherIcon({ code, isDay = true, size = 48, className = '' }) {
  const c = Number(code ?? 3);
  const common = { size };

  // Clear / mainly clear
  if (c === 0 || c === 1) {
    return isDay ? (
      <Svg {...common} title="Clear sky">
        <SunRays />
        <circle cx="26" cy="26" r="12" fill={SUN} />
        <circle cx="26" cy="26" r="12" fill="url(#none)" />
      </Svg>
    ) : (
      <Svg {...common} title="Clear night">
        <path d="M40 10a16 16 0 1 0 12 26A18 18 0 0 1 40 10z" fill={MOON} />
        <circle cx="14" cy="14" r="1.6" fill={MOON} opacity=".8" />
        <circle cx="20" cy="46" r="1.2" fill={MOON} opacity=".6" />
      </Svg>
    );
  }

  // Partly cloudy
  if (c === 2) {
    return isDay ? (
      <Svg {...common} title="Partly cloudy">
        <SunRays cx="22" cy="22" r="12" />
        <circle cx="22" cy="22" r="9" fill={SUN} />
        <CloudShape x={6} y={10} scale={0.9} drift />
      </Svg>
    ) : (
      <Svg {...common} title="Partly cloudy at night">
        <path d="M34 6a13 13 0 1 0 10 21A15 15 0 0 1 34 6z" fill={MOON} />
        <CloudShape x={6} y={12} scale={0.9} drift />
      </Svg>
    );
  }

  // Overcast / fog
  if (c === 3) return <Svg {...common} title="Overcast"><CloudShape x={2} y={2} scale={1.05} /><CloudShape x={12} y={12} scale={0.85} color={CLOUD_DARK} drift /></Svg>;
  if (c === 45 || c === 48) {
    return (
      <Svg {...common} title="Fog">
        <CloudShape x={4} y={-2} scale={0.9} color={CLOUD_DARK} />
        {[0, 1, 2].map((i) => (
          <line key={i} x1="12" y1={42 + i * 6} x2="52" y2={42 + i * 6} stroke={CLOUD_DARK} strokeWidth="3" strokeLinecap="round" opacity={0.8 - i * 0.2}
            style={{ animation: `fogPulse 3s ease-in-out ${i * 0.4}s infinite` }} />
        ))}
        <style>{`@keyframes fogPulse{0%,100%{opacity:.25}50%{opacity:.85}}`}</style>
      </Svg>
    );
  }

  // Drizzle & rain & showers
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(c)) {
    const heavy = [65, 82, 67].includes(c);
    return (
      <Svg {...common} title={heavy ? 'Heavy rain' : 'Rain'}>
        <CloudShape x={2} y={-4} scale={1} color={CLOUD_DARK} />
        {[14, 26, 38, 50].slice(0, heavy ? 4 : 3).map((x, i) => (
          <line key={x} x1={x} y1="40" x2={x - 3} y2="50" stroke={RAIN} strokeWidth="3" strokeLinecap="round"
            style={{ animation: `drop 1.1s linear ${i * 0.25}s infinite` }} />
        ))}
        <style>{`@keyframes drop{0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(10px);opacity:0}}`}</style>
      </Svg>
    );
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(c)) {
    return (
      <Svg {...common} title="Snow">
        <CloudShape x={2} y={-4} scale={1} />
        {[16, 30, 44].map((x, i) => (
          <circle key={x} cx={x} cy="44" r="2.6" fill={SNOW} stroke="#bfdbfe" strokeWidth="1"
            style={{ animation: `flake 2.2s ease-in-out ${i * 0.5}s infinite` }} />
        ))}
        <style>{`@keyframes flake{0%{transform:translateY(-4px);opacity:0}30%{opacity:1}100%{transform:translateY(10px) translateX(4px);opacity:0}}`}</style>
      </Svg>
    );
  }

  // Thunderstorm
  if ([95, 96, 99].includes(c)) {
    return (
      <Svg {...common} title="Thunderstorm">
        <CloudShape x={2} y={-4} scale={1} color={CLOUD_DARK} />
        <path d="M30 34l-8 12h8l-4 12 14-16h-8l6-8z" fill={BOLT} style={{ animation: 'flash 2.4s ease-in-out infinite' }} />
        <style>{`@keyframes flash{0%,60%,100%{opacity:1}70%{opacity:.2}80%{opacity:1}90%{opacity:.3}}`}</style>
      </Svg>
    );
  }

  // Fallback — overcast
  return <Svg {...common} title="Cloudy"><CloudShape x={2} y={2} scale={1.05} /></Svg>;
}
