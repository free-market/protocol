var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')

module.exports = async (deployer) => {
  await deployer.deploy(FrontDoor)
  const frontDoor = await FrontDoor.deployed()
  await deployer.deploy(WorkflowRunner)
  const logic = await WorkflowRunner.deployed()
  await frontDoor.setUpstream(logic.address)
}
