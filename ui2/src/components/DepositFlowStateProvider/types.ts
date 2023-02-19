import BN from 'bn.js'
import * as ethers from 'ethers'
import { EvmWorkflow } from '@fmp/evm/build/tslib/EvmWorkflow'
export type Action =
  | { name: 'DepositButtonClicked' }
  | { name: 'FormLoaded' }
  | { name: 'BackButtonClicked' }
  | { name: 'EditingStarted' }
  | { name: 'EditingStopped' }
  | {
      name: 'SelectorRecentlyOpened'
      selector: {
        name: string
        highlightedResult?: { address: string | number }
      }
    }
  | {
      name: 'SelectorOpened'
      selector: { name: string }
    }
  | { name: 'SelectorRecentlyClosed'; selector: { name: string } }
  | { name: 'SelectorClosed'; selector: { name: string } }
  | {
      name: 'SelectorInputChanged'
    }
  | {
      name: 'SelectorInputRecentlyChanged'
      selector: {
        name: string
        highlightedResult?: { address: string | number }
      }
      value: string
    }
  | { name: 'SelectorShadowClicked' }
  | {
      name: 'SelectorResultHoverStarted'
      selector: { name: string }
      result: { address: string | number }
    }
  | {
      name: 'HighlightMoved'
      selector: {
        name: string
        highlightedResult: { address: string | number }
      }
    }
  | {
      name: 'SelectorResultClicked'
      selector: { name: string }
      result: { address: string | number }
    }
  | { name: 'AmountChanged'; value?: string }
  | { name: 'WorkflowSubmissionStarted' }
  | { name: 'WorkflowSubmissionFailed' }
  | { name: 'WorkflowSubmissionFinished'; transaction: { hash: string } }
  | { name: 'WorkflowStarted'; value?: string }
  | { name: 'WorkflowCompleted'; transaction: { hash: string } }
  | { name: 'FeePredictionStarted'; amount: string }
  | {
      name: 'FeePredicted'
      amount: string
      fee: {
        slippage: string
        destination: {
          gasPrice: string
        }
        source: {
          gasPrice: string
        }
        protocol: {
          usd: string
        }
        lowestPossibleAmount: string
      }
      workflowDetails?: {
        dstWorkflow: EvmWorkflow
        dstEncodedWorkflow: string
        nonce: string
        dstGasEstimate: number
        inputAmount: BN
        minAmountOut: string
        srcGasCost: ethers.ethers.BigNumber
        dstGasCost: ethers.ethers.BigNumber
        stargateRequiredNative: string
        srcUsdcBalance: ethers.ethers.BigNumber
      }
    }
  | { name: 'UnavailableFeePredicted' }

export type WalletState =
  | 'ready'
  | 'insufficient-balance'
  | 'unconnected'
  | 'network-mismatch'

export type EditingMode = {
  name: 'token' | 'chain'
  recently?: 'opened' | 'closed'
}

export type State = {
  loadingAllowed: boolean
  flowStep:
    | 'closed'
    | 'loading'
    | 'open'
    | 'submitting'
    | 'submitted'
    | 'started'
    | 'complete'
  formEditingMode?: EditingMode
  amountEditing: boolean
  amount?: string
  tokenSearchValue: string
  highlightedSelectorResult?: { address: string | number }
  selectedChain: { address: number }
  selectedToken: { address: string }
  selectorRecentlyChanged: boolean
  sourceTransaction?: { hash: string }
  destinationTransaction?: { hash: string }
  fee:
    | {
        status: 'unavailable'
      }
    | { status: 'loading' }
    | {
        status: 'predicted'
        amount: string
        details: {
          slippage: string
          destination: {
            gasPrice: string
          }
          source: {
            gasPrice: string
          }
          protocol: {
            usd: string
          }
          lowestPossibleAmount: string
        }
        workflowDetails?: {
          dstWorkflow: EvmWorkflow
          dstEncodedWorkflow: string
          nonce: string
          dstGasEstimate: number
          inputAmount: BN
          minAmountOut: string
          srcGasCost: ethers.ethers.BigNumber
          dstGasCost: ethers.ethers.BigNumber
          stargateRequiredNative: string
          srcUsdcBalance: ethers.ethers.BigNumber
        }
      }
}

export type ViewModel = State & { dispatch: (action: Action) => void }
