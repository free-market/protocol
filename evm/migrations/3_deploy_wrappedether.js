var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var WrapEther = artifacts.require('WrapEther')
var UnwrapEther = artifacts.require('UnwrapEther')

var { getEthConfig } = require('../build/utils/contract-addresses')
var { ActionIds } = require('../build/utils/actionIds')
var { promisify } = require('util')

var sleep = promisify(setTimeout)

module.exports = async (deployer) => {
  const network = process.env['FMP_NETWORK'] || 'mainnet'
  const networkConfig = getEthConfig(network)
  const wethAddr = networkConfig.WETH
  console.log('using FMP_NETWORK=' + network + ' WETH=' + wethAddr)

  await deployer.deploy(WrapEther, wethAddr)
  await sleep(1100)
  await deployer.deploy(UnwrapEther, wethAddr)
  await sleep(1100)

  const frontDoor = await FrontDoor.deployed()
  await sleep(1100)
  const wrapEther = await WrapEther.deployed()
  await sleep(1100)
  const unwrapEther = await UnwrapEther.deployed()
  await sleep(1100)
  const workflowRunner = await WorkflowRunner.at(frontDoor.address)
  await sleep(1100)

  await workflowRunner.setActionAddress(ActionIds.wrapEther, wrapEther.address)
  await sleep(1100)
  await workflowRunner.setActionAddress(ActionIds.unwrapEther, unwrapEther.address)
  await sleep(1100)
}
