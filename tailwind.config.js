/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: "#10151C",
        navy: "#172A3A",
        gold: "#C9A96E",
        "gold-dark": "#b09259",
        warmbg: "#F7F7F5",
        maintext: "#18202A",
        subtext: "#697586",
        cardborder: "#E5E2DC",
        success: "#3D8067",
        danger: "#B85C5C",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', "sans-serif"],
      },
    },
  },
  plugins: [],
};