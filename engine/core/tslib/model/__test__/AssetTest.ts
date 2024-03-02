import test from 'ava'
import type { Asset} from '../Asset';
import { assetSchema } from '../Asset'

test('validates an asset', async t => {
  const asset: Asset = {
    type: 'fungible-token',
    symbol: 'USDC',
    name: 'USD Coin',
    iconUrl: 'https://metadata.fmprotocol.com/icons/USDC.png',
    chains: {
      ethereum: {
        type: 'erc20',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
      },
      avalanche: {
        type: 'erc20',
        address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        decimals: 6,
      },
      polygon: {
        type: 'erc20',
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        decimals: 6,
      },
      arbitrum: {
        type: 'erc20',
        address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        decimals: 6,
      },
      optimism: {
        type: 'erc20',
        address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
        decimals: 6,
      },
      fantom: {
        type: 'erc20',
        address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
        decimals: 6,
      },
    },
  }

  assetSchema.parse(asset)

  const singleChainAsset: Asset = {
    type: 'fungible-token',
    symbol: 'ULX',
    name: 'Ultron',
    iconUrl: 'https://metadata.fmprotocol.com/icons/ULX.png',
    chains: {
      avalanche: {
        type: 'erc20',
        address: '0xC685E8EDDC9f078666794CbfcD8D8351bac404eF',
        decimals: 6,
      },
    },
  }
  assetSchema.parse(singleChainAsset)

  // validation should fail with no symbol
  const badAsset: any = { ...singleChainAsset }
  delete badAsset.symbol
  t.throws(() => assetSchema.parse(badAsset))

  t.pass()
})
