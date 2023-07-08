import { HardhatUserConfig, task } from 'hardhat/config'
import os from 'os'
import path from 'path'
import dotenv from 'dotenv'
import 'hardhat-preprocessor'
import { removeConsoleLog } from 'hardhat-preprocessor'
import fs from 'fs'
import Crypto from 'crypto'
import { tmpdir } from 'os'
const execSync = require('child_process').execSync

function tmpFile(ext: string) {
  return path.join(tmpdir(), `temp.${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)
}

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

task('deploymentDiff', 'Diffs the source code for a deployed contract against the current source code')
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
    const tempFile = tmpFile('sol')
    let currentSource = fs.readFileSync(args.source).toString()
    let lines = currentSource.split('\n')
    lines = lines.filter(line => !line.match(/import.*hardhat.console.sol/) && !line.match(/console.log/))
    currentSource = lines.join('\n')
    const tempFileCurrentSource = tmpFile('sol')
    fs.writeFileSync(tempFileCurrentSource, currentSource)
    // console.log(lines)
    fs.writeFileSync(tempFile, solcInputs.sources[args.source].content)
    try {
      execSync(`icdiff  ${tempFile} ${tempFileCurrentSource}`, { stdio: 'inherit' })
    } finally {
      fs.unlinkSync(tempFile)
    }
  })

export const coreHardhatConfig: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.18',
      },
      {
        version: '0.8.10',
      },
    ],
  },

  networks: {
    ethereum: {
      url: 'https://rpc.ankr.com/eth',
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC,
      },
    },
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
      accounts: {
        mnemonic: 'rubber possible radar amused patient ability canoe dust debate gallery dawn ring',
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
