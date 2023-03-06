import { Workflow } from '../model'

const crossChainDeposit: Workflow = {
  parameters: [
    {
      name: "inputAsset",
      type: 'asset-ref',
      description: "The type of asset being deposited"
    },
    {
      name: "assetAmount",
      type: "amount",
    }
  ],

  steps: [
    {
      stepId: 'addAsset',
      type: 'add-asset',
      amount: "{{ inputAmount }}",
      asset: "{{ inputAsset }}"
      
    },
    {
      type: 'asset-balance-branch',
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      comparison: 'greater-than',
      amount: 0,
      ifYes: 'stargateBridge',
    },
    {
      type: 'uniswap-exact-in',
      amountIn: '100%',
      inputAsset: '{{ inputAsset }}',
      outputAsset: 'USDC',
      maxSlippagePercent: 0.04,
    },
    {
      stepId: 'stargateBridge',
      type: 'stargate-bridge',
      destinationChain: 'arbitrum',
      destinationUserAddress: '0x0000001234',
      maxSlippagePercent: 0.03,
      inputAsset: {
        asset: { type: 'fungible-token', symbol: 'USDC' },
        amount: '100%',
      },
    },
    {
      type: 'aave-supply',
      inputAsset: {
        asset: {
          type: 'fungible-token',
          symbol: 'USDC',
        },
        amount: '100%',
      },
      nextStepId: "__end__"
    },
  ],
}

// eslint-disable-next-line no-console
console.log(JSON.stringify(crossChainDeposit))
