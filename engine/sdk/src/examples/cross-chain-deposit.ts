import type { Workflow } from '../model'

const crossChainDeposit: Workflow = {
  steps: [
    {
      type: 'add-asset',
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      amount: '1000000',
    },
    {
      type: 'stargate-bridge',
      destinationChain: 'arbitrum',
      destinationUserAddress: '0xabc123',
      maxSlippagePercent: 0.05,
      inputAsset: {
        asset: {
          type: 'fungible-token',
          symbol: 'USDC',
        },
        amount: 1000000,
      },
    },
    {
      type: 'aave-supply',
      stepId: 'aave-supply',
      inputAsset: {
        asset: {
          type: 'fungible-token',
          symbol: 'USDC',
        },
        amount: '100%',
      },
    },
  ],
}

// eslint-disable-next-line no-console
console.log(JSON.stringify(crossChainDeposit))
