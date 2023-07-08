import {
  EncodingContext,
  EncodedWorkflowStep,
  sdkAssetAmountToEvmInputAmount,
  assert,
  ADDRESS_ZERO,
  sdkAssetAndAmountToEvmInputAmount,
  AssetAmount,
  sdkAssetToEvmAsset,
  Asset,
  EvmAsset,
  getEthersSigner,
  getEthersProvider,
  Chain,
  Memoize,
  MAX_UINT256,
  EvmInputAsset,
  getChainIdFromChain,
} from '@freemarket/core'
import { WorkflowStepInputAssetStruct } from '@freemarket/core/typechain-types/contracts/IWorkflowRunner'
import { TypedDataUtils, signTypedData_v4 } from 'eth-sig-util'

import { AbstractStepHelper, AssetSchema, InputAssetSchema, getWrappedNativeAddress } from '@freemarket/step-sdk'
import type { AaveBorrow, AaveInterestRateMode, AaveSupply } from './model'
import { defaultAbiCoder } from '@ethersproject/abi'
import { TypedDataSigner } from '@ethersproject/abstract-signer'
import { ECDSASignature } from 'ethereumjs-util'
import { IPoolAddressesProvider__factory, IPool__factory, StableDebtToken__factory, VariableDebtToken__factory } from '../typechain-types'
import { getPoolAddressProviderAddress } from './getPoolAddressProviderAddress'
import { hexlify, splitSignature } from '@ethersproject/bytes'
import { recoverAddress, verifyTypedData } from 'ethers/lib/utils'
import rootLogger from 'loglevel'

const log = rootLogger.getLogger('borrow-helper')

export const STEP_TYPE_ID_AAVE_BORROW = 110

interface DelegationWithSigParams {
  v: string
  r: string
  s: string
}

interface AaveBorrowActionArgs {
  amount: string | number
  interestRateMode: string
  asset: EvmAsset
  amountIsPercent: boolean
  referralCode: string
  delegateSigs: DelegationWithSigParams[]
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

    const delegateSigs = await this.getDelegationWithSigs(context, evmInputAsset)

    const borrowArgs: AaveBorrowActionArgs = {
      amount: evmInputAsset.amount,
      interestRateMode: context.stepConfig.interestRateMode === 'stable' ? '1' : '2',
      asset: evmInputAsset.asset,
      amountIsPercent: evmInputAsset.amountIsPercent,
      referralCode: '0',
      delegateSigs,
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
    console.log('encoding args', JSON.stringify(args))
    const sigSchema = `
      tuple(
        uint8 v,
        bytes32 r,
        bytes32 s
      )
    `

    const encodedArgs = defaultAbiCoder.encode(
      [
        `tuple(
          uint256 amount,
          uint256 interestRateMode,
          ${AssetSchema} asset,
          bool amountIsPercent,
          uint16 referralCode,
          ${sigSchema}[] delegateSigs
        )`,
      ],
      [args]
    )
    return encodedArgs
  }

  // returns a pair of these, the first permits MAX_UINT256, the 2nd permits 0
  async getDelegationWithSigs(context: EncodingContext<AaveBorrow>, evmInputAsset: EvmInputAsset): Promise<DelegationWithSigParams[]> {
    const chainId = await this.getChainId()
    const assetAddress =
      evmInputAsset.asset.assetType === 1 ? evmInputAsset.asset.assetAddress : getWrappedNativeAddress(chainId.toString())
    assert(assetAddress)
    const debtTokenAddress = await this.getDebtTokenAddress(context.chain, assetAddress, context.stepConfig.interestRateMode)

    const provider = this.instance.getProvider(context.chain)
    const ethersProvider = getEthersProvider(provider)
    const debtToken =
      context.stepConfig.interestRateMode === 'stable'
        ? StableDebtToken__factory.connect(debtTokenAddress, ethersProvider)
        : VariableDebtToken__factory.connect(debtTokenAddress, ethersProvider)

    const expiration = MAX_UINT256
    const nonce = (await debtToken.nonces(context.userAddress)).toNumber()
    const EIP712_REVISION = '1'
    const delegateeAddress = await this.getFrontDoorAddress()

    const tokenName = await debtToken.name()
    // const msgParams = buildDelegationWithSigParams(
    //   chainId,
    //   debtTokenAddress,
    //   EIP712_REVISION,
    //   await debtToken.name(),
    //   delegateeAddress,
    //   nonce,
    //   expiration,
    //   MAX_UINT256
    // )
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

    console.log(`signing delegate with sig MAX: ` + JSON.stringify(message))
    const flatSig = await typedDataSigner._signTypedData(domain, types, message)
    // var message = TypedDataUtils.sign(msgParams)
    // const flatSig = await ethersSigner.signMessage(message)
    const sig = splitSignature(flatSig)
    const ret: DelegationWithSigParams[] = []
    ret.push({
      r: hexlify(sig.r),
      s: hexlify(sig.s),
      v: hexlify(sig.v),
    })

    message.nonce = nonce + 1
    message.value = '0'
    console.log(`signing delegate with sig 0: ` + JSON.stringify(message))
    const flatSig2 = await typedDataSigner._signTypedData(domain, types, message)
    const sig2 = splitSignature(flatSig2)
    ret.push({
      r: hexlify(sig2.r),
      s: hexlify(sig2.s),
      v: hexlify(sig2.v),
    })

    return ret
  }
}

export type tEthereumAddress = string
export type tStringTokenSmallUnits = string // 1 wei, or 1 basic unit of USDC, or 1 basic unit of DAI

export const buildDelegationWithSigParams = (
  chainId: number,
  token: tEthereumAddress,
  revision: string,
  tokenName: string,
  delegatee: tEthereumAddress,
  nonce: number,
  deadline: string,
  value: tStringTokenSmallUnits
) => ({
  types: {
    // EIP712Domain: [
    //   { name: 'name', type: 'string' },
    //   { name: 'version', type: 'string' },
    //   { name: 'chainId', type: 'uint256' },
    //   { name: 'verifyingContract', type: 'address' },
    // ],
    DelegationWithSig: [
      { name: 'delegatee', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  primaryType: 'DelegationWithSig' as const,
  domain: {
    name: tokenName,
    version: revision,
    chainId: chainId,
    verifyingContract: token,
  },
  message: {
    delegatee,
    value,
    nonce,
    deadline,
  },
})
