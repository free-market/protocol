var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var StargateBridgeAction = artifacts.require('StargateBridgeAction')

var { getNetworkConfig } = require('../build/tslib/contract-addresses')
var { ActionIds } = require('../build/tslib/actionIds')

module.exports = async (deployer) => {
  const networkId = await web3.eth.net.getId()
  const networkConfig = getNetworkConfig(networkId)

  if (networkConfig.stargateRouter) {
    console.log(`deploying StargateBridgeAction on network=${networkId}  stargateRouter=${networkConfig.stargateRouter}`)
    const frontDoor = await FrontDoor.deployed()
    await deployer.deploy(StargateBridgeAction, frontDoor.address, networkConfig.stargateRouter)
    const stargateBridge = await StargateBridgeAction.deployed()
    const workflowRunner = await WorkflowRunner.at(frontDoor.address)
    await workflowRunner.setActionAddress(ActionIds.stargateBridge, stargateBridge.address)
  } else {
    console.log(`Stargate not available on network=${networkId}`)
  }
}
