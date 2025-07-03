/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'primary-purple': '#AA60C8',
        'light-purple-bg': '#DBD0F7',
        'medium-purple-bg': '#D4C3ED',
        'dark-bg': '#121212',
        'dark-card': '#282828',
        'dark-hover': '#3A3A3A',
        'text-light': '#FFFFFF',
        'text-medium': '#B3B3B3',
        'text-dark': '#333333',
        'text-medium-dark': '#555555',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'playfair-display': ['"Playfair Display"', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
} 