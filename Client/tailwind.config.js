/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#027B8B',
        'primary-100': '#a0e2eb'
      }
    },
  },
  plugins: [],
}