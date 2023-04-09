module.exports = {
  files: ['src/**/__test__/*Test.ts', 'src/**/__test__/*_test.ts'],
  typescript: {
    rewritePaths: {
      'src/': 'build/',
    },
    compile: false,
  },
}
