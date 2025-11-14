/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dashboard/src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#667eea',
          600: '#5a67d8',
          700: '#764ba2',
        }
      }
    },
  },
  plugins: [],
}

