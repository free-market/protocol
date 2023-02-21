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
  useWebSocketProvider,
} from 'wagmi'
import {
  FrontDoor__factory,
  WorkflowRunner__factory,
  ERC20__factory,
  getNetworkConfig,
  StargateBridgeAction__factory,
} from '@fmp/evm/build'
import { ActionIds } from '@fmp/evm/build/tslib/actionIds'
import { AssetType } from '@fmp/evm/build/tslib/AssetType'
import { encodeStargateBridgeArgs } from '@fmp/evm/build/tslib/StargateBridgeAction'
import { EvmWorkflow } from '@fmp/evm/build/tslib/EvmWorkflow'
import { getBridgePayload } from '@fmp/evm/build/tslib/encode-workflow'
import { Asset } from '@fmp/evm/build/tslib/Asset'
import {
  getStargateRequiredNative,
  getStargateMinAmountOut,
  StargateChainIds,
  StargatePoolIds,
} from '@fmp/evm/build/tslib/StargateBridgeAction'
import { encodeAddAssetArgs } from '@fmp/evm/build/tslib/AddAssetAction'
import * as ethers from 'ethers'
import { useQueryParam, StringParam, BooleanParam } from 'use-query-params'
import { getATokenAddress } from '@fmp/evm/build/tslib/AaveSupplyAction'
import { Eip1193Bridge } from '@ethersproject/experimental'
import {
  waitForContinuationNonce,
  WaitForContinuationResult,
} from '@fmp/evm/build/tslib/bridge-utils'
import rootLogger from 'loglevel'

rootLogger.setDefaultLevel('debug')

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

type SourceNetworkAddress = 10 | 5
type DestinationNetworkAddress = 42161 | 421613

type SourceNetworkDetails = {
  id: SourceNetworkAddress
  name: string
  mainnet: boolean
  frontDoor: { address: `0x${string}` }
  USDC: { address: `0x${string}` }
}

type DestinationNetworkDetails = {
  id: DestinationNetworkAddress
  name: string
  mainnet: boolean
  frontDoor: { address: `0x${string}` }
  USDC: { address: `0x${string}` }
}

const networkDetailsRecord: Record<SourceNetworkAddress, SourceNetworkDetails> &
  Record<DestinationNetworkAddress, DestinationNetworkDetails> = {
  10: {
    id: 10,
    name: 'Optimism',
    mainnet: true,
    frontDoor: { address: '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299' },
    USDC: { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' },
  },
  5: {
    id: 5,
    name: 'Ethereum Goerli',
    mainnet: false,
    frontDoor: { address: '0xC2924D72d322A30F885cff51A3b8830FF5721bc1' },
    USDC: { address: '0xDf0360Ad8C5ccf25095Aa97ee5F2785c8d848620' },
  },
  42161: {
    id: 42161,
    name: 'Arbitrum',
    mainnet: true,
    frontDoor: { address: '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299' },
    USDC: { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' },
  },
  421613: {
    id: 421613,
    name: 'Arbitrum Goerli',
    mainnet: false,
    frontDoor: {
      address: '0x768616323F67784595114381b785072FA8C61352',
    },
    USDC: { address: '0x6aAd876244E7A1Ad44Ec4824Ce813729E5B6C291' },
  },
}

export const ControlledDepositFlow = (
  props: Omit<DepositFlowProps, 'walletState' | 'networkChoices'> & {
    includeDeveloperNetworks?: boolean
  },
): JSX.Element => {
  const vm = useDepositFlowState()
  const [layout] = useQueryParam('layout', StringParam)
  const [includeDeveloperNetworks] = useQueryParam(
    'includeDeveloperNetworks',
    BooleanParam,
  )
  const { chain } = useNetwork()
  const { address, isConnected: connected } = useAccount()
  const { connect, connectors } = useConnect()
  const { switchNetwork } = useSwitchNetwork()

  const srcNetworkId = vm.selectedChain.address as SourceNetworkAddress

  let dstNetworkId: DestinationNetworkAddress

  if (networkDetailsRecord[srcNetworkId].mainnet) {
    dstNetworkId = 42161
  } else {
    dstNetworkId = 421613
  }

  const dstProvider = useProvider({
    chainId: dstNetworkId,
  })

  const dstWebSocketProvider = useWebSocketProvider({
    chainId: dstNetworkId,
  })
  const dstStandardProvider = new Eip1193Bridge(
    new ethers.VoidSigner(ADDRESS_ZERO),
    dstWebSocketProvider,
  )

  const srcProvider = useProvider({
    chainId: srcNetworkId,
  })

  const srcStandardProvider = new Eip1193Bridge(
    new ethers.VoidSigner(ADDRESS_ZERO),
    srcProvider,
  )

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
      networkDetailsRecord[srcNetworkId].frontDoor.address,
      srcProvider,
    )
    const dstRunner = WorkflowRunner__factory.connect(
      networkDetailsRecord[dstNetworkId].frontDoor.address,
      dstProvider,
    )
    console.log(
      'got providers',
      ActionIds.aaveSupply,
      (await dstProvider.getNetwork())?.chainId,
    )
    const dstMockATokenAddr = await getATokenAddress(
      networkDetailsRecord[dstNetworkId].frontDoor.address,
      networkDetailsRecord[dstNetworkId].USDC.address,
      dstStandardProvider,
    )
    const dstMockAToken = ERC20__factory.connect(dstMockATokenAddr, dstProvider)
    const aTokenBalanceBefore = await dstMockAToken.balanceOf(address)
    console.log('balance', aTokenBalanceBefore)

    const srcUsdc = ERC20__factory.connect(
      networkDetailsRecord[srcNetworkId].USDC.address,
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
                assetAddress: networkDetailsRecord[dstNetworkId].USDC.address,
              },
              amount: '1000000',
              amountIsPercent: true,
            },
          ],
          outputAssets: [],
          data: '0x',
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
      provider: srcStandardProvider,
      frontDoorAddress: srcFrontDoor.address,
      inputAmount: inputAmount.toString(),
      dstChainId: {
        42161: StargateChainIds.Arbitrum,
        421613: StargateChainIds.GoerliArbitrum,
      }[dstNetworkId],
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
      provider: srcStandardProvider,
      frontDoorAddress: srcFrontDoor.address,
      dstAddress: address,
      dstGasForCall: dstGasEstimate.toString(),
      payload: dstEncodedWorkflow,
      dstChainId: {
        42161: StargateChainIds.Arbitrum,
        421613: StargateChainIds.GoerliArbitrum,
      }[dstNetworkId],
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
    wait: () => Promise<WaitForContinuationResult>
  }> => {
    if (typeof address !== 'string') {
      throw new Error('address has not been retrieved')
    }

    if (srcSigner == null) {
      throw new Error('signer is not connected')
    }

    const srcRunner = WorkflowRunner__factory.connect(
      networkDetailsRecord[srcNetworkId].frontDoor.address,
      srcSigner,
    )

    const dstRunner = WorkflowRunner__factory.connect(
      networkDetailsRecord[dstNetworkId].frontDoor.address,
      dstProvider,
    )
    const dstMockATokenAddr = await getATokenAddress(
      networkDetailsRecord[dstNetworkId].frontDoor.address,
      networkDetailsRecord[dstNetworkId].USDC.address,
      dstStandardProvider,
    )

    const dstMockAToken = ERC20__factory.connect(dstMockATokenAddr, dstProvider)
    const aTokenBalanceBefore = await dstMockAToken.balanceOf(address)
    console.log('balance', aTokenBalanceBefore)

    // console.log(`srcUserAddress=${userAddressSrc} input amount=${inputAmount.toString()} minAmountOut=${minAmountOut.toString()} fee=${fee}`)

    // const srcContractAddresses = getNetworkConfig(`${srcNetworkId}`)
    const dstContractAddresses = getNetworkConfig(`${dstNetworkId}`)

    const srcUsdc = ERC20__factory.connect(
      networkDetailsRecord[srcNetworkId].USDC.address,
      srcSigner,
    )

    const dstUsdc = ERC20__factory.connect(
      networkDetailsRecord[dstNetworkId].USDC.address,
      dstProvider,
    )

    const srcUsdcAsset = {
      assetType: AssetType.ERC20,
      assetAddress: srcUsdc.address,
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
    } = await predictFees(Number(vm.amount) * 1_000_000)

    const dstUsdcBalance = await dstUsdc.balanceOf(address)
    console.log(
      `before srcUsdcBalance=${srcUsdcBalance.toString()} dstUsdcBalance=${dstUsdcBalance}`,
    )
    let allowance = await srcUsdc.allowance(address, srcRunner.address)
    if (allowance.lt(inputAmount.toString())) {
      console.log('approving input asset transfer...')
      try {
        const approveTx = await srcUsdc.approve(
          srcRunner.address,
          ethers.BigNumber.from(inputAmount.toString()),
          {
            from: address,
          },
        )
        await approveTx.wait()
        console.log('input asset transfer approved')
      } catch (_error) {
        // no-op
      }
    }

    allowance = await srcUsdc.allowance(address, srcRunner.address)
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
            amount: inputAmount.toString(),
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

            dstChainId: {
              42161: StargateChainIds.Arbitrum,
              421613: StargateChainIds.GoerliArbitrum,
            }[dstNetworkId].toString(),
            dstGasForCall: dstGasEstimate.toString(), // gas units (not wei or gwei)
            dstNativeAmount: '0',
            minAmountOut: minAmountOut,
            minAmountOutIsPercent: false,
            continuationWorkflow: dstEncodedWorkflow,
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
        waitForContinuationNonce({
          provider: dstStandardProvider,
          frontDoorAddress: dstRunner.address,
          nonce,
          timeoutMillis: 60_000 * 5,
          loggingArgs: {
            aTokenAddr: dstMockATokenAddr,
            dstBridgeTokenAddr: networkDetailsRecord[dstNetworkId].USDC.address,
            userAddr: address,
          },
        }),
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

  const { ...rest } = props

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
        networkChoices={[
          {
            address: 10,
            symbol: 'Optimism',
            title: 'Optimism',
            icon: {
              url: 'https://app.aave.com/icons/networks/optimism.svg',
            },
          },
          ...(includeDeveloperNetworks
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
              ]
            : []),
        ]}
        layout={layout === 'iframe' ? 'iframe' : 'default'}
      />
    </>
  )
}

function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time))
}
