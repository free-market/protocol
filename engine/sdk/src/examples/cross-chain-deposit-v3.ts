import type { Workflow } from '../model'

// starting with native instead of an fungible token
const crossChainDepositV3: Workflow = {
  steps: [
    {
      type: 'add-asset',
      asset: {
        type: 'native',
      },
      amount: '1000000000000000000', // 1 eth
    },
    {
      type: 'asset-balance-branch',
      asset: {
        type: 'native',
      },
      comparison: 'greater-than',
      amount: 0,
      ifYes: 'check-chain',
    },
    {
      type: 'wrap-native',
      amount: '100%',
    },
    {
      type: 'asset-balance-branch',
      stepId: 'check-usdc',
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
console.log(JSON.stringify(crossChainDepositV3))
