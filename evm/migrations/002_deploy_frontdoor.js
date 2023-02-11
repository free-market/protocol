var FrontDoor = artifacts.require('FrontDoor')
var WorkflowRunner = artifacts.require('WorkflowRunner')
var EternalStorage = artifacts.require('EternalStorage')

var { promisify } = require('util')
var sleep = promisify(setTimeout)

module.exports = async (deployer) => {
  try {
    const frontDoor = await FrontDoor.deployed()
    console.log(`FrondDoor already deployed at: ${frontDoor.address}`)
    if (process.env['OVERWRITE_FRONTDOOR'] !== 'true') {
      return
    }
    console.log('overwriting FrontDoor because OVERWRITE_FRONTDOOR==true')
  } catch (e) {
    console.log('no FrontDoor deployed according to truffle metadata')
  }
  await deployer.deploy(FrontDoor)
}
