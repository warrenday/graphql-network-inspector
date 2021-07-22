const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      indigo: colors.indigo,
      red: colors.red,
      yellow: colors.amber,
      blue: colors.blue,
      green: colors.green,
      purple: colors.purple,
    },
  },
  variants: {
    extend: {
      borderWidth: ["last"],
      backgroundColor: ["odd", "even"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
