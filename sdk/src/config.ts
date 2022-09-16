import { TokenAsset, Network, WorkflowStepInfo, BlockChain, ChainNames, Asset, AssetType } from './api'
import { ChainName } from './WorkflowBuilder'
export const isTestNet = true

export const ADDRESSES = {
  test: {
    ethereum: {
      eth: '', // use empty string to represent the native coin
      wbtc: 'wbtcAddrOnTestNet',
      weth: 'wethAddrOnTestnet',
      usdc: 'usdcOnTestNet',
      usdt: 'usdtOnTestNet',
      dai: 'daiOnTestNet',
    },
    solanan: {
      sol: '', // use empty string to denote the native coin
      usdc: 'usdcOnTestNet',
      usdcet: 'usdcetOnTestNet',
    },
  },

  main: {
    ethereum: {
      eth: '', // use empty string to represent the native coin
      wbtc: 'wbtcAddrOnMainNet',
      weth: 'wethAddrOnMainet',
      usdc: 'usdcOnMainNet',
      usdt: 'usdtOnMainNet',
      dai: 'daiOnMainNet',
    },
    solanan: {
      sol: '', // use empty string to denote the native coin
      usdc: 'usdcOnMainNet',
      usdcet: 'usdcetOnMainNet',
    },
  },
}

const activeAddresses = isTestNet ? ADDRESSES.test : ADDRESSES.main

type NetworkConfig = { [n: string]: Network }
const NETWORKS: NetworkConfig = {
  ethereum: {
    chain: 'ethereum',
    type: isTestNet ? 'goerli' : 'mainnet',
  },
  solana: {
    chain: 'solana',
    type: isTestNet ? 'devnet' : 'mainnet',
  },
}

export type TokenConfig = { [symbol: string]: Asset }

export const ETHEREUM_TOKENS = {
  ETH: {
    type: AssetType.token,
    fullName: 'Ethereum',
    symbol: 'ETH',
    network: NETWORKS.ethereum,
    blockChain: BlockChain.ethereum,
    address: activeAddresses.ethereum.eth,
    decimals: 18,
    displayDecimals: 18,
  },
  WETH: {
    type: AssetType.token,
    fullName: 'Wrapped Ethereum',
    symbol: 'WETH',
    network: NETWORKS.ethereum,
    blockChain: BlockChain.ethereum,
    address: activeAddresses.ethereum.weth,
    decimals: 18,
    displayDecimals: 18,
  },
  USDT: {
    type: AssetType.token,
    fullName: 'USD Tether',
    symbol: 'USDT',
    network: NETWORKS.ethereum,
    blockChain: BlockChain.ethereum,
    address: activeAddresses.ethereum.usdt,
    decimals: 18,
    displayDecimals: 18,
  },
  USDC: {
    type: AssetType.token,
    fullName: 'USDC (ethereum)',
    symbol: 'USDC',
    network: NETWORKS.ethereum,
    blockChain: BlockChain.ethereum,
    address: activeAddresses.ethereum.usdc,
    decimals: 18,
    displayDecimals: 18,
  },
  DAI: {
    type: AssetType.token,
    fullName: 'Dai',
    symbol: 'DAI',
    network: NETWORKS.ethereum,
    blockChain: BlockChain.ethereum,
    address: activeAddresses.ethereum.dai,
    decimals: 18,
    displayDecimals: 18,
  },
  WBTC: {
    type: AssetType.token,
    fullName: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    network: NETWORKS.ethereum,
    blockChain: BlockChain.ethereum,
    address: activeAddresses.ethereum.dai,
    decimals: 18,
    displayDecimals: 18,
  },
}

export const SOLANA_TOKENS = {
  SOL: {
    type: AssetType.token,
    fullName: 'Sol',
    symbol: 'SOL',
    network: NETWORKS.solana,
    blockChain: BlockChain.solana,
    address: activeAddresses.solanan.sol,
    decimals: 18,
    displayDecimals: 18,
  },
  USDCet: {
    type: AssetType.token,
    fullName: 'USDCet (wormhole from ethereum)',
    symbol: 'USDCet',
    network: NETWORKS.solana,
    blockChain: BlockChain.solana,
    address: activeAddresses.solanan.usdcet,
    decimals: 18,
    displayDecimals: 18,
  },
  USDC: {
    type: AssetType.token,
    fullName: 'USDC (solana)',
    symbol: 'USDC',
    network: NETWORKS.solana,
    blockChain: BlockChain.solana,
    address: activeAddresses.solanan.sol,
    decimals: 18,
    displayDecimals: 18,
  },
}

export const TOKENS = {
  ethereum: ETHEREUM_TOKENS,
  solana: SOLANA_TOKENS,
}

export type EthereumSymbol = keyof typeof ETHEREUM_TOKENS
export type SolanaSymbol = keyof typeof SOLANA_TOKENS
export type TokenSymbol = EthereumSymbol | SolanaSymbol

export function getTokenAsset(chain: ChainName, tokenSymbol: TokenSymbol) {
  switch (chain) {
    case 'ethereum':
      return getEthereumAsset(tokenSymbol as EthereumSymbol)
    case 'solana':
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

type WorkflowStepInfos = { [stepId: string]: WorkflowStepInfo }

export const STEP_INFOS: WorkflowStepInfos = {
  'weth.wrap': {
    stepId: 'weth.wrap',
    name: 'Wrap Etherium',
    networks: [NETWORKS.ethereum],
    gasEstimate: BigInt(200_000),
    exchangeFee: 0.0,
    description: 'Convert native ETH to WETH tokens.',
  },
  'weth.unwrap': {
    stepId: 'weth.unwrap',
    name: 'Unwrap Etherium',
    networks: [NETWORKS.ethereum],
    gasEstimate: BigInt(200_000),
    exchangeFee: 0.0,
    description: 'Convert WETH tokens to native ETH.',
  },
  'curve.3curve.swap': {
    stepId: 'curve.3pool.swap',
    name: 'Curve 3 Pool',
    networks: [NETWORKS.ethereum],
    gasEstimate: BigInt(400_000),
    exchangeFee: 0.01,
    description: 'Three Pool at Curve Finance allows swapping between stable coins with very low fees.',
  },
  'curve.tricrypto.swap': {
    stepId: 'curve.tricrypto.swap',
    name: 'Curve TriCrypto',
    networks: [NETWORKS.ethereum],
    gasEstimate: BigInt(400_000),
    exchangeFee: 0.01,
    description: 'TriCrypto does swapping between the 3 most popular tokens on Etherium: WBTC, WETH and USDT',
  },
  'wormhole.transfer': {
    stepId: 'wormhole.transfer',
    name: 'Wormhole Token Portal',
    networks: [NETWORKS.ethereum, NETWORKS.solana],
    gasEstimate: BigInt(400_000),
    exchangeFee: 0.01,
    description: 'Enables transfering tokens to different blockchains.',
  },
  'saber.swap': {
    stepId: 'saber.swap',
    name: 'Saber AMM',
    networks: [NETWORKS.solana],
    gasEstimate: BigInt(400_000),
    exchangeFee: 0.01,
    description: 'Automated market maker for swapping SPL Tokens.',
  },
}

export const WORMHOLE_TRANSFERS = {
  ethereum: {
    solana: {
      USDC: 'USDCet',
    },
  },
  solana: {
    ethereum: {
      USDCet: 'USDC',
    },
  },
}

export function getWormholeTargetSymbol(sourceChain: ChainName, sourceToken: TokenSymbol, targetChain: ChainName): TokenSymbol {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = WORMHOLE_TRANSFERS[sourceChain] as any
  if (!from) {
    throw new Error(`wormhole unknown source chain ${sourceChain}`)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const to = from[targetChain] as any
  if (!to) {
    throw new Error(`wormhole unknown target chain ${targetChain}`)
  }
  const targetSymbol = to[sourceToken] as string | undefined
  if (!targetSymbol) {
    throw new Error(`wormhole unknown output token, sourceChain=${sourceChain} sourceToken=${sourceToken} targetChain=${targetChain}`)
  }
  return targetSymbol
}
