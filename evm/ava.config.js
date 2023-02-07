module.exports = {
  files: ['e2e/**/*.e2e.ts'],
  typescript: {
    rewritePaths: {
      'e2e/': 'build/e2e/',
    },
    compile: false,
  },
  timeout: '2m',
}
