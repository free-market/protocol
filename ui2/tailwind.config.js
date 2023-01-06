const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: () => ({
        'shimmer-gradient':
          'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.03) 30%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 70%, rgba(255, 255, 255, 0) 100%)',
      }),
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
      animation: {
        wave: 'shimmer 1.25s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(function ({ addVariant }) {
      addVariant('poppy', '.fmp-poppy &')
      addVariant('force-hover', '&[data-force-hover="true"]')
      addVariant('group-force-hover', '.group[data-force-hover="true"] &')
      addVariant('force-active', '&[data-force-active="true"]')
      addVariant('group-force-active', '.group[data-force-hover="true"] &')
    }),
  ],
}
