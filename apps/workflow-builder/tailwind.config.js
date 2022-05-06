const path = require('path')

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    `${path.resolve(__dirname, '../../ui')}/**/*.{js,ts,jsx,tsx}`
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
