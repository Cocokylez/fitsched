/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      colors: {
        accent: {
          light: '#0071e3',
          dark: '#3b9eff',
        },
      },
      backdropBlur: {
        xs: '4px',
      },
      keyframes: {
        orbDrift: {
          '0%':   { transform: 'translate(0, 0) scale(1)' },
          '50%':  { transform: 'translate(40px, -30px) scale(1.08)' },
          '100%': { transform: 'translate(-20px, 20px) scale(0.96)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(52,199,89,0.7)' },
          '50%':       { boxShadow: '0 0 12px rgba(52,199,89,0.9)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        orbDrift:  'orbDrift 20s ease-in-out infinite alternate',
        orbDrift2: 'orbDrift 15s ease-in-out infinite alternate',
        orbDrift3: 'orbDrift 22s ease-in-out infinite alternate',
        spin:      'spin 0.9s linear infinite',
        statusPulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
