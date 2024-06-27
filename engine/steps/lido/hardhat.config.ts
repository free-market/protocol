import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import 'hardhat-deploy'
import { stepHardhatConfig } from '@freemarket/step-sdk/tslib/hardhat-config'
import type { HardhatUserConfig } from 'hardhat/config'

// export default stepHardhatConfig

const config: HardhatUserConfig = {
  ...stepHardhatConfig,
  typechain: {
    externalArtifacts: [
      // 'node_modules/@uniswap/v3-core/artifacts/contracts/interfaces/**/*.json',
      // 'node_modules/@uniswap/v3-periphery/artifacts/contracts/interfaces/**/*.json',
      'external-artifacts/**/*.json',
    ],
  },
  solidity: {
    compilers: [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      {
        version: '0.8.13',
      },
      {
        version: '0.7.6',
        settings: {},
      },
    ],
  },
}

export default config
