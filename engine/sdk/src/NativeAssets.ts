import type { Chain } from './model'
import type { NativeAsset } from './model/Asset'

export const NATIVE_ASSETS: Record<Chain, NativeAsset> = {
  ethereum: {
    type: 'native',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: 'https://metadata.fmprotocol.com/icons/native/eth.png',
    chain: 'ethereum',
  },
  optimism: {
    type: 'native',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: 'https://metadata.fmprotocol.com/icons/native/eth.png',
    chain: 'optimism',
  },
  arbitrum: {
    type: 'native',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: 'https://metadata.fmprotocol.com/icons/native/eth.png',
    chain: 'arbitrum',
  },
  polygon: {
    type: 'native',
    name: 'Matic',
    symbol: 'MATIC',
    iconUrl: 'https://metadata.fmprotocol.com/icons/native/matic.png',
    chain: 'polygon',
  },
  binance: {
    type: 'native',
    name: 'BNB',
    symbol: 'BNB',
    iconUrl: 'https://metadata.fmprotocol.com/icons/native/bnb.png',
    chain: 'binance',
  },
  avalanche: {
    type: 'native',
    name: 'AVAX',
    symbol: 'AVAX',
    iconUrl: 'https://metadata.fmprotocol.com/icons/native/avax.png',
    chain: 'avalanche',
  },
  fantom: {
    type: 'native',
    name: 'FTM',
    symbol: 'FTM',
    iconUrl: 'https://metadata.fmprotocol.com/icons/native/ftm.png',
    chain: 'fantom',
  },
}
