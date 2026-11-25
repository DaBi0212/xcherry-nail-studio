/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        cherry: {
          DEFAULT: '#B8001F',
          bright: '#D00024',
          dark: '#8A0017',
          soft: '#FFF0F3',
          muted: '#FDE2E7'
        },
        obsidian: {
          DEFAULT: '#111111',
          soft: '#222222',
          muted: '#555555'
        },
        alabaster: {
          DEFAULT: '#FFFFFF',
          card: '#F9F9F9',
          border: '#E8E8E8'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'coquette': '0 10px 30px -10px rgba(17, 17, 17, 0.08)',
        'cherry-glow': '0 8px 24px -6px rgba(184, 0, 31, 0.38)',
        'sharp': '3px 3px 0px 0px #111111',
        'sharp-cherry': '3px 3px 0px 0px #B8001F'
      }
    },
  },
  plugins: [],
}
