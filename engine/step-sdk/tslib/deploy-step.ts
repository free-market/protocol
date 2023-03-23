import type { HardhatRuntimeEnvironment } from 'hardhat/types'
import { WorkflowRunner__factory } from '@freemarket/runner'
import fs from 'fs'
import path from 'path'

function copyRunnerDeployments(networkName: string, contractNames: string[]) {
  const runnerDeploymentsPath = `node_modules/@freemarket/runner/deployments/${networkName}`
  const localDeploymentsPath = `deployments/${networkName}`
  // fs.mkdirSync(localDeploymentsPath, { recursive: true })
  for (const contractName of contractNames) {
    const fileName = `${contractName}.json`
    fs.copyFileSync(`${runnerDeploymentsPath}/${fileName}`, `${localDeploymentsPath}/${fileName}`)
  }
}

export async function getFrontDoorAddress(hre: HardhatRuntimeEnvironment) {
  if (hre.network.live) {
    const relativePath = `node_modules/@freemarket/runner/deployments/${hre.network.name}/FrontDoor.json`
    const absolutePath = path.resolve(relativePath)
    console.log('reading FrontDoor address from ' + absolutePath)
    const frontDoorDeploymentContent = fs
      .readFileSync(`node_modules/@freemarket/runner/deployments/${hre.network.name}/FrontDoor.json`)
      .toString()
    const frontDoorDeployment = JSON.parse(frontDoorDeploymentContent)
    console.log(`using existing FrontDoor address: ${frontDoorDeployment.address}`)
    return frontDoorDeployment.address
  }
  const frontDoor = await hre.ethers.getContract('FrontDoor')
  return frontDoor.address
}

export async function deployStep(stepName: string, stepTypeId: number, hre: HardhatRuntimeEnvironment, ctorArgs?: any[]) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const frontDoorAddress = await getFrontDoorAddress(hre)
  const deployResult = await deploy(stepName, {
    from: deployer,
    log: true,
    autoMine: true,
    args: ctorArgs,
  })
  if (deployResult.newlyDeployed) {
    const signer = await ethers.getSigner(deployer)
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, signer)
    const result = await runner.setStepAddress(stepTypeId, deployResult.address)
    await result.wait()
  }

  // if (hre.network.live) {
  //   copyRunnerDeployments(hre.network.name, ['FrontDoor', 'WorkflowRunner'])
  // }
}
