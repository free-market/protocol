import {
  ActionIds,
  IStargateRouter__factory,
  StargateBridge as StargateBridgeEvm,
  StargateBridgeAction__factory,
  StargateChainIds,
  WorkflowRunner__factory,
} from '@freemarket/evm'
import { Memoize } from 'typescript-memoize'
import { AssetAmount, Chain, StargateBridge } from '../model'
import { AbstractStepHelper } from './AbstractStepHelper'
import { absoluteAmountToString } from './utils'
import rootLogger from 'loglevel'

const log = rootLogger.getLogger('StargateBridgeHelper')

interface StargateFeeArgs {
  srcFrontDoorAddress: string
  dstAddress: string
  dstGasForCall: string
  dstNativeAmount?: string
  payload: string
  dstChainId: number
}

export class StargateBridgeHelper extends AbstractStepHelper<StargateBridge> {
  async getRequiredAssets(stepConfig: StargateBridge): Promise<AssetAmount[]> {
    const dstAddress = await this.getStargateBridgeActionAddress(stepConfig.destinationChain)
    const dstChainId = await this.getDestinationChainId(stepConfig.destinationChain)
    const srcFrontDoorAddress = await this.getFrontDoorAddress()
    if (!stepConfig.destinationGasUnits) {
      throw new Error('stargate automatic destination chain gas estimation not implemented, please provide a value for destinationGasUnits')
    }

    // TODO need transitive closure and then hex encoding of continuation workflow
    const payload = '0x'
    const requiredNative = await this.getStargateRequiredNative({
      srcFrontDoorAddress,
      dstAddress,
      dstGasForCall: absoluteAmountToString(stepConfig.destinationGasUnits),
      dstNativeAmount: absoluteAmountToString(stepConfig.destinationGasUnits),
      payload,
      dstChainId,
    })
    return [
      {
        asset: { type: 'native' },
        amount: requiredNative,
      },
    ]
  }

  @Memoize()
  private async getDestinationChainId(chain: Chain): Promise<number> {
    if (await this.isTestNet()) {
      switch (chain) {
        case 'ethereum':
          return StargateChainIds.GoerliEthereum
        case 'arbitrum':
          return StargateChainIds.GoerliArbitrum
        case 'avalanche':
          return StargateChainIds.GoerliAvalanche
        case 'binance':
          return StargateChainIds.GoerliBinance
        case 'fantom':
          return StargateChainIds.GoerliFantom
        case 'optimism':
          return StargateChainIds.GoerliOptimism
        case 'polygon':
          return StargateChainIds.GoerliPolygon
      }
    } else {
      switch (chain) {
        case 'ethereum':
          return StargateChainIds.Ethereum
        case 'arbitrum':
          return StargateChainIds.Arbitrum
        case 'avalanche':
          return StargateChainIds.Avalanche
        case 'binance':
          return StargateChainIds.Binance
        case 'fantom':
          return StargateChainIds.Fantom
        case 'optimism':
          return StargateChainIds.Optimism
        case 'polygon':
          return StargateChainIds.Polygon
      }
    }
  }

  // TODO probably not needed
  // @Memoize()
  // private async getStargateChainId() {
  //   const chainId = await this.getChainId()
  //   switch (chainId) {
  //     case 1:
  //       return StargateChainIds.Ethereum
  //     case 5:
  //       return StargateChainIds.GoerliEthereum
  //     case 56:
  //       return StargateChainIds.BNB
  //     case 97:
  //       return StargateChainIds.GoerliBNB
  //     case 42161:
  //       return StargateChainIds.Arbitrum
  //     case 421613:
  //       return StargateChainIds.GoerliArbitrum
  //     case 137:
  //       return StargateChainIds.Polygon
  //     case 80001:
  //       return StargateChainIds.GoerliPolygon
  //     case 43114:
  //       return StargateChainIds.Avalanche
  //     case 43113:
  //       return StargateChainIds.GoerliAvalanche
  //     case 10:
  //       return StargateChainIds.Optimism
  //     case 420:
  //       return StargateChainIds.GoerliOptimism
  //     case 250:
  //       return StargateChainIds.Fantom
  //     case 4002:
  //       return StargateChainIds.GoerliFantom
  //     default:
  //       throw new Error('unknown stargate chainId for ' + chainId)
  //   }
  // }

  @Memoize()
  private async getStargateBridgeActionAddress(chain: Chain): Promise<string> {
    const frontDoorAddress = await this.getFrontDoorAddress()
    return StargateBridgeEvm.getStargateBridgeActionAddress(frontDoorAddress, this.standardProvider)
  }

  @Memoize()
  async getStargateRouterAddress(frontDoorAddress: string): Promise<string> {
    const runner = WorkflowRunner__factory.connect(frontDoorAddress, this.ethersProvider)
    const sgBridgeActionAddr = await runner.getActionAddress(ActionIds.stargateBridge)
    log.debug(`StargateBridgeAction address=${sgBridgeActionAddr}`)
    const sgBridgeAction = StargateBridgeAction__factory.connect(sgBridgeActionAddr, this.ethersProvider)
    const sgRouterAddr = await sgBridgeAction.stargateRouterAddress()
    log.debug(`StargateRouter address=${sgRouterAddr}`)
    return sgRouterAddr
  }

  async getStargateRequiredNative(args: StargateFeeArgs): Promise<string> {
    log.debug(`getting stargate required gas=${args.dstGasForCall} airdrop=${args.dstNativeAmount}`)
    const sgRouterAddress = await this.getStargateRouterAddress(args.srcFrontDoorAddress)
    const sgRouter = IStargateRouter__factory.connect(sgRouterAddress, this.ethersProvider)
    const quoteResult = await sgRouter.quoteLayerZeroFee(args.dstChainId, 1, args.dstAddress, args.payload, {
      dstGasForCall: args.dstGasForCall,
      dstNativeAmount: args.dstNativeAmount ?? 0,
      dstNativeAddr: args.dstAddress,
    })
    const stargateFee = quoteResult['0']
    log.debug(`stargate required native=${stargateFee.toString()}`)
    return stargateFee.toString()
  }
}
