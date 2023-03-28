import type { HardhatUserConfig } from 'hardhat/config'
import os from 'os'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(os.homedir(), '.env') })

export const coreHardhatConfig: any = {
  solidity: '0.8.18',

  networks: {
    ethereumGoerli: {
      chainId: 5,
      url: 'https://rpc.ankr.com/eth_goerli',
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC,
      },
    },
    arbitrumGoerli: {
      chainId: 421613,
      url: 'https://goerli-rollup.arbitrum.io/rpc',
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC,
      },
    },
    // for testing deployments with local hh node, but not named 'localhost' so is considered 'live' by hardhat-deploy
    hardhat: {
      // chainId: 1,
      forking: {
        url: 'https://rpc.ankr.com/eth',
        blockNumber: 16889307,
      },
    },
    local: {
      // chainId: 1,
      url: 'http://127.0.0.1:8545/',
      //accounts: {
      //  mnemonic: process.env.WALLET_MNEMONIC,
      // },
    },
  },

  // for hardhat-deployer
  namedAccounts: {
    deployer: 0,
    otherUser: 1,
  },
}
