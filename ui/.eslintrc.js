module.exports = {
  root: true,
  extends: ['standard-typescript-prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  overrides: [
    {
      files: ['**/*.@(story|stories).*'],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
  ],
}
