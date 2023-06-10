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

task('fixTheShit', 'wtf').setAction(async (args, hre) => {
  const { ethers } = hre
  const frontDoor = await ethers.getContract('FrontDoor')
  const storageAddr = await frontDoor.eternalStorageAddress()
  console.log('storageAddr: ' + storageAddr)
  const deployerSigner = await ethers.getNamedSigner('deployer')
  const storage = EternalStorage__factory.connect(storageAddr, deployerSigner)
  const writer = await storage.getWriter()
  console.log('writer: ' + writer)
  const currentConfigManager = await ethers.getContract('ConfigManager')
  console.log('currentConfigManager: ' + currentConfigManager.address)
  if (writer !== currentConfigManager.address) {
    console.log('updating writer')
    // await (await storage.setWriter(currentConfigManager.address)).wait()
    console.log('writer updated')
  } else {
    console.log('writer already updated')
  }
})

export default coreHardhatConfig
