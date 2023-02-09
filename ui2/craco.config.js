/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack')
const path = require('path')
const { whenProd } = require('@craco/craco')
const cssnano = require('cssnano')
const {
  compilerOptions: { paths },
} = require('./tsconfig.json')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  eslint: {
    mode: 'file',
  },
  webpack: {
    // Set them your alias in the tsconfig.json
    alias: Object.keys(paths).reduce(
      (all, alias) => ({
        ...all,
        [alias.replace('/*', '')]: path.resolve(
          __dirname,
          'src',
          paths[alias][0].replace('/*', ''),
        ),
      }),
      {
        stream: 'stream-browserify',
        http: 'stream-http',
        https: 'https-browserify',
        crypto: 'crypto-browserify',
        os: 'os-browserify/browser',
        path: 'path-browserify',
      },
    ),
    configure: (config) => {
      config.plugins.push(new NodePolyfillPlugin({
        excludeAliases: ['console']
      }))
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer'],
        }),
      ),
        (config.resolve = {
          ...config.resolve,
          fallback: {
            ...config.resolve.fallback,
            stream: require.resolve('stream-browserify'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            crypto: require.resolve('crypto-browserify'),
            os: require.resolve('os-browserify/browser'),
            path: require.resolve('path-browserify'),
          },
        })
      return config
    },
  },
  style: {
    postcss: {
      plugins: (plugins) => whenProd(() => [...plugins, cssnano], []),
    },
  },
  jest: {
    configure: {
      // Set them your alias in the tsconfig.json
      moduleNameMapper: Object.keys(paths).reduce(
        (all, alias) => ({
          ...all,
          [alias.replace('/*', '/(.*)')]: path.join(
            '<rootDir>/src/',
            paths[alias][0].replace('/*', '/$1'),
          ),
        }),
        {},
      ),
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    },
  },
}
