import { ChainId, CHAIN_ID_ETH, CHAIN_ID_ETHEREUM_ROPSTEN, CHAIN_ID_SOLANA } from '@certusone/wormhole-sdk'

import dotenv from 'dotenv'
dotenv.config()

interface WormholeBaseConfig {
  jsonRpcUrl: string
  wormholeChainId: ChainId
  wormholeCoreBridgeAddress: string
  wormholeTokenBridgeAddress: string
}

interface EtheriumConfig extends WormholeBaseConfig {
  wethAddress: string
}

interface SolanaConfig extends WormholeBaseConfig {}

const etheriumGoerliConfig: EtheriumConfig = {
  jsonRpcUrl: `wss://eth-goerli.alchemyapi.io/v2/${process.env['ALCHEMY_URL_KEY_TEST']}`,
  wethAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  wormholeChainId: CHAIN_ID_ETH,
  wormholeCoreBridgeAddress: '0x706abc4E45D419950511e474C7B9Ed348A4a716c',
  wormholeTokenBridgeAddress: '0xF890982f9310df57d00f659cf4fd87e65adEd8d7',
}

const etheriumRopstenConfig: EtheriumConfig = {
  jsonRpcUrl: `wss://eth-ropsten.alchemyapi.io/v2/${process.env['ALCHEMY_URL_KEY_TEST']}`,
  wethAddress: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  wormholeChainId: CHAIN_ID_ETHEREUM_ROPSTEN,
  wormholeCoreBridgeAddress: '0x210c5F5e2AF958B4defFe715Dc621b7a3BA888c5',
  wormholeTokenBridgeAddress: '0xF174F9A837536C449321df1Ca093Bb96948D5386',
}

const etheriumMainnetConfig: EtheriumConfig = {
  jsonRpcUrl: `wss://eth-mainnet.alchemyapi.io/v2/${process.env['ALCHEMY_URL_KEY_MAIN']}`,
  wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  wormholeChainId: CHAIN_ID_ETH,
  wormholeCoreBridgeAddress: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
  wormholeTokenBridgeAddress: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
}

const etheriumGanacheConfig: EtheriumConfig = {
  jsonRpcUrl: `http://127.0.0.1:8545`,
  wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  wormholeChainId: CHAIN_ID_ETH,
  wormholeCoreBridgeAddress: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
  wormholeTokenBridgeAddress: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
}

const solanaDevnetConfig: SolanaConfig = {
  jsonRpcUrl: 'https://api.devnet.solana.com',
  wormholeChainId: CHAIN_ID_SOLANA,
  wormholeCoreBridgeAddress: '3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5',
  wormholeTokenBridgeAddress: 'DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe',
}

// https://api.mainnet-beta.solana.com - Solana-hosted api node cluster, backed by a load balancer; rate-limited
// https://solana-api.projectserum.com - Project Serum-hosted api node
const solanaMainnetConfig: SolanaConfig = {
  jsonRpcUrl: 'https://api.mainnet-beta.solana.com',
  wormholeChainId: CHAIN_ID_SOLANA,
  wormholeCoreBridgeAddress: 'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth',
  wormholeTokenBridgeAddress: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb',
}

export const ethConfig = etheriumGoerliConfig
export const solConfig = solanaDevnetConfig

export const ETH_TEST_WALLET_PRIVATE_KEY = '18eb753b59d97a6ab5e2c4f7f35f68303508ef9e652b7a14030a80f96e20c02a'
// const ETH_TEST_WALLET_ADDRESS = '0xeCb31e9CEd20959C7A87D5B5f3D1BC5419cD1f90'
export const SOLANA_PRIVATE_KEY =
  'GR4HndXZHhi1sV77G7yupFgvNbxjXzgQ6R18diuXmYkDciuKZ9Xvodw9PfrtG8Nb261bPsRuvUt9JECpMK7TMR6'
export const WORMHOLE_RPC_HOSTS = ['https://wormhole-v2-testnet-api.certus.one']
