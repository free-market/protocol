const FrontDoor = artifacts.require('FrontDoor')
const WorkflowRunner = artifacts.require('WorkflowRunner')
const AaveSupplyAction = artifacts.require('AaveSupplyAction')
const MockAavePool = artifacts.require('MockAavePool')
const { getNetworkConfig } = require('../build/tslib/contract-addresses')
const { StepIds } = require('../build/tslib/StepIds')
const { promisify } = require('util')
const sleep = promisify(setTimeout)
const SLEEPMS = 500
module.exports = async (deployer) => {
  const networkId = await web3.eth.net.getId()
  const networkConfig = getNetworkConfig(networkId)
  let poolAddr
  const chainId = await web3.eth.getChainId()
  // if chainId is 1337 assume it's ganache
  if (!networkConfig.aavePool || chainId === 1337) {
    console.log(`deploying mock Aave Pool for networkId=${networkId} chainId=${chainId}`)
    const pool = await MockAavePool.new()
    await sleep(SLEEPMS)
    poolAddr = pool.address
  } else {
    poolAddr = networkConfig.aavePool
  }
  await deployer.deploy(AaveSupplyAction, poolAddr)
  const aaveSupplyAction = await AaveSupplyAction.deployed()
  await sleep(SLEEPMS)
  const frontDoor = await FrontDoor.deployed()
  await sleep(SLEEPMS)
  const workflowRunner = await WorkflowRunner.at(frontDoor.address)
  await sleep(SLEEPMS)
  await workflowRunner.setActionAddress(StepIds.aaveSupply, aaveSupplyAction.address)
  await sleep(SLEEPMS)
}
