import { BlockChain, Asset, AssetType, ChainName, NoAsset, AssetInfo } from './types'

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
      iconUrl: 'https://s3.amazonaws.com/token-icons/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
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
      decimals: 9,
      iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/sol.png',
    },
  },
  // USDCet: {
  //   type: AssetType.Token,
  //   blockChain: BlockChain.Solana,
  //   symbol: 'USDCet',
  //   info: {
  //     fullName: 'USDCet (USDC via wormhole from Ethereum)',
  //     decimals: 18,
  //     iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdc.png',
  //   },
  // },
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
  WETHet: {
    type: AssetType.Token,
    blockChain: BlockChain.Solana,
    symbol: 'WETHet',
    info: {
      fullName: 'WETHet (USDT via wormhole from Ethereum)',
      decimals: 18,
      iconUrl: 'https://s3.amazonaws.com/token-icons/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
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
  mSOL: {
    type: AssetType.Token,
    blockChain: BlockChain.Solana,
    symbol: 'mSOL',
    info: {
      fullName: 'Marinated SOL',
      decimals: 9,
      iconUrl: '/mSOL.png',
    },
  },
  // USDCman: {
  //   type: AssetType.Account,
  //   blockChain: BlockChain.Solana,
  //   symbol: 'USDCmang',
  //   info: {
  //     fullName: 'USDC (mango)',
  //     decimals: 18,
  //     iconUrl: 'https://mango.markets/img/logo_mango.svg',
  //   },
  // },
}

function assetSubType(
  tokenConfig: TokenConfig,
  baseSymbol: string,
  symbol: string,
  assetOverrides: Partial<Asset>,
  assetInfoOverrides: Partial<AssetInfo>
) {
  const baseAsset = tokenConfig[baseSymbol]
  const newSymbol = symbol
  const newAsset: Asset = {
    ...baseAsset,
    ...assetOverrides,
    symbol: newSymbol,
    info: {
      ...baseAsset.info,
      ...assetInfoOverrides,
    },
  }
  tokenConfig[newSymbol] = newAsset
}

assetSubType(SOLANA_TOKENS, 'USDC', 'USDCman', { type: AssetType.Account }, { fullName: 'USDC (mango)' })
assetSubType(SOLANA_TOKENS, 'SOL', 'SOLman', { type: AssetType.Account }, { fullName: 'SOL (mango)' })
assetSubType(SOLANA_TOKENS, 'USDC', 'USDCet', {}, { fullName: 'USDC (Wormhole from Ethereum)' })
// assetSubType(SOLANA_TOKENS, 'USDT', 'et', {}, { fullName: 'USDT (Wormhole from Ethereum)' })

// USDCet: {
//   type: AssetType.Token,
//   blockChain: BlockChain.Solana,
//   symbol: 'USDCet',
//   info: {
//     fullName: 'USDCet (USDC via wormhole from Ethereum)',
//     decimals: 18,
//     iconUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/usdc.png',
//   },
// },

export const TOKENS = {
  Ethereum: ETHEREUM_TOKENS,
  solana: SOLANA_TOKENS,
}

export type EthereumSymbol = keyof typeof ETHEREUM_TOKENS
export type SolanaSymbol = keyof typeof SOLANA_TOKENS | 'USDCman'

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
  if (!asset) {
    throw new Error('unknown ethereum symbol: ' + symbol)
  }
  return asset
}
export function getSolanaAsset(symbol: SolanaSymbol): Asset {
  const asset: Asset = SOLANA_TOKENS[symbol]
  if (!asset) {
    throw new Error('unknown solana symbol: ' + symbol)
  }
  return asset
}

export function getAccountAsset(chainName: ChainName, exchange: string, tokenSymbol: TokenSymbol): Asset {
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
