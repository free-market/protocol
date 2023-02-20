import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import BN from 'bn.js'
import { AaveSupplyActionInstance, MockAavePoolInstance, MockTokenInstance } from '../types/truffle-contracts'
import { ActionIds } from '../tslib/actionIds'
import { AssetType } from '../tslib/AssetType'
import { ADDRESS_ZERO, validateAction } from './test-utilities'
import { AssetAmount } from '../tslib/AssetAmount'
import { Asset } from '../tslib/Asset'

const AaveSupplyAction = artifacts.require('AaveSupplyAction')
const MockToken = artifacts.require('MockToken')
const MockAavePool = artifacts.require('MockAavePool')

use(solidity)

contract('AaveSupplyAction', function (accounts: string[]) {
  let aaveSupplyAction!: AaveSupplyActionInstance
  let mockInputAsset!: MockTokenInstance
  let mockAToken!: MockTokenInstance
  let mockPool!: MockAavePoolInstance
  const userAddress = accounts[1]
  const inputAmount = new BN(10).pow(new BN(16)) // 0.01 ETH
  let inputAssetAmount!: AssetAmount

  before(async () => {
    mockInputAsset = await MockToken.new()
    mockPool = await MockAavePool.new()
    const mockATokenAddr = await mockPool.mockAToken()
    mockAToken = await MockToken.at(mockATokenAddr)
    aaveSupplyAction = await AaveSupplyAction.new(mockPool.address)
    const inputAsset: Asset = {
      assetType: AssetType.ERC20,
      assetAddress: mockInputAsset.address,
    }
    inputAssetAmount = {
      asset: inputAsset,
      amount: inputAmount.toString(),
    }
  })

  it('deployed correctly during migrate', async () => {
    const deployedAave = await AaveSupplyAction.deployed()
    await validateAction(ActionIds.aaveSupply, deployedAave.address)
  })

  it('invokes Pool.supply', async () => {
    // start with the input asset already in custody of the contract
    await mockInputAsset.mint(aaveSupplyAction.address, inputAmount)
    const aTokenBalanceBefore = await mockAToken.balanceOf(aaveSupplyAction.address)
    await aaveSupplyAction.execute([inputAssetAmount], [], '0x', { from: userAddress })
    const aTokenBalanceAfter = await mockAToken.balanceOf(aaveSupplyAction.address)
    const aTokenBalanceDelta = aTokenBalanceAfter.sub(aTokenBalanceBefore)
    expect(aTokenBalanceDelta.toString()).to.equal(inputAmount.toString())
  })

  it('reverts when 0 or more than 1 input assets are given', async () => {
    // zero input assets
    await expect(aaveSupplyAction.execute([], [], '0x')).to.be.reverted
    // two input assets
    await expect(aaveSupplyAction.execute([inputAssetAmount, inputAssetAmount], [], '0x')).to.be.reverted
  })

  it('reverts when sending aTokens to the user directy and there are output assets specified', async () => {
    // just re-using the input asset as any arbitrary asset for this test
    await expect(aaveSupplyAction.execute([], [inputAssetAmount.asset], '0x')).to.be.reverted
  })
})
