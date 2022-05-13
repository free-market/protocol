const ConvertLib = artifacts.require('ConvertLib')
var Ftml = artifacts.require('Ftml')
var FreeMarket = artifacts.require('FreeMarket')

module.exports = function (deployer) {
  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib, Ftml)
  deployer.deploy(Ftml)
  deployer.deploy(FreeMarket)
}
