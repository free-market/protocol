module.exports = {
  files: ['src/**/*test.ts'],
  typescript: {
    rewritePaths: {
      'src/': 'build/',
    },
    compile: false,
  },
}
