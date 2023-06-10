/* eslint-disable no-console */
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ConfigManager, FrontDoor, WorkflowRunner__factory } from '../typechain-types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const frontDoor = <FrontDoor>await ethers.getContract('FrontDoor')
  const deployResult = await deploy('WorkflowRunner', {
    from: deployer,
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    args: [frontDoor.address],
  })
  // console.log(`calling frontDoor<${frontDoor.address}>.setUpstream(${deployResult.address})`)

  if (deployResult.newlyDeployed) {
    console.log('configuring frontDoor and runner whitelist for:', deployResult.address)
    await (await frontDoor.setUpstream(deployResult.address)).wait()
    const configManager = <ConfigManager>await ethers.getContract('ConfigManager')
    await (await configManager.addRunnerAddress(deployResult.address)).wait()
  }

  //console.log(`done calling frontDoor<${frontDoor.address}>.setUpstream(${deployResult.address})`)
}
export default func
func.tags = ['WorkflowRunner']
func.dependencies = ['FrontDoor', 'ConfigManager']
