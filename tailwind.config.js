/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#6366f1',
        background: {
          light: '#ffffff',
          dark: '#0b0b0b',
        },
        text: {
          light: '#111827',
          dark: '#f9fafb',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 4px rgba(0,0,0,0.05)',
        card: '0 4px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
