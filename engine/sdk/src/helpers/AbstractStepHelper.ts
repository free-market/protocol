import { EIP1193Provider } from 'eip1193-provider'
import { IStepHelper } from '../IStepHelper'
import { AssetAmount, Chain } from '../model'
import { Provider, Web3Provider } from '@ethersproject/providers'
import { Memoize } from 'typescript-memoize'
export abstract class AbstractStepHelper<T> implements IStepHelper<T> {
  protected standardProvider: EIP1193Provider
  protected ethersProvider: Provider

  constructor(provider: EIP1193Provider) {
    this.standardProvider = provider
    this.ethersProvider = new Web3Provider(provider)
  }

  protected async getChain(): Promise<Chain> {
    const chainId = await this.getChainId()
    switch (chainId) {
      case 1:
      case 5:
        return 'ethereum'
      case 56:
      case 97:
        return 'binance'
      case 42161:
      case 421613:
        return 'arbitrum'
      case 137:
      case 80001:
        return 'polygon'
      case 43114:
      case 43113:
        return 'avalanche'
      case 10:
      case 420:
        return 'optimism'
      case 250:
      case 4002:
        return 'fantom'
      default:
        throw new Error('unknown chainId: ' + chainId)
    }
  }

  @Memoize()
  protected async isTestNet(): Promise<boolean> {
    const chainId = await this.getChainId()
    switch (chainId) {
      case 1:
      case 56:
      case 42161:
      case 137:
      case 43114:
      case 10:
      case 250:
        return false
      case 5:
      case 97:
      case 421613:
      case 80001:
      case 43113:
      case 420:
      case 4002:
        return true

      default:
        throw new Error('unknown chainId: ' + chainId)
    }
  }

  @Memoize()
  protected async getFrontDoorAddress(): Promise<string> {
    const chain = await this.getChain()
    return this.getFrontDoorAddressForChain(chain)
  }

  @Memoize()
  protected async getFrontDoorAddressForChain(chain: Chain): Promise<string> {
    if (await this.isTestNet()) {
      switch (chain) {
        case 'ethereum':
          return '0xC2924D72d322A30F885cff51A3b8830FF5721bc1'
        case 'arbitrum':
          return '0x768616323F67784595114381b785072FA8C61352'
        default:
          throw new Error(`freemarket is not deployed on ${chain} testnet`)
      }
    } else {
      switch (chain) {
        case 'arbitrum':
          return '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299'
        case 'avalanche':
          return '0xADA59A35A302E3AC5d6d4862BEb51aE473DD3ee7'
        case 'optimism':
          return '0x6Bd12615CDdE14Da29641C9e90b11091AD39B299'
        default:
          throw new Error(`freemarket is not deployed on ${chain} mainnet`)
      }
    }
  }

  @Memoize()
  protected async getChainId(): Promise<number> {
    const network = await this.ethersProvider.getNetwork()
    return network.chainId
  }

  abstract getRequiredAssets(stepConfig: T): Promise<AssetAmount[]>

  getBridgeDestinationChain(stepConfig: T): Chain | null {
    return null
  }

}
