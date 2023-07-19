import type { Chain, NativeAsset } from '@freemarket/core'

const ETH_ICON_URL = 'https://metadata.fmprotocol.com/icons/native/eth.png'

export const NATIVE_ASSETS: Record<Chain, NativeAsset> = {
  ethereum: {
    type: 'native',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: ETH_ICON_URL,
    chain: 'ethereum',
  },
  optimism: {
    type: 'native',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: ETH_ICON_URL,
    chain: 'optimism',
  },
  arbitrum: {
    type: 'native',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: ETH_ICON_URL,
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
  hardhat: {
    type: 'native',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: ETH_ICON_URL,
    chain: 'ethereum',
  },
  local: {
    type: 'native',
    name: 'Ethereum',
    symbol: 'ETH',
    iconUrl: ETH_ICON_URL,
    chain: 'ethereum',
  },
}
