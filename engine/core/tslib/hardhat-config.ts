import { HardhatUserConfig, task } from 'hardhat/config'
import os from 'os'
import path from 'path'
import dotenv from 'dotenv'
import 'hardhat-preprocessor'
import { removeConsoleLog } from 'hardhat-preprocessor'
import fs from 'fs'

dotenv.config({ path: path.join(os.homedir(), '.env') })

task('deploymentSource', 'Prints the source code for a deployed contract')
  .addParam('contract', 'The name of the contract, e.g., MyAwesomeContract')
  .addParam('source', 'The path to the contract source code, e.g., contracts/MyAwesomeContract.sol')
  .setAction(async (args, hre) => {
    const { deployments } = hre
    const deployment = await deployments.get(args.contract)
    // console.log(deployment.solcInputHash)
    // console.log(hre.network.name)
    const solcInputsFname = `deployments/${hre.network.name}/solcInputs/${deployment.solcInputHash}.json`
    const solcInputsStr = fs.readFileSync(solcInputsFname).toString()
    const solcInputs = JSON.parse(solcInputsStr)
    console.log(solcInputs.sources[args.source].content)
    // const solcInput =
  })

export const coreHardhatConfig: HardhatUserConfig = {
  solidity: '0.8.18',

  networks: {
    arbitrum: {
      url: process.env.ARBITRUM_MAINNET_URL,
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC,
      },
    },
    optimism: {
      url: process.env.OPTIMISM_MAINNET_URL,
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC,
      },
    },
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
      chainId: (process.env.HARDHAT_CHAIN_ID && parseInt(process.env.HARDHAT_CHAIN_ID)) || 31337,
      forking: {
        url: process.env.HARDHAT_FORK_URL || 'https://rpc.ankr.com/eth',
        // blockNumber: 16889307,
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
  preprocess: {
    eachLine: removeConsoleLog(hre => hre.network.name !== 'hardhat' && hre.network.name !== 'localhost'),
  },
}
