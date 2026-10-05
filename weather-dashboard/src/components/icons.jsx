// Small, dependency-free inline SVG icon set (stroke style, 1.8px).
// One component per glyph keeps call-sites readable: <Icon.Search />
import React from 'react';

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function make(path, extra = {}) {
  return function Icon({ size = 18, className = '' }) {
    return (
      <svg width={size} height={size} {...base} className={className} {...extra}>
        {path}
      </svg>
    );
  };
}

export const Icon = {
  Search: make(<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></>),
  Pin: make(<><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></>),
  Crosshair: make(<><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="1.6" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" /></>),
  Star: make(<path d="M12 3l2.7 5.6 6.1.8-4.4 4.3 1.1 6-5.5-2.9L6.5 19.7l1.1-6L3.2 9.4l6.1-.8L12 3z" />, {}),
  StarFilled: make(<path d="M12 3l2.7 5.6 6.1.8-4.4 4.3 1.1 6-5.5-2.9L6.5 19.7l1.1-6L3.2 9.4l6.1-.8L12 3z" />, { fill: 'currentColor' }),
  Clock: make(<><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></>),
  X: make(<><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>),
  Refresh: make(<><path d="M20 12a8 8 0 1 1-2.34-5.66" /><polyline points="20 4 20 8 16 8" /></>),
  Sun: make(<><circle cx="12" cy="12" r="4.5" /><line x1="12" y1="2" x2="12" y2="4.5" /><line x1="12" y1="19.5" x2="12" y2="22" /><line x1="2" y1="12" x2="4.5" y2="12" /><line x1="19.5" y1="12" x2="22" y2="12" /><line x1="4.9" y1="4.9" x2="6.7" y2="6.7" /><line x1="17.3" y1="17.3" x2="19.1" y2="19.1" /><line x1="4.9" y1="19.1" x2="6.7" y2="17.3" /><line x1="17.3" y1="6.7" x2="19.1" y2="4.9" /></>),
  Moon: make(<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />),
  Droplet: make(<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z" />),
  Wind: make(<><path d="M3 8h10a3 3 0 1 0-3-3" /><path d="M3 12h14a3 3 0 1 1-3 3" /><path d="M3 16h7a2.5 2.5 0 1 1-2.5 2.5" /></>),
  Gauge: make(<><path d="M4.5 17a9 9 0 1 1 15 0" /><line x1="12" y1="12" x2="16" y2="8.5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></>),
  Uv: make(<><circle cx="12" cy="14" r="4" /><path d="M12 6V4M6.3 8.3 4.9 6.9M17.7 8.3l1.4-1.4M4 14H2M22 14h-2" /></>),
  Thermometer: make(<path d="M12 3a2.5 2.5 0 0 1 2.5 2.5v8.2a4.5 4.5 0 1 1-5 0V5.5A2.5 2.5 0 0 1 12 3z" />),
  Sunrise: make(<><path d="M12 3v5M5 12l1.8 1.8M19 12l-1.8 1.8M4 19h16" /><path d="M8 15a4 4 0 0 1 8 0" /></>),
  Sunset: make(<><path d="M12 8V3M5 12l1.8 1.8M19 12l-1.8 1.8M4 19h16" /><path d="M8 15a4 4 0 0 1 8 0" /></>),
  Alert: make(<><path d="M12 3 2.5 20h19L12 3z" /><line x1="12" y1="10" x2="12" y2="14.5" /><circle cx="12" cy="17.2" r=".9" fill="currentColor" stroke="none" /></>),
  ChevronDown: make(<polyline points="6 9 12 15 18 9" />),
};

export default Icon;
