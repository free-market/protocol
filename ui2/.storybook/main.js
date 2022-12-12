const path = require('path')
const cracoConfig = require('../craco.config')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

module.exports = {
  staticDirs: ['../public'],
  stories: [
    '../src/**/*.@(stories|story).mdx',
    '../src/**/*.@(stories|story).@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/preset-create-react-app',
      options: {
        scriptsPackageName: 'react-scripts',
      },
    },
    'storybook-dark-mode',
  ],
  framework: '@storybook/react',
  core: {
    builder: 'webpack5',
  },
  webpackFinal(baseConfig, options) {
    const config = {
      ...baseConfig,

      module: {
        ...(baseConfig.module ?? {}),
        rules: [...(baseConfig.module?.rules ?? [])],
      },

      resolve: {
        ...(baseConfig.resolve ?? {}),
        alias: {
          ...(baseConfig.alias ?? {}),
          ...cracoConfig.webpack.alias,
        },
      },

      plugins: baseConfig.plugins.map((plugin) => {
        if (plugin.options?.overlay?.sockIntegration === 'whm') {
          return new ReactRefreshWebpackPlugin({
            overlay: false,
            exclude: /node_modules/i,
            include: /\.([cm]js|[jt]sx?|flow)$/i,
          })
        }
        return plugin
      }),
    }

    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [require('tailwindcss'), require('autoprefixer')],
            },
          },
        },
      ],
      include: path.resolve(__dirname, '../'),
    })

    return config
  },
}
