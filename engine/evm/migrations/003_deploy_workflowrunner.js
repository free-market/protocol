var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var EternalStorage = artifacts.require('EternalStorage')

var { promisify } = require('util')
var sleep = promisify(setTimeout)

module.exports = async (deployer) => {
  const frontDoor = await FrontDoor.deployed()
  await deployer.deploy(WorkflowRunner, frontDoor.address)
  const workflowRunner = await WorkflowRunner.deployed()
  await frontDoor.setUpstream(workflowRunner.address)
}
