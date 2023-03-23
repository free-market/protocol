import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import 'hardhat-deploy'
import { stepHardhatConfig } from '@freemarket/step-sdk/tslib/hardhat-config'
import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
  ...stepHardhatConfig,
  networks: {
    ...stepHardhatConfig.networks,
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
