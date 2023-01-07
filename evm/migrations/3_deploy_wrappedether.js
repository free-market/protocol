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
  const frontDoor = await FrontDoor.deployed()
  const wrapEther = await WrapEther.deployed()
  const workflowRunner = await WorkflowRunner.at(frontDoor.address)
  await workflowRunner.setActionAddress(ActionIds.wrapEther, wrapEther.address)

  await deployer.deploy(UnwrapEther, wethAddr)
  const unwrapEther = await UnwrapEther.deployed()
  await workflowRunner.setActionAddress(ActionIds.unwrapEther, unwrapEther.address)
}
