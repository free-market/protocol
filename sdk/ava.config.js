module.exports = {
  files: ['src/**/*test.ts'],
  typescript: {
    rewritePaths: {
      'src/': 'dist/',
    },
    compile: false,
  },
}
