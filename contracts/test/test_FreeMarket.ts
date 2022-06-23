import { ethers, Wallet, BigNumber } from 'ethers'

import { getDeployedContractAddress, getTestWallet } from '../utils/ganachUtils'
import { IUserProxyManager__factory, IWorkflowRunner__factory, IERC20__factory } from '../types/ethers-contracts'
import { WorkflowStepStruct } from '../types/ethers-contracts/IWorkflowRunner'
import { ADDRESS_ZERO, ensureEthBalance, getMainNetContracts, getUserProxyAddress } from '../utils/ethers-utils'

// import { getMainnetSdk } from '../generated'
// import { getTestWallet, transferEthToUsdc } from '../utils/ganachUtils'

const TEST_WALLET_INDEX = 1

const STEPID = {
  ETH_WETH: 0,
  CURVE_TRICRYPTO_SWAP: 1,
  CURVE_3POOL_SWAP: 2,
  WORMHOLE: 3,
  WITHDRAWAL: 4,
  CURVE_3POOL_FUND: 5,
}

contract('FreeMarket', function (accounts: string[]) {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
  const userWallet = getTestWallet(TEST_WALLET_INDEX, provider)
  const frontDoorAddress = getDeployedContractAddress('FrontDoor')
  const userProxyManager = IUserProxyManager__factory.connect(frontDoorAddress, userWallet)

  it('creates a user proxy', async () => {
    let userProxyAddr = await userProxyManager.getUserProxy()
    if (userProxyAddr === ADDRESS_ZERO) {
      console.log('creating user proxy')
      await userProxyManager.createUserProxy()
      userProxyAddr = await userProxyManager.getUserProxy()
    }
    assert.notDeepEqual(userProxyAddr, ADDRESS_ZERO)
    console.log('user proxy: ' + userProxyAddr)
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
    const steps: WorkflowStepStruct[] = [
      {
        stepId: STEPID.ETH_WETH,
        fromToken: '0',
        amount: ethers.utils.parseEther('0.01'),
        amountIsPercent: false,
        args: [],
      },
      {
        stepId: STEPID.CURVE_TRICRYPTO_SWAP,
        fromToken: weth.address,
        amount: 100,
        amountIsPercent: true,
        args: ['2', '0'], // from weth to usdt
      },
      {
        stepId: STEPID.CURVE_3POOL_SWAP,
        fromToken: usdt.address,
        amount: 100,
        amountIsPercent: true,
        args: ['2', '1'], // from usdt to usdc
      },
    ]

    let tx = await userWorkflowRunner.executeWorkflow(steps, { gasLimit: 30_000_000 })
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
        {
          stepId: STEPID.WITHDRAWAL,
          amount: usdcAfter,
          amountIsPercent: false,
          fromToken: usdc.address,
          args: [],
        },
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
    const { weth, usdt, curve3PoolLp } = getMainNetContracts(userWallet)
    const lpBalanceBefore = await curve3PoolLp.balanceOf(userProxyAddress)
    console.log(`lpBalanceBefore: ${lpBalanceBefore}`)
    await ensureEthBalance('1.0', userWallet, userProxyAddress)
    const userWorkflowRunner = IWorkflowRunner__factory.connect(userProxyAddress, userWallet)
    const tx = await userWorkflowRunner.executeWorkflow(
      [
        {
          stepId: STEPID.ETH_WETH,
          amount: ethers.utils.parseEther('0.01'),
          amountIsPercent: false,
          fromToken: '0',
          args: [],
        },
        {
          stepId: STEPID.CURVE_TRICRYPTO_SWAP,
          amount: 100,
          amountIsPercent: true,
          fromToken: weth.address,
          args: [
            2, // from index: WETH
            0, // to index: USDT
          ],
        },
        {
          stepId: STEPID.CURVE_3POOL_FUND,
          amount: 100,
          amountIsPercent: true,
          fromToken: usdt.address,
          args: [
            2, // 3pool index for USDT
          ],
        },
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
})
