/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0f7ff',
          100: '#b3ecff',
          200: '#80e0ff',
          300: '#4dd9ff',
          400: '#26d4ff',
          500: '#00B4E5',
          600: '#0096c7',
          700: '#007aa8',
          800: '#005e8a',
          900: '#004a6b',
        },
        accent: {
          purple: '#7C58A2',
          dark: '#0E1B25',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(14, 27, 37, 0.08)',
        'hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
