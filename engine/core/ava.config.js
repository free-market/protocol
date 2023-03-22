module.exports = {
  files: ['tslib/**/__test__/*Test.ts', 'tslib/**/__test__/*_test.ts'],
  typescript: {
    rewritePaths: {
      'tslib/': 'build/tslib/',
    },
    compile: false,
  },
}
