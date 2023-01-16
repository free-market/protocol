var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var StargateBridgeAction = artifacts.require('StargateBridgeAction')

var { getNetworkConfig } = require('../build/utils/contract-addresses')
var { ActionIds } = require('../build/utils/actionIds')

module.exports = async (deployer) => {
  const networkId = await web3.eth.net.getId()
  const networkConfig = getNetworkConfig(networkId)
  const stargateAddr = networkConfig.stargateRouter
  if (stargateAddr) {
    console.log(`deploying StargateBridgeAction on network=${networkId}  stargateRouter=${stargateAddr}`)
    await deployer.deploy(StargateBridgeAction, stargateAddr)
    const frontDoor = await FrontDoor.deployed()
    const stargateBridge = await StargateBridgeAction.deployed()
    const workflowRunner = await WorkflowRunner.at(frontDoor.address)
    await workflowRunner.setActionAddress(ActionIds.stargateBridge, stargateBridge.address)
  } else {
    console.log(`WETH not available on network=${networkId}`)
  }
}
