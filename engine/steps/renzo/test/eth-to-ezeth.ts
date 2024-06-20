/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { expect } from 'chai'
import hre, { ethers, deployments } from 'hardhat'
import { MAINNET_EZETH_ADDRESS, STEP_TYPE_ID_RENZO_ETH_TO_EZETH } from '../tslib'
import { AssetReference, createStandardProvider, EncodingContext, IERC20__factory, TEN_BIG } from '@freemarket/core'
import { confirmTx, getTestFixture, getUsdt, MockWorkflowInstance, validateAction, WETH_ADDRESS } from '@freemarket/step-sdk/tslib/testing'
import { Weth__factory, formatNumber } from '@freemarket/step-sdk'
import { UniswapExactIn } from '../tslib/model'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { WorkflowStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { DepositEthForEZEthAction } from '../typechain-types'

import Big from 'big.js'
import { Signer } from '@ethersproject/abstract-signer'
import { IERC20Metadata__factory } from '@freemarket/runner'
import { Provider } from '@ethersproject/providers'

const testAmountEth = new Big('1')
const testAmountWei = testAmountEth.mul(TEN_BIG.pow(18)).toFixed(0)

const ONE_ETH = ethers.utils.parseEther('1')


const setup = getTestFixture(hre, async baseFixture => {
  const {
    signers: { otherUserSigner },
    contracts: { frontDoor, userWorkflowRunner },
    users: { otherUser },
  } = baseFixture

  // deploy the contract
  await deployments.fixture('DepositEthForEZEthAction')

  // get a reference to the deployed contract with otherUser as the signer
  const depositEthForEZEthAction = <DepositEthForEZEthAction>await ethers.getContract('DepositEthForEZEthAction', otherUserSigner)
  const ezEth = IERC20__factory.connect(MAINNET_EZETH_ADDRESS, otherUserSigner)
  /*
  const fromAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: 'WETH',
  }
  const toAssetRef: AssetReference = {
    type: 'fungible-token',
    symbol: toSymbol,
  }
  */

  return {
    contracts: { ezEth, depositEthForEZEthAction, userWorkflowRunner, frontDoor },
    hre,
    otherUser,
    otherUserSigner,
  }
})

describe('Uniswap Exact In', async () => {
  it('deploys', async () => {
    const {
      contracts: { configManager, depositEthForEZEthAction },
    } = await setup()
    // simple sanity check to make sure that the action registered itself during deployment
    await validateAction(configManager, STEP_TYPE_ID_RENZO_ETH_TO_EZETH, depositEthForEZEthAction.address)
  })

})
