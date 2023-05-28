/* eslint-disable no-console */
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { EternalStorage__factory, FrontDoor, WorkflowRunner__factory } from '../typechain-types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  const frontDoor = <FrontDoor>await ethers.getContract('FrontDoor')
  const deployResult = await deploy('ConfigManager', {
    from: deployer,
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    args: [frontDoor.address],
  })
  const storageAddr = await frontDoor.eternalStorageAddress()
  const deployerSigner = await ethers.getNamedSigner('deployer')
  const storage = EternalStorage__factory.connect(storageAddr, deployerSigner)
  await (await storage.setWriter(deployResult.address)).wait()
  console.log('storage writer updated')
}
export default func
func.tags = ['ConfigManager']
func.dependencies = ['FrontDoor']
