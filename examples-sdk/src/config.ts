import dotenv from 'dotenv'

dotenv.config()

export const ethJsonRpcUrl = process.env['ETHEREUM_JSONRPC_URL']!
export const solJsonRpcUrl = process.env['SOLANA_JSONRPC_URL']!
export const ETHEREUM_WALLET_PRIVATE_KEY = process.env['ETHEREUM_WALLET_PRIVATE_KEY']!
export const SOLANA_WALLET_PRIVATE_KEY = process.env['SOLANA_WALLET_PRIVATE_KEY']!
