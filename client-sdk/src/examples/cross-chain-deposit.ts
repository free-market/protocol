import type { Workflow } from '../model'

export const crossChainAaveDeposit: Workflow = {
  parameters: [
    {
      name: 'targetChainUserAddress',
      type: 'address',
      label: 'Target Chain User Address',
    },
    {
      name: 'inputAmount',
      type: 'amount',
      label: 'USDC Input Amount',
    },
  ],
  steps: [
    {
      type: 'add-asset',
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      amount: '{{ inputAmount }}',
    },
    {
      type: 'add-asset',
      asset: {
        type: 'native',
      },
      amount: '{{ remittances.stargate.amount }}',
    },
    {
      stepId: 'stargate',
      type: 'stargate-bridge',
      destinationChain: 'arbitrum',
      destinationUserAddress: '{{ targetChainUserAddress }}',
      maxSlippagePercent: 0.05,
      destinationGasUnits: 1000000,
      inputAsset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      inputAmount: '100%',
    },
    {
      type: 'aave-supply',
      stepId: 'aave-supply',
      asset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      amount: '100%',
    },
  ],
}
