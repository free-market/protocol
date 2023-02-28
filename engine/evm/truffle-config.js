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

    ///////////// MAINNETS
    ethereum: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.ETHEREUM_MAINNET_URL)
      },
      network_id: '1',
      disableConfirmationListener: true,
    },
    arbitrum: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.ARBITRUM_MAINNET_URL)
      },
      network_id: '42161',
      gasPrice: '200000000',
      disableConfirmationListener: true,
    },
    avalanche: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.AVALANCHE_MAINNET_URL)
      },
      // gasPrice: '200000000',
      // gas: '1000000',
      network_id: '43114',
      disableConfirmationListener: true,
    },
    optimism: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.OPTIMISM_MAINNET_URL)
      },
      network_id: '10',
      disableConfirmationListener: true,
    },

    ///////////// GOERLIES

    ethereumGoerli: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.ETHEREUM_GOERLI_URL)
      },
      network_id: '5',
      disableConfirmationListener: true,
      // gas: 4465030,
      // gasPrice: 10000000000,
    },
    arbitrumGoerli: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.ARBITRUM_GOERLI_URL)
        // return new HDWalletProvider(process.env.WALLET_MNEMONIC, 'https://goerli-rollup.arbitrum.io/rpc')
      },
      network_id: '421613',
      disableConfirmationListener: true,
    },
    avalancheGoerli: {
      provider: () => {
        return new HDWalletProvider(process.env.WALLET_MNEMONIC, process.env.AVALANCH_GOERLIE_URL)
      },
      network_id: '43113',
      disableConfirmationListener: true,
    },
  },
  mocha: {
    useColors: true,
  },
  compilers: {
    solc: {
      version: '0.8.13',
    },
  },
  console: {
    require: 'init-console.js',
  },
  plugins: [
    'truffle-plugin-stdjsonin'
  ]

  // add typechain as a post build step (produces typescript typings from contract metadata)
  // build: "typechain --target=truffle-v5 'build/contracts/*.json'",
}
