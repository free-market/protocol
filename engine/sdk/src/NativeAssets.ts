import type { NativeAsset } from './model/Asset'

export const NATIVE_ASSET: NativeAsset = {
  type: 'native',
  name: {
    ethereum: 'ETH',
    optimism: 'ETH',
    arbitrum: 'ETH',
    polygon: 'MATIC',
    binance: 'BNB',
    avalanche: 'AVAX',
    fantom: 'FTM',
  },
}
