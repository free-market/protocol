module.exports = {
  scriptsPackageName: 'react-scripts',
  options: { scriptsPackageName: 'react-scripts' },
  resolve: {
    fallback: { stream: require.resolve('stream-browserify') },
  },
}
