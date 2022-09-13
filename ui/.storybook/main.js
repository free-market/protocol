const path = require('path');
const cracoConfig = require('../craco.config');

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
        scriptsPackageName: 'react-scripts'
      }
    }
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
    };

      config.module.rules.push({
        test: /\.css$/,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [require('tailwindcss'), require('autoprefixer')]
              }
            },
          },
        ],
        include: path.resolve(__dirname, '../'),
      });

    return config;
  },
};
