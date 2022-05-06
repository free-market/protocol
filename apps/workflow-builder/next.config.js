module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.jsx$/,
      use: [
        options.defaultLoaders.babel,
      ],
    })

    return config
  },
}
