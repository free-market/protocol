import { FreeMarketContract, FreeMarketInstance } from "../types/truffle-contracts"

const FreeMarket = artifacts.require('FreeMarket')
const IERC20 = artifacts.require('IERC20')

const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const USTC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

contract('FreeMarket', function (accounts) {

  const removeAllSupportedTokens = async (fmp: FreeMarketInstance) => {
    const supportedTokens = await fmp.getSupportedERC20Tokens()
    await Promise.all(supportedTokens.map(it => fmp.removeSupportedERC20Token(it)))
  }

  it('updates the bus stop', async () => {
    const fmp = await FreeMarket.deployed()
    await fmp.setBusStop(accounts[8])
    assert.equal(await fmp.busStop(), accounts[8])
    await fmp.setBusStop(accounts[9])
    assert.equal(await fmp.busStop(), accounts[9])
  })

  it('manages supported ERC20 tokens', async () => {
    const fmp = await FreeMarket.deployed()
    removeAllSupportedTokens(fmp)
    assert.deepEqual(await fmp.getSupportedERC20Tokens(), [])
    await Promise.all([fmp.addSupportedERC20Token(DAI_ADDRESS), fmp.addSupportedERC20Token(USTC_ADDRESS)])
    let supportedTokens = [...(await fmp.getSupportedERC20Tokens())].sort()
    assert.deepEqual(supportedTokens, [DAI_ADDRESS, USTC_ADDRESS])
    await fmp.removeSupportedERC20Token(DAI_ADDRESS)
    supportedTokens = await fmp.getSupportedERC20Tokens()
    assert.deepEqual(supportedTokens, [USTC_ADDRESS])
  })

  it('executes a deposit', async () => {
    const startBalance = await web3.eth.getBalance(accounts[1])
    const ustcToken = await IERC20.at(USTC_ADDRESS)
    const fmp = await FreeMarket.deployed()
    removeAllSupportedTokens(fmp)
    assert.deepEqual(await fmp.getSupportedERC20Tokens(), [])
    await Promise.all([fmp.addSupportedERC20Token(DAI_ADDRESS), fmp.addSupportedERC20Token(USTC_ADDRESS)])
    let supportedTokens = [...(await fmp.getSupportedERC20Tokens())].sort()
    assert.deepEqual(supportedTokens, [DAI_ADDRESS, USTC_ADDRESS])
    await fmp.removeSupportedERC20Token(DAI_ADDRESS)
    supportedTokens = await fmp.getSupportedERC20Tokens()
    assert.deepEqual(supportedTokens, [USTC_ADDRESS])
  })

})
