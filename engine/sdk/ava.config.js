module.exports = {
  files: ['src/**/__test__/*Test.ts'],
  typescript: {
    rewritePaths: {
      'src/': 'build/',
    },
    compile: false,
  },
}
