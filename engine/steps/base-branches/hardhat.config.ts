import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
// import 'hardhat-deploy-ethers'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import type { HardhatUserConfig } from 'hardhat/config'
import { stepHardhatConfig } from '@freemarket/step-sdk/tslib/hardhat-config'

const config: HardhatUserConfig = {
  ...stepHardhatConfig,
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: 'https://rpc.ankr.com/eth',
        blockNumber: 16889307,
      },
    },
  },
}
export default config
