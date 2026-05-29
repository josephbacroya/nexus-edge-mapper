// tailwind.config.js
// Note: This project uses Tailwind CSS v4, which does not require a tailwind.config.js file
// by default. All theme variables and configuration are managed in app/globals.css
// using the new @theme directive. This file is provided for legacy compatibility.
module.exports = {
  content: [
    "./app/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
