require('ts-node').register({
  files: true,
})

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
    develop: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      disableConfirmationListener: true,
    },
    test: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      disableConfirmationListener: true,
    },
    goerliEthereum: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.GOERLI_ETHEREUM_URL)
      },
      network_id: '5',
      disableConfirmationListener: true,
      // gas: 4465030,
      // gasPrice: 10000000000,
    },
    goerliArbitrum: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.GOERLI_ARBITRUM_URL)
      },
      network_id: '421613',
      disableConfirmationListener: true,
    },
    goerliAvalanche: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.GOERLI_AVALANCHE_URL)
      },
      network_id: '43113',
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
  // build: "typechain --target=truffle-v5 'build/contracts/*.json'",
}
