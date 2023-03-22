import { HardhatUserConfig } from 'hardhat/config'
import os from 'os'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(os.homedir(), '.env') })

export const coreHardhatConfig: HardhatUserConfig = {
  solidity: '0.8.18',

  networks: {
    ethereumGoerli: {
      chainId: 5,
      url: 'https://rpc.ankr.com/eth_goerli',
      accounts: {
        mnemonic: process.env.WALLET_MNEMONIC,
      },
    },
  },

  // for hardhat-deployer
  namedAccounts: {
    deployer: 0,
    otherUser: 1,
  },
}
