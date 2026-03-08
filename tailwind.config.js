/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",    // Deep Blue
        secondary: "#F8FAFC",  // Soft White
        accent: "#8B5E3C",     // Brown
        dark: "#111827",       // Rich Black
      },
    },
  },
  plugins: [],
}
