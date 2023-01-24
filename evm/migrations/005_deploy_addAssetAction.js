var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var AddAssetAction = artifacts.require('AddAssetAction')

var { getNetworkConfig } = require('../build/utils/contract-addresses')
var { ActionIds } = require('../build/utils/actionIds')

var { promisify } = require('util')
var sleep = promisify(setTimeout)

module.exports = async (deployer) => {
  await deployer.deploy(AddAssetAction)
  const addAssetAction = await AddAssetAction.deployed()
  const frontDoor = await FrontDoor.deployed()
  const workflowRunner = await WorkflowRunner.at(frontDoor.address)
  await workflowRunner.setActionAddress(ActionIds.addAsset, addAssetAction.address)
}
