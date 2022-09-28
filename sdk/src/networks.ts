import { ChainName } from './types'

interface NetworkType {
  chain: ChainName
  type: string
}



export interface EthereumNetwork extends NetworkType {
  chain: 'Ethereum'
  type: 'mainnet' | 'goerli'
}

export interface SolanaNetwork extends NetworkType {
  chain: 'Solana'
  type: 'mainnet' | 'devnet'
}

export type Network = EthereumNetwork | SolanaNetwork
