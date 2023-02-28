var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var WrapEther = artifacts.require('WrapEther')
var UnwrapEther = artifacts.require('UnwrapEther')

var { getNetworkConfig } = require('../build/tslib/contract-addresses')
var { ActionIds } = require('../build/tslib/actionIds')

var { promisify } = require('util')
var sleep = promisify(setTimeout)

module.exports = async (deployer) => {
  const networkId = await web3.eth.net.getId()
  console.log(`networkId=${networkId}`)
  const networkConfig = getNetworkConfig(networkId)
  const wethAddr = networkConfig.WETH
  if (wethAddr) {
    console.log(`deploying WrapEther and UnwrapEther on network=${networkId}  WETH=${wethAddr}`)
    await deployer.deploy(WrapEther, wethAddr)
    const frontDoor = await FrontDoor.deployed()
    const wrapEther = await WrapEther.deployed()
    const workflowRunner = await WorkflowRunner.at(frontDoor.address)
    await workflowRunner.setActionAddress(ActionIds.wrapEther, wrapEther.address)

    await deployer.deploy(UnwrapEther, wethAddr)
    const unwrapEther = await UnwrapEther.deployed()
    await workflowRunner.setActionAddress(ActionIds.unwrapEther, unwrapEther.address)
  } else {
    console.log(`WETH not available on network=${networkId}`)
  }
}
