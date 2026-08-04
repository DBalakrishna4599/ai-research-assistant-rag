/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0e12",
        surface: "#161820",
        border: "#252836",
        primary: "#4f46e5",
        textMain: "#f3f4f6",
        textMuted: "#9ca3af"
      }
    },
  },
  plugins: [],
}