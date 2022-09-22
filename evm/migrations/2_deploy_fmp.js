var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
// var UserProxyManager = artifacts.require('UserProxyManager')

module.exports = async (deployer) => {
  await deployer.deploy(FrontDoor)
  const frontDoor = await FrontDoor.deployed()

  await deployer.deploy(WorkflowRunner)
  const workflowRunner = await WorkflowRunner.deployed()
  await frontDoor.setUpstream(workflowRunner.address)
}