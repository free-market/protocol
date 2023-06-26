import { expect } from 'chai'
import hardhat, { ethers, deployments } from 'hardhat'
import { AaveSupplyAction, IAaveV3Pool__factory, IERC20__factory } from '../typechain-types'
import { AaveSupplyHelper, STEP_TYPE_ID_AAVE_SUPPLY } from '../tslib/supply-helper'
import { ADDRESS_ZERO, EncodingContext } from '@freemarket/core'
import { getTestFixture, MockWorkflowInstance, validateAction, getUsdt, confirmTx, getUsdc } from '@freemarket/step-sdk/tslib/testing'
import { AaveBorrow, AaveSupply } from '../tslib/model'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { AaveBorrowHelper, STEP_TYPE_ID_AAVE_BORROW } from '../tslib/borrow-helper'
import { Log } from '@ethersproject/providers'
import { Interface } from '@ethersproject/abi'
import { formatNumber } from '@freemarket/step-sdk'
import { Eip1193Bridge } from '@ethersproject/experimental'
const testAmountUsdc = 9
const testAmountUsdtFull = testAmountUsdc * 10 ** 6
const ONE_ETH = ethers.utils.parseEther('1')

const setup = getTestFixture(hardhat, async baseFixture => {
  const {
    users: { otherUser },
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('AaveSupplyAction')
  await deployments.fixture('AaveBorrowAction')

  // get a reference to the deployed contract with otherUser as the signer
  const aaveSupplyAction = <AaveSupplyAction>await ethers.getContract('AaveSupplyAction', otherUserSigner)
  const aaveBorrowAction = <AaveSupplyAction>await ethers.getContract('AaveBorrowAction', otherUserSigner)

  // get some USDC
  const { usdc, usdcAddress } = await getUsdc(hardhat, '1000000000000000000', otherUserSigner)

  // transfer to the step
  await (await usdc.transfer(aaveSupplyAction.address, testAmountUsdtFull)).wait()

  // create a mock WorkflowInstance
  const mockWorkflowInstance = new MockWorkflowInstance()
  // mockWorkflowInstance.registerErc20('USDC', usdcAddress, 6)
  mockWorkflowInstance.setProvider('ethereum', new Eip1193Bridge(otherUserSigner, otherUserSigner.provider))

  return {
    contracts: { aaveBorrowAction, aaveSupplyAction, userWorkflowRunner },
    mockWorkflowInstance,
    usdc,
    usdcAddress,
    otherUserSigner,
    hardhat,
  }
})

describe('AaveBorrow', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, aaveBorrowAction },
      mockWorkflowInstance,
      otherUserSigner,
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_AAVE_BORROW, aaveBorrowAction.address)
  })

  it('executes when invoked directly', async () => {
    const {
      users: { otherUser },
      contracts: { aaveSupplyAction, aaveBorrowAction },
      mockWorkflowInstance,
      usdc,
      otherUserSigner,
      hardhat,
    } = await setup()

    // console.log('otherUser', otherUser)

    const poolAddress = await aaveSupplyAction.poolAddress()
    console.log('poolAddress', poolAddress)
    const pool = IAaveV3Pool__factory.connect(poolAddress, otherUserSigner)

    const reserveData = await pool.getReserveData(usdc.address)
    const aTokenAddress = reserveData.aTokenAddress
    const aToken = IERC20__factory.connect(aTokenAddress, otherUserSigner)
    console.log('aaveSupplyAction.address', aaveSupplyAction.address)
    const aTokenBalanceBefore = await aToken.balanceOf(otherUser)
    console.log('aTokenBalanceBefore', aTokenBalanceBefore.toString())

    const supplyStepConfig: AaveSupply = {
      type: 'aave-supply',
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      source: 'workflow',
      amount: testAmountUsdc,
    }
    const supplyHelper = new AaveSupplyHelper(mockWorkflowInstance)

    const supplyEncodingContext: EncodingContext<AaveSupply> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: supplyStepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const supplyEncoded = await supplyHelper.encodeWorkflowStep(supplyEncodingContext)
    const supplyTx = await (await aaveSupplyAction.execute(supplyEncoded.inputAssets, supplyEncoded.argData)).wait()
    // // await expect(aaveSupplyAction.execute(encoded.inputAssets, encoded.argData)).to.changeTokenBalance(
    // //   usdt,
    // //   aaveSupplyAction.address,
    // //   testAmountUsdtFull * -1
    // // )

    const aTokenBalanceAfter = await aToken.balanceOf(otherUser)
    console.log('aTokenBalanceAfter', aTokenBalanceAfter.toString())

    const acctDataUser = await pool.getUserAccountData(otherUser)
    console.log('user available borrow', acctDataUser.availableBorrowsBase.toString())

    printEvents(supplyTx.logs, [IAaveV3Pool__factory.createInterface()])

    const borrowStepConfig: AaveBorrow = {
      type: 'aave-borrow',
      asset: {
        type: 'fungible-token',
        symbol: 'WBTC',
      },
      amount: '50%',
      interestRateMode: 'variable',
    }
    const borrowHelper = new AaveBorrowHelper(mockWorkflowInstance)
    const stdProvider = new Eip1193Bridge(otherUserSigner, otherUserSigner.provider)
    borrowHelper.setProvider(stdProvider)
    const borrowEncodingContext: EncodingContext<AaveBorrow> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: borrowStepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    // the helper uses front door as the delegatee
    // but in this test, the delegatee is the action itself
    mockWorkflowInstance.frontDoorAddress = aaveBorrowAction.address

    const borrowEncoded = await borrowHelper.encodeWorkflowStep(borrowEncodingContext)
    console.log('borrowEncoded', borrowEncoded)
    const wbtcAddr = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    const asset = IERC20__factory.connect(wbtcAddr, otherUserSigner)
    const balanceBefore = await asset.balanceOf(aaveBorrowAction.address)
    console.log('borrowed asset balance before', balanceBefore.toString())
    const borrowTx = await (await aaveBorrowAction.execute(borrowEncoded.inputAssets, borrowEncoded.argData)).wait()
    const balanceAfter = await asset.balanceOf(aaveBorrowAction.address)
    console.log('borrowed asset balance after', balanceAfter.toString())
    console.log('borrowed asset delta', balanceAfter.sub(balanceBefore).toString())
    const gasCost = borrowTx.gasUsed.mul(borrowTx.effectiveGasPrice)
    console.log(
      'borrowTx',
      formatNumber(borrowTx.gasUsed, 0, 0),
      formatNumber(borrowTx.effectiveGasPrice, 0, 0),
      formatNumber(gasCost, 18, 6)
    )
  })
  it('encodes', async () => {
    const mockWorkflowInstance = new MockWorkflowInstance()
    mockWorkflowInstance.frontDoorAddress = ADDRESS_ZERO
    const { ethers, deployments, getNamedAccounts, config } = hardhat

    const namedAccounts = await getNamedAccounts()
    const otherUser = namedAccounts.otherUser
    const otherUserSigner = await ethers.getSigner(otherUser)

    // const accounts = config.networks.hardhat.accounts as any
    // const index = 1 // first wallet, increment for next wallets
    // const wallet1 = ethers.Wallet.fromMnemonic(accounts.mnemonic, accounts.path + `/${index}`)
    // const privateKey1 = wallet1.privateKey

    const borrowStepConfig: AaveBorrow = {
      type: 'aave-borrow',
      asset: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
      amount: '100%',
      interestRateMode: 'stable',
    }
    const borrowHelper = new AaveBorrowHelper(mockWorkflowInstance)
    const stdProvider = new Eip1193Bridge(otherUserSigner, otherUserSigner.provider)
    borrowHelper.setProvider(stdProvider)
    mockWorkflowInstance.setProvider('ethereum', stdProvider)
    const borrowEncodingContext: EncodingContext<AaveBorrow> = {
      userAddress: otherUser,
      chain: 'ethereum',
      stepConfig: borrowStepConfig,
      mapStepIdToIndex: new Map<string, number>(),
    }
    const borrowEncoded = await borrowHelper.encodeWorkflowStep(borrowEncodingContext)
    console.log('borrowEncoded', borrowEncoded)
  })
})

function printEvents(logs: Log[], interfaces: Interface[]) {
  const contractInterfaces = [IAaveV3Pool__factory.createInterface()]
  for (const log of logs) {
    for (const iface of contractInterfaces) {
      try {
        const event = iface.parseLog(log)
        const args: string[] = []
        for (const key of Object.keys(event.args)) {
          if (Number.isNaN(parseInt(key))) {
            args.push(`${key}: ${event.args[key].toString()}`)
          }
        }
        console.log(`event ${event.name}(${args.join(', ')})`)
      } catch (e) {
        // ignore
      }
    }
  }
}