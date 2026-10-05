/** @type {import('tailwindcss').Config} */
export default {
  // Class-based dark mode: we toggle the `dark` class on <html>.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Inter with a robust system-font fallback stack.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        glass: {
          light: 'rgba(255,255,255,0.6)',
          dark: 'rgba(15,23,42,0.55)',
        },
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(2, 6, 23, 0.18)',
        'glass-sm': '0 4px 16px 0 rgba(2, 6, 23, 0.12)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        rainfall: {
          '0%': { transform: 'translateY(-20%)', opacity: '0' },
          '20%': { opacity: '0.7' },
          '100%': { transform: 'translateY(120vh)', opacity: '0' },
        },
        snowfall: {
          '0%': { transform: 'translateY(-10%) translateX(0)', opacity: '0' },
          '20%': { opacity: '0.9' },
          '100%': { transform: 'translateY(110vh) translateX(30px)', opacity: '0' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
        floaty: 'floaty 6s ease-in-out infinite',
        rainfall: 'rainfall 1.4s linear infinite',
        snowfall: 'snowfall 7s linear infinite',
        pulseGlow: 'pulseGlow 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
