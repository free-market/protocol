module.exports = {
  files: ['src/client/**/*test.ts'],
  typescript: {
    rewritePaths: {
      'src/client/': 'dist/',
    },
    compile: false,
  },
}
