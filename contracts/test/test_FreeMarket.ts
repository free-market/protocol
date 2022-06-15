import { ethers, Wallet, BigNumber } from 'ethers'

import { getDeployedContractAddress, getMainNetContracts, getTestWallet } from '../utils/ganachUtils'
import { IUserProxyManager__factory, IWorkflowRunner__factory, IERC20__factory } from '../types/ethers-contracts'

// import { getMainnetSdk } from '../generated'
// import { getTestWallet, transferEthToUsdc } from '../utils/ganachUtils'

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
const TEST_WALLET_INDEX = 1

contract('FreeMarket', function (accounts: string[]) {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
  const userWallet = getTestWallet(TEST_WALLET_INDEX, provider)
  const frontDoorAddress = getDeployedContractAddress('FrontDoor')
  const userProxyManager = IUserProxyManager__factory.connect(frontDoorAddress, userWallet)

  it('creates a user proxy', async () => {
    let userProxyAddr = await userProxyManager.getUserProxy()
    if (userProxyAddr === ADDRESS_ZERO) {
      await userProxyManager.createUserProxy()
      userProxyAddr = await userProxyManager.getUserProxy()
    }
    assert.notDeepEqual(userProxyAddr, ADDRESS_ZERO)
  })

  it('executes workflows', async () => {
    const userProxyAddress = await getUserProxyAddress(frontDoorAddress, userWallet)
    // ensure that the user proxy has at least 1 eth
    await ensureEthBalance('1.0', userWallet, userProxyAddress)
    // get balances before
    const { weth, usdt } = getMainNetContracts(userWallet)
    const wethBefore = await weth.balanceOf(userProxyAddress)
    const usdtBefore = await usdt.balanceOf(userProxyAddress)
    console.log(`weth before: ${wethBefore}`)
    console.log(`usdt before: ${usdtBefore}`)

    const userWorkflowRunner = IWorkflowRunner__factory.connect(userProxyAddress, userWallet)
    let tx = await userWorkflowRunner.executeWorkflow(
      [
        // '10000000000000000', // starting amount (of whatever input currency to first step is)
        ethers.utils.parseEther('0.01'),
        0, // stepId: ethToWeth
        1, // stepId: curve triCrypto
        2, //   from index:  WETH
        0, //   to index:  USDT
        2, // stepId: curve 3pool
        2, //   from index:  USDT
        1, //   to index: USDC
      ],
      { gasLimit: 20_000_000 }
    )
    let txReceipt = await provider.getTransactionReceipt(tx.hash)
    console.log('executeWorkflow completed, gas: ' + txReceipt.gasUsed.toString())

    const wethAfter = await weth.balanceOf(userProxyAddress)
    const usdtAfter = await usdt.balanceOf(userProxyAddress)
    console.log(`weth after: ${wethAfter}`)
    console.log(`usdt after: ${usdtAfter}`)
    const wethDelta = wethAfter.sub(wethBefore)
    const usdtDelta = usdtAfter.sub(usdtBefore)
    console.log(`weth delta: ${wethDelta}`)
    console.log(`usdt delta: ${usdtDelta}`)
    assert.equal(wethDelta.toString(), '0')
    assert.isAbove(usdtDelta.toNumber(), 0)
  })

  async function getUserProxyAddress(frontDoorAddress: string, userWallet: Wallet) {
    // obtain the user's proxy address via UserProxyManager
    const userProxyManager = IUserProxyManager__factory.connect(frontDoorAddress, userWallet)
    let userProxyAddress = await userProxyManager.getUserProxy()
    if (userProxyAddress === ADDRESS_ZERO) {
      console.log('creating user proxy')
      const txResult = await userProxyManager.createUserProxy()
      const txReceipt = await userWallet.provider.getTransactionReceipt(txResult.hash)
      console.log('user proxy created, gas: ' + txReceipt.gasUsed.toString())
      userProxyAddress = await userProxyManager.getUserProxy()
    }
    console.log('user proxy address', userProxyAddress)
    return userProxyAddress
  }

  async function ensureEthBalance(eth: string, fromWallet: Wallet, toAddress: string) {
    const userProxyBalanceEth = await fromWallet.provider.getBalance(toAddress)
    const targetBalance = ethers.utils.parseEther('1.0')
    const weiToSend = targetBalance.sub(userProxyBalanceEth)
    if (!weiToSend.isNegative() && !weiToSend.isZero()) {
      console.log(`sending ${ethers.utils.formatEther(weiToSend)} ETH to user's proxy`)
      await fromWallet.sendTransaction({
        to: toAddress,
        value: weiToSend,
      })
      const userProxyBalanceEthAfter = await fromWallet.provider.getBalance(toAddress)
      console.log(`ETH sent to user proxy, current balance: ${ethers.utils.formatEther(userProxyBalanceEthAfter)}`)
    }
  }

  // it('manages supported ERC20 tokens', async () => {
  //   const fmp = await FreeMarket.deployed()
  //   removeAllSupportedTokens(fmp)
  //   assert.deepEqual(await fmp.getSupportedERC20Tokens(), [])
  //   await Promise.all([fmp.addSupportedERC20Token(DAI_ADDRESS), fmp.addSupportedERC20Token(USDC_ADDRESS)])
  //   let supportedTokens = [...(await fmp.getSupportedERC20Tokens())].sort()
  //   assert.deepEqual(supportedTokens, [DAI_ADDRESS, USDC_ADDRESS])
  //   await fmp.removeSupportedERC20Token(DAI_ADDRESS)
  //   supportedTokens = await fmp.getSupportedERC20Tokens()
  //   assert.deepEqual(supportedTokens, [USDC_ADDRESS])
  // })

  // it.only('executes a deposit', async () => {
  //   // at this point (because of above tests) the bus stop is account 9 and USDC is supported for depsit

  //   const fmpOwner = await FreeMarket.deployed()
  //   console.log('setting bus stop')
  //   await fmpOwner.setBusStop(accounts[9])
  //   console.log('setting usdc as only accepted token')
  //   removeAllSupportedTokens(fmpOwner)
  //   await fmpOwner.addSupportedERC20Token(USDC_ADDRESS)

  //   let st = await fmpOwner.getSupportedERC20Tokens()
  //   console.log(st)

  //   const provider = new ethers.providers.JsonRpcProvider()
  //   await provider.ready
  //   const wallet1 = getTestWallet(1, provider)
  //   const wallet9 = getTestWallet(9, provider)
  //   const usdcUser1 = getMainNetContracts(wallet1).usdc
  //   const wallet1Fmp = getFreeMarketContract(wallet1, fmpOwner.address)
  //   // // 1/10th of an eth
  //   const weiAmount = BigNumber.from(10).pow(17)
  //   console.log('transferEthToUsdc')
  //   await transferEthToUsdc(wallet1, weiAmount, false)
  //   const wallet1UsdcBalanceBefore = await usdcUser1.balanceOf(accounts[1])
  //   const decimals = await usdcUser1.decimals()
  //   console.log('user balance before', wallet1UsdcBalanceBefore.toString() + ` ($${formatBigNumber(wallet1UsdcBalanceBefore, decimals)})`)
  //   assert.isFalse(wallet1UsdcBalanceBefore.isZero())
  //   const wallet9UsddBalanceBefore = await usdcUser1.balanceOf(accounts[9])
  //   console.log(
  //     'bus stop balance before',
  //     wallet9UsddBalanceBefore.toString() + ` ($${formatBigNumber(wallet9UsddBalanceBefore, decimals)})`
  //   )
  //   await usdcUser1.approve(fmpOwner.address, wallet1UsdcBalanceBefore)
  //   // await usdcUser1.approve(accounts[9], wallet1UsdcBalanceBefore)

  //   const bs = await fmpOwner.busStop()
  //   console.log('bs: ' + bs)

  //   console.log('owner fmp addr ' + fmpOwner.address)
  //   console.log('user fmp addr ' + wallet1Fmp.address)

  //   await wallet1Fmp.deposit(USDC_ADDRESS, wallet1UsdcBalanceBefore, { gasLimit: 2_000_000 })

  //   const wallet1UsdcBalanceAfter = await usdcUser1.balanceOf(accounts[1])
  //   console.log('user balance after', wallet1UsdcBalanceAfter.toString() + ` ($${formatBigNumber(wallet1UsdcBalanceAfter, decimals)})`)
  //   const wallet9UsddBalanceAfter = await usdcUser1.balanceOf(accounts[9])
  //   console.log('bs   balance after', wallet9UsddBalanceAfter.toString() + ` ($${formatBigNumber(wallet9UsddBalanceAfter, decimals)})`)
  //   assert.isTrue(wallet1UsdcBalanceAfter.isZero())
  //   const diff = wallet9UsddBalanceAfter.sub(wallet9UsddBalanceBefore)
  //   console.log('diff', diff.toString() + ` ($${formatBigNumber(diff, decimals)})`)
  //   st = await fmpOwner.getSupportedERC20Tokens()
  //   console.log(st)

  //   assert.deepEqual(wallet1UsdcBalanceBefore.toString(), diff.toString())
  // })
})

async function getUserProxyAddress(frontDoorAddress: string, userWallet: Wallet) {
  // obtain the user's proxy address via UserProxyManager
  const userProxyManager = IUserProxyManager__factory.connect(frontDoorAddress, userWallet)
  let userProxyAddress = await userProxyManager.getUserProxy()
  if (userProxyAddress === ADDRESS_ZERO) {
    console.log('creating user proxy')
    const txResult = await userProxyManager.createUserProxy()
    const txReceipt = await userWallet.provider.getTransactionReceipt(txResult.hash)
    console.log('user proxy created, gas: ' + txReceipt.gasUsed.toString())
    userProxyAddress = await userProxyManager.getUserProxy()
  }
  console.log('user proxy address', userProxyAddress)
  return userProxyAddress
}

async function ensureEthBalance(eth: string, fromWallet: Wallet, toAddress: string) {
  const userProxyBalanceEth = await fromWallet.provider.getBalance(toAddress)
  const targetBalance = ethers.utils.parseEther('1.0')
  const weiToSend = targetBalance.sub(userProxyBalanceEth)
  if (!weiToSend.isNegative() && !weiToSend.isZero()) {
    console.log(`sending ${ethers.utils.formatEther(weiToSend)} ETH to user's proxy`)
    await fromWallet.sendTransaction({
      to: toAddress,
      value: weiToSend,
    })
    const userProxyBalanceEthAfter = await fromWallet.provider.getBalance(toAddress)
    console.log(`ETH sent to user proxy, current balance: ${ethers.utils.formatEther(userProxyBalanceEthAfter)}`)
  }
}
