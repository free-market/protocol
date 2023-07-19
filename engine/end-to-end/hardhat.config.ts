import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import { coreHardhatConfig } from '@freemarket/core/tslib/hardhat-config'
import { HardhatUserConfig } from 'hardhat/types'

const config: HardhatUserConfig = {
  ...coreHardhatConfig,
  defaultNetwork: 'local',
}

export default config
