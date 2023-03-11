import type { Workflow } from '../model'

// start with any erc20 supported by Uniswap
const crossChainDepositV2: Workflow = {
  steps: [
    {
      type: 'add-asset',
      asset: {
        type: 'fungible-token',
        symbol: 'LINK',
      },
      amount: '1000000',
    },
    {
      type: 'asset-balance-branch',
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      comparison: 'greater-than',
      amount: 0,
      ifYes: 'check-chain',
    },
    {
      type: 'uniswap-exact-in',
      inputAsset: 'LINK',
      outputAsset: 'USDC',
      amountIn: '100%',
      maxSlippagePercent: 0.03,
    },
    {
      stepId: 'check-chain',
      type: 'chain-branch',
      currentChain: 'arbitrum',
      ifYes: 'aave-supply',
    },
    {
      type: 'stargate-bridge',
      destinationChain: 'arbitrum',
      destinationUserAddress: '0xabc123',
      maxSlippagePercent: 0.05,
      destinationGasUnits: 1000000,
      inputAsset: {
        asset: {
          type: 'fungible-token',
          symbol: 'USDC',
        },
        amount: '100%',
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
console.log(JSON.stringify(crossChainDepositV2))
