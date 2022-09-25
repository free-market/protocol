interface SolanaConfig {
  USDC: string
  USDCet: string
}

type SolanaConfgObj = { [networkName: string]: SolanaConfig }

const ADDRESSES: SolanaConfgObj = {
  mainnet: {
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDCet: 'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM',
  },
  devnet: {
    USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    USDCet: '***unknown***',
  },
}

export type SolanaNetworkName = 'mainnet' | 'devnet'

export function getSolanaConfig(network: SolanaNetworkName): SolanaConfig {
  // default testnet to goerli
  const x: SolanaConfig = ADDRESSES[network]
  return x
}
