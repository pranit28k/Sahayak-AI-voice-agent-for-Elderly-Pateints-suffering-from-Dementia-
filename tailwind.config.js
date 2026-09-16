/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        sage: {
          50: "#f4f7f4",
          100: "#e4ece4",
          200: "#c9d8c9",
          400: "#7a9a7a",
          600: "#4d6b4d",
          800: "#334533",
        },
        indigoSoft: {
          50: "#f3f4f8",
          100: "#e4e7f1",
          400: "#7b86b8",
          600: "#4c5890",
          800: "#2f3658",
        },
      },
    },
  },
  plugins: [],
};
