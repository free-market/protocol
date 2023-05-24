import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import { coreHardhatConfig } from '@freemarket/core/tslib/hardhat-config'
import { task } from 'hardhat/config'
import { ConfigManager } from './typechain-types'

task('removeRunner', "Remove a runner from the config manager's whitelist")
  .addParam('address', 'The address of the runner')
  .setAction(async (args, hre) => {
    console.log('removing runner: ' + args.address)
    const { ethers } = hre
    const configManager = <ConfigManager>await ethers.getContract('ConfigManager')
    await (await configManager.removeRunnerAddress(args.address)).wait()
  })

task('removeStep', "Remove a step from the config manager's whitelist")
  .addParam('steptypeid', 'The stepTypeId of the step')
  .addParam('address', 'The address of the step')
  .setAction(async (args, hre) => {
    console.log(`removing step: id=${args.steptypeid} addr=${args.address}`)
    const { ethers } = hre
    const configManager = <ConfigManager>await ethers.getContract('ConfigManager')
    await (await configManager.removeStepAddress(args.steptypeid, args.address)).wait()
  })

export default coreHardhatConfig
