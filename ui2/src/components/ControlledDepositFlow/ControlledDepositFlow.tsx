import BN from 'bn.js'
import DepositFlow from '@component/DepositFlow'
import { DepositFlowProps } from '@component/DepositFlow/DepositFlow'
import { useDepositFlowState } from '@component/DepositFlowStateProvider/useDepositFlowState'
import {
  useAccount,
  useBalance,
  useConnect,
  useNetwork,
  useProvider,
  useSigner,
  useSwitchNetwork,
} from 'wagmi'
import {
  FrontDoor__factory,
  WorkflowRunner__factory,
  AaveSupplyAction__factory,
  ERC20__factory,
  getNetworkConfig,
  StargateBridgeAction__factory,
} from '@fmp/evm/build'
import { ActionIds } from '@fmp/evm/build/utils/actionIds'
import { AssetType } from '@fmp/evm/build/tslib/AssetType'
import {
  encodeStargateBridgeArgs,
  waitForNonceWithProvider,
} from '@fmp/evm/build/tslib/StargateBridgeAction'
import { EvmWorkflow } from '@fmp/evm/build/tslib/EvmWorkflow'
import { getBridgePayload } from '@fmp/evm/build/tslib/encode-workflow'
import { encodeAaveSupplyArgs } from '@fmp/evm/build/tslib/AaveSupplyAction'
import { Asset } from '@fmp/evm/build/tslib/Asset'
import {
  getStargateRequiredNative,
  getStargateMinAmountOut,
  StargateChainIds,
  StargatePoolIds,
} from '@fmp/evm/build/utils/stargate-utils'
import { encodeAddAssetArgs } from '@fmp/evm/build/tslib/AddAssetAction'
import * as ethers from 'ethers'
import { EIP1193Provider } from 'eip1193-provider'
import { useQueryParam, StringParam } from 'use-query-params'

const SOURCE_CHAIN_ID = 10 // Optimism
const DEST_CHAIN_ID = 42161 // Arbitrum

type FeePrediction = {
  dstWorkflow: EvmWorkflow
  dstEncodedWorkflow: string
  nonce: string
  dstGasEstimate: number
  inputAmount: BN
  minAmountOut: string
  srcGasCost: ethers.ethers.BigNumber
  dstGasCost: ethers.ethers.BigNumber
  stargateRequiredNative: string
  srcUsdcBalance: ethers.ethers.BigNumber
}

interface WorkflowCostItem {
  description: string
  amount: string
  asset: Asset
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const ControlledDepositFlow = (
  props: Omit<DepositFlowProps, 'walletState' | 'networkChoices'> & {
    includeDeveloperNetworks?: boolean
  },
): JSX.Element => {
  const [layout] = useQueryParam('layout', StringParam)
  const { chain } = useNetwork()
  const { address, isConnected: connected } = useAccount()
  const { connect, connectors } = useConnect()
  const vm = useDepositFlowState()
  const { switchNetwork } = useSwitchNetwork()

  const srcNetworkId = SOURCE_CHAIN_ID
  const dstNetworkId = DEST_CHAIN_ID

  const dstProvider = useProvider({
    chainId: dstNetworkId,
  })

  const srcProvider = useProvider({
    chainId: srcNetworkId,
  })

  const { data: srcSigner } = useSigner({
    chainId: srcNetworkId,
  })

  const predictFees = async (amount = 1_000_000): Promise<FeePrediction> => {
    if (typeof address !== 'string') {
      throw new Error('address has not been retrieved')
    }

    if (srcSigner == null) {
      throw new Error('signer is not connected')
    }

    const srcFrontDoor = FrontDoor__factory.connect(
      '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299',
      srcProvider,
    )
    /*
     * const dstFrontDoor = FrontDoor__factory.connect(
     *   '0x2d20B07cd0075EaA4d662B50Ad033C10659F0a9f',
     *   dstProvider,
     * )
     */
    const dstRunner = WorkflowRunner__factory.connect(
      '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299',
      dstProvider,
    )
    console.log('got providers')
    const dstAaveSupplyActionAddr = await dstRunner.getActionAddress(
      ActionIds.aaveSupply,
    )
    const dstAaveSupplyAction = AaveSupplyAction__factory.connect(
      dstAaveSupplyActionAddr,
      dstProvider,
    )
    const dstMockATokenAddr = await dstAaveSupplyAction.aTokenAddress()
    const dstMockAToken = ERC20__factory.connect(dstMockATokenAddr, dstProvider)
    const aTokenBalanceBefore = await dstMockAToken.balanceOf(address)
    console.log('balance', aTokenBalanceBefore)

    // console.log(`srcUserAddress=${userAddressSrc} input amount=${inputAmount.toString()} minAmountOut=${minAmountOut.toString()} fee=${fee}`)

    // const srcContractAddresses = getNetworkConfig(`${srcNetworkId}`)
    const dstContractAddresses = getNetworkConfig(`${dstNetworkId}`)

    const srcUsdc = ERC20__factory.connect(
      '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      srcSigner,
    )

    // let the caller supply the dest chain's SG action so chains don't need to know about all other chains
    // TODO move into helper
    console.log('got asdfasdfasdf')
    const dstStargateActionAddr = await dstRunner.getActionAddress(
      ActionIds.stargateBridge,
    )
    console.log('dstStargateActionAddr', dstStargateActionAddr)
    const dstStargateAction = StargateBridgeAction__factory.connect(
      dstStargateActionAddr,
      dstProvider,
    )
    const dstStargateRouterAddr =
      await dstStargateAction.stargateRouterAddress()
    console.log('dstStargateRouterAddr', dstStargateRouterAddr)

    const dstWorkflow: EvmWorkflow = {
      steps: [
        {
          //
          // -- Aave Supply
          actionId: ActionIds.aaveSupply,
          actionAddress: ADDRESS_ZERO,
          inputAssets: [
            {
              asset: {
                assetType: AssetType.ERC20,
                assetAddress: dstContractAddresses.USDC,
              },
              amount: '1000000',
              amountIsPercent: true,
            },
          ],
          outputAssets: [],
          data: encodeAaveSupplyArgs({ onBehalfOf: address }),
          nextStepIndex: -1,
        },
      ],
    }

    const { encodedWorkflow: dstEncodedWorkflow, nonce } = getBridgePayload(
      address,
      dstWorkflow,
    )

    console.log('got encoded workflow')
    // const dstGasEstimate = await dstStargateAction.sgReceive.estimateGas(
    //   1, // the remote chainId sending the tokens (value not used by us)
    //   ADDRESS_ZERO, // the remote Bridge address (value not used by us)
    //   2, // nonce (value not used by us)
    //   dstContractAddresses.sgUSDC, // the token contract on the dst chain
    //   inputAmount, // the qty of local _token contract tokens
    //   dstEncodedWorkflow,
    //   { from: dstStargateRouterAddr } // claim we are sg router as required by our sgReceive implementation
    // )
    const dstGasEstimate = 1_000_000
    const inputAmount = new BN(amount) // $1.00

    // TODO this needs to be on chain because 'inputAmount' is not known in general
    const minAmountOut = await getStargateMinAmountOut({
      provider: window.ethereum as unknown as EIP1193Provider,
      frontDoorAddress: srcFrontDoor.address,
      inputAmount: inputAmount,
      dstChainId: StargateChainIds.Arbitrum,
      srcPoolId: 1, //StargatePoolIds.USDC on optimism https://stargateprotocol.gitbook.io/stargate/developers/pool-ids
      dstPoolId: 1, //StargatePoolIds.USDC on arbitrum
      dstUserAddress: address,
    })

    console.log('got minAmountOut')

    const srcGasCost = await srcProvider.getGasPrice()
    const dstGasCost = await dstProvider.getGasPrice()

    console.log('got gas prices')

    // console.log(`srcGasCost ${srcGasCostStr}`)
    // console.log(`dstGasCost ${dstGasCostStr}`)
    // const dstWorkflowGasCostEstimate = new BN(dstGasEstimate).mul(dstGasCost)

    const stargateRequiredNative = await getStargateRequiredNative({
      provider: window.ethereum as unknown as EIP1193Provider,
      frontDoorAddress: srcFrontDoor.address,
      dstAddress: address,
      dstGasForCall: dstGasEstimate.toString(),
      payload: dstEncodedWorkflow,
      dstChainId: StargateChainIds.Arbitrum,
    })

    console.log('got required native')

    const srcUsdcBalance = await srcUsdc.balanceOf(address)

    return {
      dstWorkflow,
      dstEncodedWorkflow,
      nonce,
      dstGasEstimate,
      inputAmount,
      minAmountOut,
      srcGasCost,
      dstGasCost,
      stargateRequiredNative,
      srcUsdcBalance,
    }
  }

  const submitWorkflow = async (): Promise<{
    transaction: { hash: string }
    wait: () => Promise<{ transaction: { hash: string } }>
  }> => {
    if (typeof address !== 'string') {
      throw new Error('address has not been retrieved')
    }

    if (srcSigner == null) {
      throw new Error('signer is not connected')
    }

    const srcRunner = WorkflowRunner__factory.connect(
      '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299',
      srcSigner,
    )
    const dstRunner = WorkflowRunner__factory.connect(
      '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299',
      dstProvider,
    )
    console.log('foo')
    const dstAaveSupplyActionAddr = await dstRunner.getActionAddress(
      ActionIds.aaveSupply,
    )
    const dstAaveSupplyAction = AaveSupplyAction__factory.connect(
      dstAaveSupplyActionAddr,
      dstProvider,
    )
    const dstMockATokenAddr = await dstAaveSupplyAction.aTokenAddress()
    const dstMockAToken = ERC20__factory.connect(dstMockATokenAddr, dstProvider)
    const aTokenBalanceBefore = await dstMockAToken.balanceOf(address)
    console.log('balance', aTokenBalanceBefore)

    // console.log(`srcUserAddress=${userAddressSrc} input amount=${inputAmount.toString()} minAmountOut=${minAmountOut.toString()} fee=${fee}`)

    // const srcContractAddresses = getNetworkConfig(`${srcNetworkId}`)
    const dstContractAddresses = getNetworkConfig(`${dstNetworkId}`)

    const srcUsdc = ERC20__factory.connect(
      '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      srcSigner,
    )

    const dstUsdc = ERC20__factory.connect(
      '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      dstProvider,
    )

    const srcUsdcAsset = {
      assetType: AssetType.ERC20,
      assetAddress: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    }

    // let the caller supply the dest chain's SG action so chains don't need to know about all other chains
    // TODO move into helper
    console.log('bar')
    const dstStargateActionAddr = await dstRunner.getActionAddress(
      ActionIds.stargateBridge,
    )
    console.log('dstStargateActionAddr', dstStargateActionAddr)
    const dstStargateAction = StargateBridgeAction__factory.connect(
      dstStargateActionAddr,
      dstProvider,
    )
    const dstStargateRouterAddr =
      await dstStargateAction.stargateRouterAddress()
    console.log('dstStargateRouterAddr', dstStargateRouterAddr)
    // const dstGasEstimate = await dstStargateAction.sgReceive.estimateGas(
    //   1, // the remote chainId sending the tokens (value not used by us)
    //   ADDRESS_ZERO, // the remote Bridge address (value not used by us)
    //   2, // nonce (value not used by us)
    //   dstContractAddresses.sgUSDC, // the token contract on the dst chain
    //   inputAmount, // the qty of local _token contract tokens
    //   dstEncodedWorkflow,
    //   { from: dstStargateRouterAddr } // claim we are sg router as required by our sgReceive implementation
    // )

    // console.log(`srcGasCost ${srcGasCostStr}`)
    // console.log(`dstGasCost ${dstGasCostStr}`)
    // const dstWorkflowGasCostEstimate = new BN(dstGasEstimate).mul(dstGasCost)

    const {
      dstEncodedWorkflow,
      nonce,
      dstGasEstimate,
      inputAmount,
      minAmountOut,
      srcGasCost,
      dstGasCost,
      stargateRequiredNative,
      srcUsdcBalance,
    } = await predictFees()

    const dstUsdcBalance = await dstUsdc.balanceOf(address)
    console.log(
      `before srcUsdcBalance=${srcUsdcBalance.toString()} dstUsdcBalance=${dstUsdcBalance}`,
    )
    console.log('approving input asset transfer...')
    try {
      const approveTx = await srcUsdc.approve(
        srcRunner.address,
        ethers.BigNumber.from(`0x${inputAmount.toJSON()}`),
        {
          from: address,
        },
      )
      await approveTx.wait()
      console.log('input asset transfer approved')
    } catch (_error) {
      // no-op
    }

    const allowance = await srcUsdc.allowance(address, srcRunner.address)
    console.log(`allowance after approve: ${allowance}`)

    // const stargateFeePlusGas = dstWorkflowGasCostEstimate.add(new BN(stargateBridgeFee)) // .mul(new BN('11')).div(new BN('10'))
    const ASSET_NATIVE: Asset = {
      assetType: AssetType.Native,
      assetAddress: ADDRESS_ZERO,
    }

    const srcWorkflow: EvmWorkflow = {
      steps: [
        //
        // -- Add Asset (USDC)
        {
          actionId: ActionIds.addAsset,
          actionAddress: ADDRESS_ZERO,
          inputAssets: [], // no input assets
          outputAssets: [srcUsdcAsset],
          data: encodeAddAssetArgs({
            fromAddress: address,
            amount: inputAmount,
          }),
          nextStepIndex: 1,
        },
        //
        // -- Stargate Bridge
        {
          actionId: ActionIds.stargateBridge,
          actionAddress: ADDRESS_ZERO,
          inputAssets: [
            {
              asset: srcUsdcAsset,
              amount: '1000000',
              amountIsPercent: true,
            },
            {
              asset: ASSET_NATIVE,
              amount: stargateRequiredNative.toString(),
              amountIsPercent: false,
            },
          ],
          outputAssets: [], // no output assets, the input asset is transfered from the caller
          data: encodeStargateBridgeArgs({
            dstActionAddress: dstStargateActionAddr, // who initially gets the money and gets invoked by SG
            dstUserAddress: dstStargateActionAddr, // dstUserAddress, // who gets the money after the continuation workflow completes
            srcPoolId: StargatePoolIds.USDC.toString(),
            dstPoolId: StargatePoolIds.USDC.toString(),
            dstChainId: StargateChainIds.Arbitrum.toString(),
            dstGasForCall: dstGasEstimate.toString(), // gas units (not wei or gwei)
            dstNativeAmount: '0',
            minAmountOut: minAmountOut,
            minAmountOutIsPercent: false,
            dstWorkflow: dstEncodedWorkflow,
          }),
          nextStepIndex: -1,
        },
      ],
    }

    const srcWorkflowGasEstimate = await srcRunner.estimateGas.executeWorkflow(
      srcWorkflow,
      {
        from: address,
        value: stargateRequiredNative,
      },
    )
    const srcWorkflowGasCost = srcGasCost.mul(srcWorkflowGasEstimate)
    const maxSlippageAbsolute = inputAmount.sub(new BN(minAmountOut))

    const costs: WorkflowCostItem[] = [
      {
        description: 'token transfer approval gas',
        amount: '0', // TODO
        asset: ASSET_NATIVE,
      },
      {
        description: 'source chain gas',
        amount: srcWorkflowGasCost.toString(),
        asset: ASSET_NATIVE,
      },
      {
        description: 'destination chain gas',
        amount: dstGasEstimate.toString(),
        asset: ASSET_NATIVE,
      },
      {
        description: 'Staragate fee',
        amount: dstGasCost.toString(),
        asset: ASSET_NATIVE,
      },
      {
        description: 'Staragate slippage (max)',
        amount: maxSlippageAbsolute.toString(),
        asset: srcUsdcAsset,
      },
    ]

    console.table(
      costs.map((it) => {
        const rv = { ...it, asset: '' }
        if (it.asset.assetType === AssetType.ERC20) {
          rv.asset = `erc20 (${it.asset.assetAddress})`
        } else {
          rv.asset = 'native'
        }
        return rv
      }),
    )

    // const dstStargateActionBalance = await dstUsdc.balanceOf( dstStargateActionAddr,)

    console.log('submitting source chain workflow...')
    const txResponse = await srcRunner.executeWorkflow(srcWorkflow, {
      from: address,
      value: stargateRequiredNative,
    })
    console.log(JSON.stringify(txResponse, null, 4))

    return {
      transaction: {
        hash: txResponse.hash,
      },

      wait: async () =>
        waitForNonceWithProvider(
          dstProvider,
          dstRunner.address,
          nonce,
          60_000 * 5,
          dstContractAddresses.USDC,
          dstMockATokenAddr,
          address,
          dstStargateActionAddr,
        ),
    }
  }

  const handleClick = async (): Promise<void> => {
    if (!connected) {
      connect({ connector: connectors[0] })
    } else if (vm.flowStep === 'open') {
      if (networkMatches) {
        if (walletState === 'ready' && vm.amount != null) {
          // TODO(FMP-381): prevent user from starting deposit until after gas balance is fetched
          if (destGasBalance?.data?.value.toHexString() === '0x00') {
            const choice = window.confirm(
              `You have no gas on Arbitrum. Are you sure you want to deposit to ${address}?`,
            )

            if (!choice) {
              return
            }
          }
          vm.dispatch({ name: 'WorkflowSubmissionStarted' })
          await delay(50)
          let wait, transaction
          try {
            ;({ wait, transaction } = await submitWorkflow())
          } catch (error) {
            console.error(error)
            vm.dispatch({ name: 'WorkflowSubmissionFailed' })
            return
          }
          vm.dispatch({ name: 'WorkflowSubmissionFinished', transaction })
          await delay(3000)
          vm.dispatch({ name: 'WorkflowStarted' })
          const { transaction: destinationTransaction } = await wait()
          vm.dispatch({
            name: 'WorkflowCompleted',
            transaction: destinationTransaction,
          })
        }
      } else if (vm.selectedChain.address != null) {
        switchNetwork?.(Number(vm.selectedChain.address))
      }
    }
  }

  const result = useBalance({
    chainId: Number(vm.selectedChain.address),
    address,
    token: (vm.selectedToken.address === '0x0'
      ? undefined
      : vm.selectedToken.address) as `0x${string}`,
  })

  const destGasBalance = useBalance({
    // TODO(FMP-380): track the destination details somewhere
    chainId: 421613,
    address,
  })

  const { data: balanceData } = result

  let balanceState: DepositFlowProps['balanceState'] = 'hidden'
  let balance = ''

  const networkMatches = Number(vm.selectedChain.address) === chain?.id

  // Ethereum mainnet, Ethereum Goerli, and Avalanche Fuji
  if (connected && networkMatches) {
    balanceState = 'loading'

    if (balanceData) {
      balanceState = 'displayed'
      balance = balanceData.formatted.replace(
        /\.(\d{7}).*$/,
        (_, lastSeven) => `.${lastSeven}`,
      )
    }
  }

  const {
    // includeDeveloperNetworks = false,
    ...rest
  } = props

  const walletState = connected
    ? networkMatches
      ? balance === '0.00'
        ? 'insufficient-balance'
        : 'ready'
      : 'network-mismatch'
    : 'unconnected'

  const handleAmountChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { value } = event.target
    vm.dispatch({ name: 'AmountChanged', value })

    // TODO(FMP-418): introduce promise queue and throttle this function call
    if (value.trim() === '') {
      vm.dispatch({ name: 'UnavailableFeePredicted' })
    } else {
      vm.dispatch({ name: 'FeePredictionStarted', amount: value })

      const workflowDetails = await predictFees(Number(value) * 1_000_000)

      const { srcGasCost, dstGasCost } = workflowDetails

      vm.dispatch({
        name: 'FeePredicted',
        amount: value,
        fee: {
          slippage: '0.5%',
          destination: {
            gasPrice: dstGasCost.toString(),
          },
          source: {
            gasPrice: srcGasCost.toString(),
          },
          protocol: {
            usd: ethers.utils.formatUnits(workflowDetails.minAmountOut, 6),
          },
          lowestPossibleAmount: '',
        },
        workflowDetails,
      })
    }
  }

  return (
    <>
      <DepositFlow
        {...rest}
        onAmountChange={handleAmountChange}
        balanceState={balanceState}
        balance={balance}
        walletState={walletState}
        onClick={handleClick}
        networkChoices={
          [
            {
              address: 10,
              symbol: 'Optimism',
              title: 'Optimism',
              icon: {
                url: 'https://app.aave.com/icons/networks/optimism.svg',
              },
            },
          ]
          /*
          includeDeveloperNetworks
            ? [
                {
                  address: 5,
                  symbol: 'Ethereum Goerli',
                  title: 'Ethereum Goerli',
                  icon: { url: 'https://app.aave.com/icons/tokens/eth.svg' },
                },
                {
                  // rpc url: https://api.avax-test.network/ext/bc/C/rpc
                  address: 43113,
                  symbol: 'Avalanche Fuji',
                  title: 'Avalanche Fuji C-Chain',
                  icon: {
                    url: 'https://app.aave.com/icons/networks/avalanche.svg',
                  },
                },

                {
                  address: 421613,
                  symbol: 'Arbitrum Goerli',
                  title: 'Arbitrum Goerli',
                  icon: {
                    url: 'https://app.aave.com/icons/networks/arbitrum.svg',
                  },
                },
                ...defaultNetworkChoices,
              ]
            : undefined
           */
        }
        layout={layout === 'iframe' ? 'iframe' : 'default'}
      />
    </>
  )
}

function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time))
}
