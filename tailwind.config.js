/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'twitter-blue': '#1DA1F2',
        'twitter-dark-blue': '#1991DB',
        'blue-25': '#F8FAFF',
      },
      boxShadow: {
        'twitter': '0 2px 4px 0 rgba(29, 161, 242, 0.1)',
      }
    },
  },
  plugins: [],
}