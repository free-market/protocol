import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import { coreHardhatConfig } from '@freemarket/core/tslib/hardhat-config'

const config: HardhatUserConfig = {
  ...coreHardhatConfig,
  solidity: '0.8.18',
  namedAccounts: {
    deployer: 0,
    otherUser: 1,
  },
}

export default config
