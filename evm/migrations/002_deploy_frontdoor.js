var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var EternalStorage = artifacts.require('EternalStorage')

var { promisify } = require('util')
var sleep = promisify(setTimeout)

module.exports = async (deployer) => {
  await deployer.deploy(FrontDoor)
}
