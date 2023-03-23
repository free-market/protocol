import type { HardhatUserConfig } from 'hardhat/config'
import { coreHardhatConfig } from '@freemarket/core'

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
