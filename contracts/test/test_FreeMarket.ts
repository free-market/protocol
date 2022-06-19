import { ethers, Wallet, BigNumber } from 'ethers'

import { getDeployedContractAddress, getMainNetContracts, getTestWallet } from '../utils/ganachUtils'
import { IUserProxyManager__factory, IWorkflowRunner__factory, IERC20__factory } from '../types/ethers-contracts'

// import { getMainnetSdk } from '../generated'
// import { getTestWallet, transferEthToUsdc } from '../utils/ganachUtils'

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
const TEST_WALLET_INDEX = 0

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
    const { weth, usdt, usdc } = getMainNetContracts(userWallet)
    const wethBefore = await weth.balanceOf(userProxyAddress)
    const usdtBefore = await usdt.balanceOf(userProxyAddress)
    const usdcBefore = await usdc.balanceOf(userProxyAddress)
    console.log(`weth before: ${wethBefore}`)
    console.log(`usdt before: ${usdtBefore}`)
    console.log(`usdc before: ${usdcBefore}`)

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
      { gasLimit: 30_000_000 }
    )
    let txReceipt = await provider.getTransactionReceipt(tx.hash)
    assert.equal(txReceipt.status, 1, 'execute workflow tx status successful')
    console.log('executeWorkflow completed, gas: ' + txReceipt.gasUsed.toString())
    // console.log(txReceipt)

    const wethAfter = await weth.balanceOf(userProxyAddress)
    const usdtAfter = await usdt.balanceOf(userProxyAddress)
    const usdcAfter = await usdc.balanceOf(userProxyAddress)
    console.log(`weth after: ${wethAfter}`)
    console.log(`usdt after: ${usdtAfter}`)
    console.log(`usdc after: ${usdcAfter}`)

    const wethDelta = wethAfter.sub(wethBefore)
    const usdtDelta = usdtAfter.sub(usdtBefore)
    const usdcDelta = usdcAfter.sub(usdcBefore)
    console.log(`weth delta: ${wethDelta}`)
    console.log(`usdt delta: ${usdtDelta}`)
    console.log(`usdc delta: ${usdcDelta}`)

    // should be no change in intermediate tokens, but some increase in the last token
    assert.equal(wethDelta.toString(), '0')
    assert.equal(usdtDelta.toString(), '0')
    assert.isAbove(usdcDelta.toNumber(), 0)

    console.log('withdrawaling all usdc')
    // withdrawal all usdc
    const userUsdcBeforeWithdrawal = await usdc.balanceOf(userWallet.address)
    tx = await userWorkflowRunner.executeWorkflow(
      [
        usdcAfter, // workflow starting amount
        4, // stepId: withdraw
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC address
      ],
      { gasLimit: 30_000_000 }
    )
    txReceipt = await provider.getTransactionReceipt(tx.hash)
    assert.equal(txReceipt.status, 1, 'execute workflow (withdrawal) tx status successful')
    console.log('executeWorkflow (withdrawal) completed, gas: ' + txReceipt.gasUsed.toString())

    const userUsdcAfterWithdrawal = await usdc.balanceOf(userWallet.address)
    const userUsdcWithdrawalDelta = userUsdcAfterWithdrawal.sub(userUsdcBeforeWithdrawal)
    assert.equal(userUsdcWithdrawalDelta.toString(), usdcAfter.toString(), 'transfers the correct amount from proxy to user')
    const proxyUsdcAfterWithdrawal = await usdc.balanceOf(userProxyAddress)
    assert.equal(proxyUsdcAfterWithdrawal.toString(), '0', '0 left in proxy')
    console.log(`user USDC balance after withdrawal: ${userUsdcWithdrawalDelta}`)
  })

  it('adds liquidity to 3pool', async () => {
    const userProxyAddress = await getUserProxyAddress(frontDoorAddress, userWallet)
    const { curve3PoolLp } = getMainNetContracts(userWallet)
    const lpBalanceBefore = await curve3PoolLp.balanceOf(userProxyAddress)
    console.log(`lpBalanceBefore: ${lpBalanceBefore}`)

    await ensureEthBalance('1.0', userWallet, userProxyAddress)
    const userWorkflowRunner = IWorkflowRunner__factory.connect(userProxyAddress, userWallet)
    const tx = await userWorkflowRunner.executeWorkflow(
      [
        ethers.utils.parseEther('0.01'), // starting amount of whatever input currency to first step is, wei in this case
        0, // stepId: ethToWeth
        1, // stepId: curve triCrypto
        2, //   from index:  WETH
        0, //   to index:  USDT
        5, // stepId: curve 3pool add_liquidity
        2, //   3pool index for USDT
      ],
      { gasLimit: 30_000_000 }
    )
    const txReceipt = await provider.getTransactionReceipt(tx.hash)
    assert.equal(txReceipt.status, 1, 'execute workflow (withdrawal) tx status successful')
    console.log('executeWorkflow (withdrawal) completed, gas: ' + txReceipt.gasUsed.toString())
    const lpBalanceAfter = await curve3PoolLp.balanceOf(userProxyAddress)
    console.log(`lpBalanceAfter: ${lpBalanceAfter}`)
    const lpDelta = lpBalanceAfter.sub(lpBalanceBefore)
    console.log(`lpDelta: ${lpDelta}`)
    assert(lpDelta.gt(0))
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
