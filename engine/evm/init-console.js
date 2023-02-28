// const { ActionIds } = require('./tslib/actionIds')
// const { AssetType } = require('./tslib/AssetType')
const truffleContract = require('@truffle/contract')

async function getEth(addr) {
  s = await web3.eth.getBalance(addr)
  return web3.utils.fromWei(s)
}

async function getContract(artifactPath, address) {
  const artifact = require(artifactPath)
  const contract = truffleContract(artifact)
  contract.setProvider(web3.currentProvider)
  return contract.at(address)
}

function getTriCrypto() {
  return getContract('./build/contracts/CurveCryptoSwap.json', '0xd51a44d3fae010294c616388b506acda1bfaae46')
  // return getContract('./build/contracts/CurveCryptoSwap.json', '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5')
}
function getThreePool() {
  return getContract('./build/contracts/CurveStableSwap.json', '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7')
}
function getWeth() {
  return getContract('./build/contracts/Weth.json', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
}
function getUsdc() {
  return getContract('./build/contracts/IERC20.json', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')
}
function getUsdt() {
  return getContract('./build/contracts/IERC20.json', '0xdAC17F958D2ee523a2206206994597C13D831ec7')
}

function getAavePool() {
  return getContract('./build/contracts/IAaveV3Pool.json', '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2')
}

function getFrontDoor() {
  const artifact = require('./build/contracts/FrontDoor.json')
  const contract = truffleContract(artifact)
  contract.setProvider(web3.currentProvider)
  return contract.deployed()
}

async function getRunner() {
  const fd = await getFrontDoor()
  const artifact = require('./build/contracts/WorkflowRunner.json')
  const contract = truffleContract(artifact)
  contract.setProvider(web3.currentProvider)
  return contract.at(fd.address)
}

// async function getRunner() {
//   const FrontDoor = artifacts.require('FrontDoor')
//   const WorkflowRunner = artifacts.require('WorkflowRunner')
//   const frontDoor = await FrontDoor.deployed()
//   const runner = await WorkflowRunner.at(frontDoor.address)
//   return runner
// }
const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// const WRAPETH = {
//   steps: [
//     {
//       actionId: ActionIds.wrapEther,
//       actionAddress: ADDRESS_ZERO,
//       inputAsset: {
//         assetType: AssetType.Native,
//         assetAddress: ADDRESS_ZERO,
//       },
//       amount: '10000000000000000',
//       amountIsPercent: false,
//       args: [],
//       nextStepIndex: 0,
//     },
//   ],
// }

console.log('copy/paste:\n')
console.log('  const weth = await getWeth()')
console.log('  const usdc = await getUsdc()')
console.log('  const usdt = await getUsdt()')
console.log('  const triCrypto = await getTriCrypto()')
console.log('  const threePool = await getThreePool()')
console.log()

module.exports = {
  getEth,
  getTriCrypto,
  getThreePool,
  getWeth,
  getUsdc,
  getUsdt,
  getAavePool,
  getFrontDoor,
  getRunner,
  // getRunner,
  ADDRESS_ZERO,
  // WRAPETH,
  WETH_ADDRESS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  USDC_ADDRESS: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT_ADDRESS: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  CURVE: {
    THREEPOOL_ADDRESS: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
    TRICRYPTO_ADDRESS: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
  },
}
