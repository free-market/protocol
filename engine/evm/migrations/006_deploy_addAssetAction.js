var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var AddAssetAction = artifacts.require('AddAssetAction')

var { StepIds } = require('../build/tslib/StepIds')

var { promisify } = require('util')
var sleep = promisify(setTimeout)

const SLEEPMS = 500

module.exports = async (deployer) => {
  await deployer.deploy(AddAssetAction)
  await sleep(SLEEPMS)
  const addAssetAction = await AddAssetAction.deployed()
  await sleep(SLEEPMS)
  const frontDoor = await FrontDoor.deployed()
  await sleep(SLEEPMS)
  const workflowRunner = await WorkflowRunner.at(frontDoor.address)
  await sleep(SLEEPMS)
  await workflowRunner.setStepAddress(StepIds.addAsset, addAssetAction.address)
  await sleep(SLEEPMS)
}
