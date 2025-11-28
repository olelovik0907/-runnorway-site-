/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#116D6B',
        accent: '#F3C316',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
