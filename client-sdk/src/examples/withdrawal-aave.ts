import { Workflow } from '../model'

const wrapEtherWorkflow: Workflow = {
  steps: [
    {
      type: 'aave-withdrawal',
      asset: {
        type: 'fungible-token',
        symbol: 'aUSDT',
      },
      source: 'caller',

      amount: '100%',
    },
    {
      type: 'uniswap-exact-in',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'USDT',
      },
      inputAssetSource: 'caller',
      outputAsset: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
      inputAmount: '100',
    },
  ],
  fungibleTokens: [
    {
      type: 'fungible-token',
      symbol: 'aUSDT',
      chains: {
        ethereum: {
          address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
          decimals: 6,
        },
      },
    },
  ],
}
