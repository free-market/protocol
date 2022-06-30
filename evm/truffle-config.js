require("ts-node").register({
  files: true,
});

require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')

const { runTypeChain, glob } = require('typechain')

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      disableConfirmationListener: true,
    },
    goerli: {
      provider: () => {
        return new HDWalletProvider(process.env.GOERLI_MNEMONIC, process.env.GOERLI_URL)
      },
      network_id: '5',
      // gas: 4465030,
      // gasPrice: 10000000000,
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
  // build: "typechain --target=truffle-v5 'build/contracts/*.json'",
}
