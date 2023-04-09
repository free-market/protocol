import { Workflow } from '../model'

const wrapEtherWorkflow: Workflow = {
  steps: [
    {
      type: 'add-asset',
      asset: {
        type: 'fungible-token',
        symbol: 'aUSDT',
      },
      amount: '100%',
    },
    {
      type: 'aave-withdrawal',
      inputAsset: {
        asset: {
          type: 'fungible-token',
          symbol: 'aUSDT',
        },

        amount: '100%',
      },
    },
    {
      type: 'uniswap-exact-in',
      inputSymbol: 'USDT',
      outputSymbol: 'WETH',
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
