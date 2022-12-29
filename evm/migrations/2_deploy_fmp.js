var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var EternalStorage = artifacts.require('EternalStorage')
// var UserProxyManager = artifacts.require('UserProxyManager')

module.exports = async (deployer) => {
  await deployer.deploy(FrontDoor)
  const frontDoor = await FrontDoor.deployed()

  await deployer.deploy(WorkflowRunner, frontDoor.address)
  const workflowRunner = await WorkflowRunner.deployed()
  await frontDoor.setUpstream(workflowRunner.address)

  // const storageAddr = await frontDoor.eternalStorageAddress()
  // const storage = await EternalStorage.at(storageAddr)
  // await storage.setWriter(workflowRunner.address)
}
