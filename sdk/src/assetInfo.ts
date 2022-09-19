import { WorkflowStepInfo, BlockChain, Asset, AssetType, ChainName } from './types'

export type TokenConfig = { [symbol: string]: Asset }

export const ETHEREUM_TOKENS = {
  ETH: {
    type: AssetType.token,
    blockChain: BlockChain.Ethereum,
    symbol: 'ETH',
    info: {
      fullName: 'Ethereum',
      decimals: 18,
    },
  },
  WETH: {
    type: AssetType.token,
    blockChain: BlockChain.Ethereum,
    symbol: 'WETH',
    info: {
      fullName: 'Wrapped Ethereum',
      decimals: 18,
    },
  },
  USDT: {
    type: AssetType.token,
    blockChain: BlockChain.Ethereum,
    symbol: 'USDT',
    info: {
      fullName: 'Tether USD',
      decimals: 18,
    },
  },
  USDC: {
    type: AssetType.token,
    blockChain: BlockChain.Ethereum,
    symbol: 'USDC',
    info: {
      fullName: 'USDC (Ethereum)',
      decimals: 18,
    },
  },
  DAI: {
    type: AssetType.token,
    blockChain: BlockChain.Ethereum,
    symbol: 'DAI',
    info: {
      fullName: 'Dai',
      decimals: 18,
    },
  },
  WBTC: {
    type: AssetType.token,
    blockChain: BlockChain.Ethereum,
    symbol: 'WBTC',
    info: {
      fullName: 'Wrapped Bitcoin',
      decimals: 18,
    },
  },
}

export const SOLANA_TOKENS: TokenConfig = {
  SOL: {
    type: AssetType.token,
    blockChain: BlockChain.Solana,
    symbol: 'SOL',
    info: {
      fullName: 'Sol',
      decimals: 18,
    },
  },
  USDCet: {
    type: AssetType.token,
    blockChain: BlockChain.Solana,
    symbol: 'USDCet',
    info: {
      fullName: 'USDCet (USDC via wormhole from Ethereum)',
      decimals: 18,
    },
  },
  USDTet: {
    type: AssetType.token,
    blockChain: BlockChain.Solana,
    symbol: 'USDTet',
    info: {
      fullName: 'USDTet (USDT via wormhole from Ethereum)',
      decimals: 18,
    },
  },
  USDC: {
    type: AssetType.token,
    blockChain: BlockChain.Solana,
    symbol: 'USDC',
    info: {
      fullName: 'USDC (solana)',
      decimals: 18,
    },
  },
}

export const TOKENS = {
  Ethereum: ETHEREUM_TOKENS,
  solana: SOLANA_TOKENS,
}

export type EthereumSymbol = keyof typeof ETHEREUM_TOKENS
export type SolanaSymbol = keyof typeof SOLANA_TOKENS
export type TokenSymbol = EthereumSymbol | SolanaSymbol

export function getTokenAsset(chainName: ChainName, tokenSymbol: TokenSymbol) {
  switch (chainName) {
    case 'Ethereum':
      return getEthereumAsset(tokenSymbol as EthereumSymbol)
    case 'Solana':
      return getSolanaAsset(tokenSymbol as SolanaSymbol)
  }
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
    type: AssetType.account,
    symbol: `${exchange}.${tokenSymbol}`,
    blockChain: BlockChain[chainName],
    info: {
      ...tokenAsset.info,
      fullName: `${tokenAsset.info.fullName} @ ${exchange}`,
    },
  }
}
