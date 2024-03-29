import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import { coreHardhatConfig } from '@freemarket/core/tslib/hardhat-config'
import { task } from 'hardhat/config'
import { ConfigManager, EternalStorage__factory } from './typechain-types'
import fs from 'fs'

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

task('setStepAddress', 'Overwrite the current step address for a given step type id')
  .addParam('steptypeid', 'The stepTypeId of the step')
  .addParam('address', 'The address of the step')
  .setAction(async (args, hre) => {
    console.log(`setting step: id=${args.steptypeid} addr=${args.address}`)
    const { ethers } = hre
    const configManager = await ethers.getContract('ConfigManager')
    await (await configManager.setStepAddress(args.steptypeid, args.address)).wait()
    console.log('done')
  })
task('listSteps', 'List current step addresses').setAction(async (args, hre) => {
  const { ethers } = hre
  const configManager = <ConfigManager>await ethers.getContract('ConfigManager')
  const stepCount = (await configManager.getStepCount()).toNumber()
  for (let i = 0; i < stepCount; ++i) {
    const stepInfo = await configManager.getStepInfoAt(i)
    console.log(`step ${i}: id=${stepInfo.stepTypeId} addr=${stepInfo.latest}`)
  }
})

export default coreHardhatConfig
