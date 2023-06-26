import { HardhatUserConfig, task } from 'hardhat/config'
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

task('dumpConfig', 'Dump the current hardhat config').setAction(async (args, hre) => {
  const replacer = (key: any, value: any) => (typeof value === 'bigint' ? value.toString() : value)
  console.log(JSON.stringify(hre.config, replacer, 2))
})
