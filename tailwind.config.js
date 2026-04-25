/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'snooker-green': '#0f7b0f',
        'snooker-red': '#dc2626',
        'snooker-yellow': '#facc15',
        'snooker-blue': '#2563eb',
        'snooker-pink': '#ec4899',
        'snooker-black': '#1f2937',
        'snooker-brown': '#92400e',
      },
      fontFamily: {
        'sans': ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        'heading': ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'media',
}