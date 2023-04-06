import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
// import 'hardhat-deploy-ethers'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import { stepHardhatConfig } from '@freemarket/step-sdk/tslib/hardhat-config'

const config: HardhatUserConfig = {
  ...stepHardhatConfig,
  networks: {
    ...stepHardhatConfig.networks,
    hardhat: {
      chainId: 5,
      forking: {
        url: 'https://rpc.ankr.com/eth_goerli',
        blockNumber: 8704100,
      },
    },
  },
}

export default config
