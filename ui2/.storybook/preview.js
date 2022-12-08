import '!style-loader!css-loader!postcss-loader!tailwindcss/tailwind.css'
import 'tailwindcss/tailwind.css'
import '../src/fonts.css'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  darkMode: {
    // Override the default dark theme
    dark: { appBg: '#18181b' },
    // Override the default light theme
    light: { appBg: '#f4f4f5' },
  },
}

export const globalTypes = {
  preset: {
    name: 'Preset',
    description: 'starting workflow steps',
    defaultValue: 'none',
    toolbar: {
      icon: 'circlehollow',
      items: ['none', '1inch'],
      // Should "Container size" be shown, or just the "circlehollow" icon
      showName: true,
    },
  },
}
