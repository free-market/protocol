import { expect } from 'chai'
import hardhat from 'hardhat'
import { shouldRunE2e } from './utils'
import { Workflow, WorkflowInstance } from '@freemarket/client-sdk'

const workflow: Workflow = {
  steps: [
    {
      stepId: 'uniswap',
      nextStepId: 'stargate',
      type: 'uniswap-exact-in',
      inputAsset: {
        type: 'native',
      },
      inputAssetSource: 'caller',
      inputAmount: '1',
      outputAsset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      slippageTolerance: '2',
    },
    {
      stepId: 'stargate',
      nextStepId: 'uniswap-1',
      type: 'stargate-bridge',
      destinationChain: 'arbitrum',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      inputAmount: '100%',
      inputSource: 'workflow',
      maxSlippagePercent: '2',
      destinationGasUnits: '1000000',
      remittanceSource: 'caller',
    },
    {
      stepId: 'uniswap-1',
      nextStepId: '__end__',
      type: 'uniswap-exact-in',
      inputAsset: {
        type: 'fungible-token',
        symbol: 'USDC',
      },
      inputAssetSource: 'workflow',
      inputAmount: '100%',
      outputAsset: {
        type: 'fungible-token',
        symbol: 'WETH',
      },
      slippageTolerance: '2',
    },
  ],
  parameters: [],
  startStepId: 'uniswap',
  fungibleTokens: [
    {
      type: 'fungible-token',
      symbol: 'USDC',
      name: 'USD Coin',
      iconUrl: 'https://etherscan.io/token/images/centre-usdc_28.png',
      chains: {
        ethereum: {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          usd: 1,
          decimals: 6,
        },
        binance: {
          address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
          usd: 0.9994,
          decimals: 18,
        },
        avalanche: {
          address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
          usd: 0.9999,
          decimals: 6,
        },
        polygon: {
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          usd: 0.9994,
          decimals: 6,
        },
        arbitrum: {
          address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          usd: 1,
          decimals: 6,
        },
        optimism: {
          address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
          usd: 1.001,
          decimals: 6,
        },
        fantom: {
          address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
          usd: 1.001,
          decimals: 6,
        },
      },
    },
  ],
}

if (shouldRunE2e()) {
  describe('StarGate', async () => {
    it('should work', async () => {
      const instance = new WorkflowInstance(workflow)
      const sg = instance.getStepHelper('arbitrum', 'stargate-bridge')
      if (sg) {
        //   sg.encodeContinuation()
        console.log('got sg')
      }
      console.log('running e2e test')
    })
  })
}
