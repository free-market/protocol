import { FreeMarketContract, FreeMarketInstance } from "../types/truffle-contracts"

// import ethSdk from '../generated'
import { ethers, BigNumber } from 'ethers'
import { getTestWallet, transferEthToUsdc, getMainNetContracts, getFreeMarketContract, formatBigNumber } from "../utils/ganachUtils"
// import { getMainnetSdk } from '../generated'
// import { getTestWallet, transferEthToUsdc } from '../utils/ganachUtils'

const FreeMarket = artifacts.require('FreeMarket')
const IERC20 = artifacts.require('IERC20')

const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const CURVE_3POOL_ADDRESS = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'
const CURVE_TRICRYPTO_ADDRESS = '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5'

contract('FreeMarket', function (accounts: string[]) {

  const removeAllSupportedTokens = async (fmp: FreeMarketInstance) => {
    const supportedTokens = await fmp.getSupportedERC20Tokens()
    await Promise.all(supportedTokens.map((it: string) => fmp.removeSupportedERC20Token(it)))
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
    await Promise.all([fmp.addSupportedERC20Token(DAI_ADDRESS), fmp.addSupportedERC20Token(USDC_ADDRESS)])
    let supportedTokens = [...(await fmp.getSupportedERC20Tokens())].sort()
    assert.deepEqual(supportedTokens, [DAI_ADDRESS, USDC_ADDRESS])
    await fmp.removeSupportedERC20Token(DAI_ADDRESS)
    supportedTokens = await fmp.getSupportedERC20Tokens()
    assert.deepEqual(supportedTokens, [USDC_ADDRESS])
  })

  it.only('executes a deposit', async () => {
    // at this point (because of above tests) the bus stop is account 9 and USDC is supported for depsit

    const fmpOwner = await FreeMarket.deployed()
    console.log('setting bus stop')
    await fmpOwner.setBusStop(accounts[9])
    console.log('setting usdc as only accepted token')
    removeAllSupportedTokens(fmpOwner)
    await fmpOwner.addSupportedERC20Token(USDC_ADDRESS)

    let st = await fmpOwner.getSupportedERC20Tokens()
    console.log(st)

    const provider = new ethers.providers.JsonRpcProvider()
    await provider.ready
    const wallet1 = getTestWallet(1, provider)
    const wallet9 = getTestWallet(9, provider)
    const usdcUser1 = getMainNetContracts(wallet1).usdc
    const wallet1Fmp = getFreeMarketContract(wallet1, fmpOwner.address)
    // // 1/10th of an eth
    const weiAmount = BigNumber.from(10).pow(17)
    console.log('transferEthToUsdc')
    await transferEthToUsdc(wallet1, weiAmount, false)
    const wallet1UsdcBalanceBefore = await usdcUser1.balanceOf(accounts[1])
    const decimals = await usdcUser1.decimals()
    console.log('user balance before', wallet1UsdcBalanceBefore.toString() + ` ($${formatBigNumber(wallet1UsdcBalanceBefore, decimals)})`)
    assert.isFalse(wallet1UsdcBalanceBefore.isZero())
    const wallet9UsddBalanceBefore = await usdcUser1.balanceOf(accounts[9])
    console.log('bus stop balance before', wallet9UsddBalanceBefore.toString() + ` ($${formatBigNumber(wallet9UsddBalanceBefore, decimals)})`)
    await usdcUser1.approve(fmpOwner.address, wallet1UsdcBalanceBefore)
    // await usdcUser1.approve(accounts[9], wallet1UsdcBalanceBefore)


    const bs = await fmpOwner.busStop()
    console.log('bs: ' + bs)

    console.log('owner fmp addr ' + fmpOwner.address)
    console.log('user fmp addr ' + wallet1Fmp.address)


    await wallet1Fmp.deposit(USDC_ADDRESS, wallet1UsdcBalanceBefore, { gasLimit: 2_000_000 })

    const wallet1UsdcBalanceAfter = await usdcUser1.balanceOf(accounts[1])
    console.log('user balance after', wallet1UsdcBalanceAfter.toString() + ` ($${formatBigNumber(wallet1UsdcBalanceAfter, decimals)})`)
    const wallet9UsddBalanceAfter = await usdcUser1.balanceOf(accounts[9])
    console.log('bs   balance after', wallet9UsddBalanceAfter.toString() + ` ($${formatBigNumber(wallet9UsddBalanceAfter, decimals)})`)
    assert.isTrue(wallet1UsdcBalanceAfter.isZero())
    const diff = wallet9UsddBalanceAfter.sub(wallet9UsddBalanceBefore)
    console.log('diff', diff.toString() + ` ($${formatBigNumber(diff, decimals)})`)
    st = await fmpOwner.getSupportedERC20Tokens()
    console.log(st)


    assert.deepEqual(wallet1UsdcBalanceBefore.toString(), diff.toString())



  })

})
function toBn(arg0: string): string | number | import("bn.js") {
  throw new Error("Function not implemented.")
}

