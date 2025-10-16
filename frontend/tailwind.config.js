/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        yellow: {
          glow: '#fcd34d',
        }
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          'from': {
            textShadow: '0 0 20px rgba(252, 211, 77, 0.5)',
          },
          'to': {
            textShadow: '0 0 30px rgba(252, 211, 77, 0.8), 0 0 40px rgba(252, 211, 77, 0.3)',
          },
        }
      }
    },
  },
  plugins: [],
}
