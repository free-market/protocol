import { HardhatUserConfig } from 'hardhat/config'
import { coreHardhatConfig } from '@freemarket/core/tslib/hardhat-config'

export const stepHardhatConfig: HardhatUserConfig = {
  ...coreHardhatConfig,
  external: {
    contracts: [
      {
        artifacts: 'node_modules/@freemarket/runner/artifacts',
        deploy: 'node_modules/@freemarket/runner/deploy',
      },
    ],
  },
}
