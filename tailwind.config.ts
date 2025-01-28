/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" // add this line
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5095fc",
        base_dark: "#1e252c",
        base_dim: "#444444",

        text_dark: "#222222",
        text_disabled_dark: "#888888",
        text_light: "#ffffff",

        table_dark_border: "#63676c",
        table_dark_row_even_bg: "#4a4c50",
        table_dark_row_odd_bg: "#56585c",
        table_dark_empty_bg: "#54585e",
        table_dark_disabled_bg: "#33363c",

        menu_bg_dark: "#333333",
        disabled_dark: "#535353",
        sepalater_dark: "#888888",
      }
    }
  },
  plugins: [
    require('flowbite/plugin') // add this line
  ],
}

