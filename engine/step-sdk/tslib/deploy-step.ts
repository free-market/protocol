/* eslint-disable no-console */
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { FrontDoor, WorkflowRunner__factory } from '@freemarket/runner'
export async function deployStep(stepName: string, stepTypeId: number, hre: HardhatRuntimeEnvironment, ctorArgs?: any[]) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const deployResult = await deploy(stepName, {
    from: deployer,
    log: true,
    autoMine: true,
    args: ctorArgs,
  })
  const frontDoor = await ethers.getContract('FrontDoor')
  const runner = WorkflowRunner__factory.connect(frontDoor.address, await ethers.getSigner(deployer))
  const result = await runner.setStepAddress(stepTypeId, deployResult.address)
  await result.wait()
}
