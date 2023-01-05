var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var EternalStorage = artifacts.require('EternalStorage')
// var UserProxyManager = artifacts.require('UserProxyManager')

var { promisify } = require('util')
var sleep = promisify(setTimeout)

module.exports = async (deployer) => {
  await deployer.deploy(FrontDoor)
  await sleep(1001)
  const frontDoor = await FrontDoor.deployed()
  await sleep(1001)
  await deployer.deploy(WorkflowRunner, frontDoor.address)
  await sleep(1001)
  const workflowRunner = await WorkflowRunner.deployed()
  await sleep(1001)
  await frontDoor.setUpstream(workflowRunner.address)
  await sleep(1001)
  // const storageAddr = await frontDoor.eternalStorageAddress()
  // const storage = await EternalStorage.at(storageAddr)
  // await storage.setWriter(workflowRunner.address)
}
