/** @type {import('tailwindcss').Config} */
// import forms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#008C8C',
          light: '#80C5C5',  // faded version for disabled state
          lightest: '#D9EEEE', // for progress bars,
          lighter:'#E6F4F4'
        },
        gray: {
          DEFAULT:'#667085',
          medium: '#475467', // grayish color
          dark: '#101828',
          
        },
        teal: {
          50: '#e6f7f5', // Light teal background
          400: '#4db6ac', // Teal button color
          500: '#009688', // Teal accent color
        },
        main: { DEFAULT: "#008c8c", light: "#8edadd", lighter: "#f0f7f7" },
        
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [
    // forms,
    require('@tailwindcss/typography'),
  ],
};
