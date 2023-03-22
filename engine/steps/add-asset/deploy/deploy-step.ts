/* eslint-disable no-console */
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { FrontDoor, WorkflowRunner__factory } from '@freemarket/runner'
import { STEP_TYPE_ID } from '../tslib/helper'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const deployResult = await deploy('AddAssetAction', {
    from: deployer,
    log: true,
    autoMine: true,
  })
  const frontDoor = <FrontDoor>await ethers.getContract('FrontDoor')
  const runner = WorkflowRunner__factory.connect(frontDoor.address, await ethers.getSigner(deployer))
  const result = await runner.setStepAddress(STEP_TYPE_ID, deployResult.address)
  await result.wait()
}
export default func
func.tags = ['AddAssetAction']
func.dependencies = ['FrontDoor', 'WorkflowRunner']
