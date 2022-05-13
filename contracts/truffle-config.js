require('ts-node').register({
  files: true,
})

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      disableConfirmationListener: true,
    },
  },
  mocha: {},
  compilers: {
    solc: {
      version: '0.8.13',
    },
  },
  console: {
    require: 'init-console.js',
  },

  // add typechain as a post build step (produces typescript typings from contract metadata)
  build: "typechain --target=truffle-v5 'build/contracts/*.json'",
}
