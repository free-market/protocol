const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        's-base03': '#002b36',
        's-base02': '#073642',
        's-base01': '#586e75',
        's-base00': '#657b83',
        's-base0': '#839496',
        's-base1': '#93a1a1',
        's-base2': '#eee8d5',
        's-base3': '#fdf6e3',
        's-yellow': '#b58900',
        's-orange': '#cb4b16',
        's-red': '#dc322f',
        's-magenta': '#d33682',
        's-violet': '#6c71c4',
        's-blue': '#268bd2',
        's-cyan': '#2aa198',
        's-green': '#859900',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(function ({ addVariant }) {
      addVariant('poppy', '.fmp-poppy &')
    }),
  ],
}
