const FrontDoor = artifacts.require('FrontDoor')
const WorkflowRunner = artifacts.require('WorkflowRunner')
const AaveSupplyAction = artifacts.require('AaveSupplyAction')
const MockAavePool = artifacts.require('MockAavePool')
const MockToken = artifacts.require('MockToken')
const IERC20 = artifacts.require('IERC20')
const { getNetworkConfig } = require('../build/utils/contract-addresses')
const { ActionIds } = require('../build/utils/actionIds')
const assert = require('assert')
const { promisify } = require('util')
const sleep = promisify(setTimeout)
const SLEEPMS = 500
module.exports = async (deployer) => {
  const networkId = await web3.eth.net.getId()
  const networkConfig = getNetworkConfig(networkId)
  let aTokenAddr, poolAddr
  if (!networkConfig.aavePool) {
    console.log(`deploying mock Aave Pool for networkId=${networkId}`)
    const pool = await MockAavePool.new()
    await sleep(SLEEPMS)
    aTokenAddr = await pool.mockAToken()
    await sleep(SLEEPMS)
    poolAddr = pool.address
  } else {
    assert(networkConfig.aaveAToken, 'aaveAToken not present in network configuration')
    aTokenAddr = networkConfig.aaveAToken
    poolAddr = networkConfig.aaveAToken
  }
  await deployer.deploy(AaveSupplyAction, poolAddr, aTokenAddr)
  const aaveSupplyAction = await AaveSupplyAction.deployed()
  await sleep(SLEEPMS)
  const frontDoor = await FrontDoor.deployed()
  await sleep(SLEEPMS)
  const workflowRunner = await WorkflowRunner.at(frontDoor.address)
  await sleep(SLEEPMS)
  await workflowRunner.setActionAddress(ActionIds.aaveSupply, aaveSupplyAction.address)
  await sleep(SLEEPMS)
}
