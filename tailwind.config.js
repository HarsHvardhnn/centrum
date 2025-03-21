/** @type {import('tailwindcss').Config} */
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
          lightest: '#D9EEEE', // for progress bars
        },
        gray: {
          DEFAULT:'#667085',
          medium: '#475467', // grayish color
          dark: '#101828',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
};
