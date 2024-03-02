import type { EncodingContext, EncodedWorkflowStep, EvmAsset, MultiStepEncodingContext, BeforeAfterResult } from '@freemarket/core'
import {
  assert,
  ADDRESS_ZERO,
  sdkAssetAndAmountToEvmInputAmount,
  getEthersSigner,
  getEthersProvider,
  Chain,
  Memoize,
  MAX_UINT256,
  getLogger,
} from '@freemarket/core'

import { AbstractStepHelper, AssetSchema, getWrappedNativeAddress } from '@freemarket/step-sdk'
import type { AaveBorrow, AaveInterestRateMode } from './model'
import { defaultAbiCoder } from '@ethersproject/abi'
import type { TypedDataSigner } from '@ethersproject/abstract-signer'
import { IPoolAddressesProvider__factory, IPool__factory, StableDebtToken__factory, VariableDebtToken__factory } from '../typechain-types'
import { getPoolAddressProviderAddress } from './getPoolAddressProviderAddress'
import { splitSignature } from '@ethersproject/bytes'

const log = getLogger('borrow-helper')

export const STEP_TYPE_ID_AAVE_BORROW = 110

const EIP712_REVISION = '1'

interface AaveBorrowActionArgs {
  amount: string | number
  interestRateMode: string
  asset: EvmAsset
  amountIsPercent: boolean
  referralCode: string
}

export class AaveBorrowHelper extends AbstractStepHelper<AaveBorrow> {
  async encodeWorkflowStep(context: EncodingContext<AaveBorrow>): Promise<EncodedWorkflowStep> {
    const evmInputAsset = await sdkAssetAndAmountToEvmInputAmount(
      context.stepConfig.asset,
      context.stepConfig.amount,
      context.chain,
      this.instance,
      false
    )

    const borrowArgs: AaveBorrowActionArgs = {
      amount: evmInputAsset.amount,
      interestRateMode: context.stepConfig.interestRateMode === 'stable' ? '1' : '2',
      asset: evmInputAsset.asset,
      amountIsPercent: evmInputAsset.amountIsPercent,
      referralCode: '0',
    }
    const encodedBorrowArgs = AaveBorrowHelper.encodeArgs(borrowArgs)
    const ret: EncodedWorkflowStep = {
      stepTypeId: STEP_TYPE_ID_AAVE_BORROW,
      stepAddress: ADDRESS_ZERO,
      inputAssets: [],
      argData: encodedBorrowArgs,
    }

    return ret
  }

  async getBeforeAfterAll(context: MultiStepEncodingContext<AaveBorrow>): Promise<BeforeAfterResult | null> {
    const chainId = await this.getChainId()
    // if there's ever a workflow containing the same asset in different borrow steps, but different interest rate modes, this will fail
    const mapAddressToInterestRateModes = new Map<string, 'stable' | 'variable'>()
    const assetAddressPromises = context.stepConfigs.map(async stepConfig => {
      // determine asset address
      const evmInputAsset = await sdkAssetAndAmountToEvmInputAmount(
        stepConfig.asset,
        stepConfig.amount,
        context.chain,
        this.instance,
        false
      )
      const assetAddress =
        evmInputAsset.asset.assetType === 1 ? evmInputAsset.asset.assetAddress : getWrappedNativeAddress(chainId.toString())
      assert(assetAddress)
      mapAddressToInterestRateModes.set(assetAddress, stepConfig.interestRateMode)
      return assetAddress
    })
    const assetAddresses = await Promise.all(assetAddressPromises)
    const uniqueAssetAddresses = [...new Set<string>(assetAddresses)]

    const promises = uniqueAssetAddresses.map(async assetAddress => {
      // instantiate the debt token client
      const interestRateModeStr = mapAddressToInterestRateModes.get(assetAddress)
      assert(interestRateModeStr)
      const debtTokenAddress = await this.getDebtTokenAddress(context.chain, assetAddress, interestRateModeStr)
      const provider = this.instance.getProvider(context.chain)
      const ethersProvider = getEthersProvider(provider)
      const debtToken =
        interestRateModeStr === 'stable'
          ? StableDebtToken__factory.connect(debtTokenAddress, ethersProvider)
          : VariableDebtToken__factory.connect(debtTokenAddress, ethersProvider)

      // get the current nonce for the user + debt token
      const nonce = (await debtToken.nonces(context.userAddress)).toNumber()

      // prepare for signing
      const delegateeAddress = await this.getFrontDoorAddress()
      const tokenName = await debtToken.name()
      const ethersSigner = getEthersSigner(provider)
      const typedDataSigner = ethersSigner as unknown as TypedDataSigner
      const types = {
        DelegationWithSig: [
          { name: 'delegatee', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      }
      const domain = {
        name: tokenName,
        version: EIP712_REVISION,
        chainId: chainId,
        verifyingContract: debtTokenAddress,
      }
      const message = {
        delegatee: delegateeAddress,
        value: MAX_UINT256,
        nonce,
        deadline: MAX_UINT256,
      }

      log.debug(`signing delegate with sig MAX: ` + JSON.stringify(message))
      const flatSigMaxInt = await typedDataSigner._signTypedData(domain, types, message)
      const sigMaxInt = splitSignature(flatSigMaxInt)
      // ret.push({
      //   r: hexlify(sigMaxInt.r),
      //   s: hexlify(sigMaxInt.s),
      //   v: hexlify(sigMaxInt.v),
      // })

      log.debug(`signing delegate with sig 0: ` + JSON.stringify(message))
      message.nonce = nonce + 1
      message.value = '0'
      const flatSigZero = await typedDataSigner._signTypedData(domain, types, message)
      const sigZero = splitSignature(flatSigZero)
      const interestRateMode = interestRateModeStr === 'stable' ? '1' : '2'
      return {
        before: {
          amount: MAX_UINT256,
          interestRateMode,
          assetAddress,
          v: sigMaxInt.v,
          r: sigMaxInt.r,
          s: sigMaxInt.s,
        },
        after: {
          amount: 0,
          interestRateMode,
          assetAddress,
          v: sigZero.v,
          r: sigZero.r,
          s: sigZero.s,
        },
      }
    })
    const sigs = await Promise.all(promises)
    const beforeSigs = sigs.map(s => s.before)
    const afterSigs = sigs.map(s => s.after)

    const abi = `
      tuple(
        uint256 amount,
        uint256 interestRateMode,
        address assetAddress,
        uint8 v,
        bytes32 r,
        bytes32 s
      )[]
    `

    // console.log('=------------------=', JSON.stringify(beforeSigs))
    const beforeArgData = defaultAbiCoder.encode([abi], [beforeSigs])
    const afterArgData = defaultAbiCoder.encode([abi], [afterSigs])

    const stepAddress = context.stepConfigs[0].stepAddresses?.[context.chain] || ADDRESS_ZERO
    return {
      beforeAll: {
        stepTypeId: STEP_TYPE_ID_AAVE_BORROW,
        stepAddress,
        argData: beforeArgData,
      },
      afterAll: {
        stepTypeId: STEP_TYPE_ID_AAVE_BORROW,
        stepAddress,
        argData: afterArgData,
      },
    }
  }

  async getDebtTokenAddress(chain: Chain, assetAddress: string, interestRateMode: AaveInterestRateMode) {
    const reserveData = await this.getReserveInfo(chain, assetAddress)
    return interestRateMode === 'stable' ? reserveData.stableDebtTokenAddress : reserveData.variableDebtTokenAddress
  }

  @Memoize()
  async getReserveInfo(chain: Chain, assetAddress: string) {
    const chainId = await this.getChainId()
    const provider = this.instance.getProvider(chain)
    const ethersProvider = getEthersProvider(provider)
    const addressProviderAddress = getPoolAddressProviderAddress(chainId.toString())
    const addressProvider = IPoolAddressesProvider__factory.connect(addressProviderAddress, ethersProvider)
    const poolAddress = await addressProvider.getPool()
    const pool = IPool__factory.connect(poolAddress, ethersProvider)
    return pool.getReserveData(assetAddress)
  }

  static encodeArgs(args: AaveBorrowActionArgs) {
    log.debug('encoding args', JSON.stringify(args))

    const encodedArgs = defaultAbiCoder.encode(
      [
        `tuple(
          uint256 amount,
          uint256 interestRateMode,
          ${AssetSchema} asset,
          bool amountIsPercent,
          uint16 referralCode
        )`,
      ],
      [args]
    )
    return encodedArgs
  }
}
