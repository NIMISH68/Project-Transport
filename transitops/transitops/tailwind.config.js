/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: '#F3EDE1',
          soft: '#FBF8F2',
          deep: '#E7DCC4',
        },
        ledger: {
          line: '#D8CBB0',
          linedark: '#2A3441',
        },
        ink: {
          DEFAULT: '#1F2A37',
          soft: '#4B5768',
          dark: '#E7E2D3',
          darksoft: '#9FA9B5',
        },
        navy: {
          DEFAULT: '#1B3358',
          light: '#2F4C74',
          bright: '#3E6FA8',
          brighter: '#5C8FC4',
        },
        brass: {
          DEFAULT: '#A9863A',
          soft: '#C79A4B',
          deep: '#8A6D2E',
        },
        oxblood: {
          DEFAULT: '#8B3A3A',
          dark: '#B0524F',
        },
        racing: {
          DEFAULT: '#3F6E52',
          dark: '#5B9279',
        },
        obsidian: {
          DEFAULT: '#0B0F14',
          surface: '#12181F',
          raised: '#171F28',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"EB Garamond"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        ledger: '0 1px 2px rgba(31,42,55,0.06), 0 8px 24px -12px rgba(31,42,55,0.18)',
        ledgerDark: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      letterSpacing: {
        widest2: '0.22em',
      },
    },
  },
  plugins: [],
}
