import { EvmNetworkName, getTestWallet, Weth__factory } from '@fmp/evm'
import { getEthConfig } from '@fmp/sdk'
import * as ethers from 'ethers'
const FMP_ENV = (process.env['FMP_ENV'] || 'testnet') as EvmNetworkName
const JSON_RPC_URL = process.env['FMP_JSON_RPC_URL'] || 'http://127.0.0.1:8545'
const ethConfig = getEthConfig(FMP_ENV)

// we either need to call getTestWallet for ganache based, or we need a path to JSON file containing an evm keypair

const TEST_WALLET_INDEX = 1

function getBalances() {
  const provider = new ethers.providers.WebSocketProvider(JSON_RPC_URL)
  const wallet = getTestWallet(TEST_WALLET_INDEX, provider)
}
