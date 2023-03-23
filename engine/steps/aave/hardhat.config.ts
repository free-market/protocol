import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import 'hardhat-deploy'
import { stepHardhatConfig } from '@freemarket/step-sdk'
import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
  ...stepHardhatConfig,
  networks: {
    ...stepHardhatConfig.networks,
    hardhat: {
      chainId: 1,
      forking: {
        url: 'https://rpc.ankr.com/eth',
      },
    },
  },
  external: {
    contracts: [
      ...stepHardhatConfig.external!.contracts!,
      {
        artifacts: 'node_modules/@freemarket/curve/artifacts',
      },
    ],
  },
}

export default config
