import { BlockChain, Asset, AssetType, ChainName, NoAsset } from './types'

export type TokenConfig = { [symbol: string]: Asset }

export const ETHEREUM_TOKENS = {
  ETH: {
    type: AssetType.Token,
    blockChain: BlockChain.Ethereum,
    symbol: 'ETH',
    info: {
      fullName: 'Ether',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
    },
  },
  WETH: {
    type: AssetType.Token,
    blockChain: BlockChain.Ethereum,
    symbol: 'WETH',
    info: {
      fullName: 'Wrapped Ether',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png',
    },
  },
  USDT: {
    type: AssetType.Token,
    blockChain: BlockChain.Ethereum,
    symbol: 'USDT',
    info: {
      fullName: 'Tether USD',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdt.png',
    },
  },
  USDC: {
    type: AssetType.Token,
    blockChain: BlockChain.Ethereum,
    symbol: 'USDC',
    info: {
      fullName: 'USDC (Ethereum)',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdc.png',
    },
  },
  DAI: {
    type: AssetType.Token,
    blockChain: BlockChain.Ethereum,
    symbol: 'DAI',
    info: {
      fullName: 'Dai',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/dai.png',
    },
  },
  WBTC: {
    type: AssetType.Token,
    blockChain: BlockChain.Ethereum,
    symbol: 'WBTC',
    info: {
      fullName: 'Wrapped Bitcoin',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/wbtc.png',
    },
  },
}

export const SOLANA_TOKENS: TokenConfig = {
  SOL: {
    type: AssetType.Token,
    blockChain: BlockChain.Solana,
    symbol: 'SOL',
    info: {
      fullName: 'Sol',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/sol.png',
    },
  },
  USDCet: {
    type: AssetType.Token,
    blockChain: BlockChain.Solana,
    symbol: 'USDCet',
    info: {
      fullName: 'USDCet (USDC via wormhole from Ethereum)',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdc.png',
    },
  },
  USDTet: {
    type: AssetType.Token,
    blockChain: BlockChain.Solana,
    symbol: 'USDTet',
    info: {
      fullName: 'USDTet (USDT via wormhole from Ethereum)',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdt.png',
    },
  },
  USDC: {
    type: AssetType.Token,
    blockChain: BlockChain.Solana,
    symbol: 'USDC',
    info: {
      fullName: 'USDC (solana)',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdc.png',
    },
  },
  USDT: {
    type: AssetType.Token,
    blockChain: BlockChain.Solana,
    symbol: 'USDT',
    info: {
      fullName: 'USDT (solana)',
      decimals: 18,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdt.png',
    },
  },
}

export const TOKENS = {
  Ethereum: ETHEREUM_TOKENS,
  solana: SOLANA_TOKENS,
}

export type EthereumSymbol = keyof typeof ETHEREUM_TOKENS
export type SolanaSymbol = keyof typeof SOLANA_TOKENS

/** Symbols of supported tokens */
export type TokenSymbol = EthereumSymbol | SolanaSymbol

export function getTokenAsset(chainName: ChainName, tokenSymbol: TokenSymbol) {
  switch (chainName) {
    case 'Ethereum':
      return getEthereumAsset(tokenSymbol as EthereumSymbol)
    case 'Solana':
      return getSolanaAsset(tokenSymbol as SolanaSymbol)
  }
  return NoAsset
}

export function getEthereumAsset(symbol: EthereumSymbol): Asset {
  const asset: Asset = ETHEREUM_TOKENS[symbol]
  return asset
}
export function getSolanaAsset(symbol: SolanaSymbol): Asset {
  const asset: Asset = SOLANA_TOKENS[symbol]
  return asset
}

export function getAccountAsset(chainName: ChainName, exchange: string, tokenSymbol: TokenSymbol) {
  const tokenAsset = getTokenAsset(chainName, tokenSymbol)
  return {
    type: AssetType.Account,
    symbol: `${exchange}.${tokenSymbol}`,
    blockChain: BlockChain[chainName],
    info: {
      ...tokenAsset.info,
      fullName: `${tokenAsset.info.fullName} @ ${exchange}`,
    },
  }
}
