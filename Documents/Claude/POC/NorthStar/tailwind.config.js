/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f1a",
        surface: "#1a1a2e",
        accent: "#c9a96e",
        "accent-2": "#7c6fcd",
        "ns-text": "#f0ede8",
        muted: "#6b6880",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
