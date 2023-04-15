import type { HardhatRuntimeEnvironment } from 'hardhat/types'
import { ConfigManager, ConfigManager__factory, EternalStorage } from '@freemarket/runner'
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

export function getFrontDoorAddress(hre: HardhatRuntimeEnvironment) {
  return getDeployedContractAddress(hre, 'FrontDoor')
}
export async function getDeployedContractAddress(hre: HardhatRuntimeEnvironment, contractName: string) {
  if (hre.network.live) {
    const relativePath = `node_modules/@freemarket/runner/deployments/${hre.network.name}/${contractName}.json`
    const absolutePath = path.resolve(relativePath)
    console.log(`reading ${contractName} address from ${absolutePath}`)
    const deploymentContent = fs
      .readFileSync(`node_modules/@freemarket/runner/deployments/${hre.network.name}/${contractName}.json`)
      .toString()
    const deployment = JSON.parse(deploymentContent)
    console.log(`using existing ${contractName} address: ${deployment.address}`)
    return deployment.address
  }
  const contract = await hre.ethers.getContract(contractName)
  return contract.address
}

export async function deployStep(stepName: string, stepTypeId: number, hre: HardhatRuntimeEnvironment, ctorArgs?: any[]) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  // const frontDoorAddress = await getFrontDoorAddress(hre)
  const deployResult = await deploy(stepName, {
    from: deployer,
    log: true,
    autoMine: true,
    args: ctorArgs,
  })
  if (deployResult.newlyDeployed) {
    const configManagerAddress = await getDeployedContractAddress(hre, 'ConfigManager')
    const configManager = <ConfigManager>await ethers.getContractAt('ConfigManager', configManagerAddress)
    const result = await configManager.setStepAddress(stepTypeId, deployResult.address)
    await result.wait()
  }

  // if (hre.network.live) {
  //   copyRunnerDeployments(hre.network.name, ['FrontDoor', 'ConfigManager'])
  // }
}
