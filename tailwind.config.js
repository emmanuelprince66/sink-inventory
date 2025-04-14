/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-green": {
          100: "#0D261C",
          200: "#EEF4EF",
          300: "#52B661",
          500: "#EDF8EE",
          600: "#FEFFFE",
        },
        "primary-gray": {
          100: "#535353",
        },
        "primary-red": {
          100: "#D23838",
        },
      },
    },
  },
  plugins: [],
};
