import { createContext } from 'react'
import { useImmerReducer } from 'use-immer'

import { Action, EditingMode, State, ViewModel } from './types'

export const initialState: State = {
  loadingAllowed: false,
  flowStep: 'closed',
  formEditingMode: undefined,
  amountEditing: false,
  amount: undefined,
  tokenSearchValue: '',
  selectedChain: { address: 10 },
  selectedToken: { address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607' },
  selectorRecentlyChanged: false,
  fee: { status: 'unavailable' },
}

export const DepositFlowStateContext = createContext<ViewModel>({
  ...initialState,
  dispatch() {
    // no-op
  },
})

export const DepositFlowStateProvider = (props: {
  initiallyLoadingAllowed?: boolean
  initialStep?: State['flowStep']
  initialFormEditingMode?: EditingMode
  children?: React.ReactNode
}): JSX.Element => {
  const {
    initiallyLoadingAllowed = initialState.loadingAllowed,
    initialStep = initialState.flowStep,
    initialFormEditingMode = initialState.formEditingMode,
  } = props

  const reducer = (state: State, action: Action) => {
    switch (action.name) {
      case 'DepositButtonClicked': {
        state.flowStep = 'open'
        if (state.loadingAllowed) {
          state.flowStep = 'loading'
        }
        break
      }
      case 'FormLoaded': {
        state.flowStep = 'open'
        break
      }
      case 'BackButtonClicked': {
        state.flowStep = 'closed'
        state.formEditingMode = undefined
        break
      }
      case 'WorkflowSubmissionStarted': {
        state.flowStep = 'submitting'
        state.formEditingMode = undefined
        break
      }
      case 'WorkflowSubmissionFinished': {
        state.flowStep = 'submitted'
        state.formEditingMode = undefined
        state.sourceTransaction = action.transaction
        break
      }
      case 'WorkflowSubmissionFailed': {
        state.flowStep = 'closed'
        state.formEditingMode = undefined
        break
      }
      case 'WorkflowStarted': {
        state.flowStep = 'started'
        state.formEditingMode = undefined
        break
      }
      case 'WorkflowCompleted': {
        state.flowStep = 'complete'
        state.formEditingMode = undefined
        state.destinationTransaction = action.transaction
        break
      }
      case 'SelectorShadowClicked': {
        state.formEditingMode = undefined
        break
      }
      case 'SelectorResultHoverStarted': {
        state.highlightedSelectorResult = { address: action.result.address }
        break
      }
      case 'SelectorResultClicked': {
        if (action.selector.name === 'chain') {
          const { address } = action.result
          if (typeof address === 'string') {
            console.error(
              'cannot handle action: chain address must be number',
              {
                action,
              },
            )

            break
          }

          state.selectedChain = { address }
        } else if (action.selector.name === 'token') {
          const { address } = action.result
          if (typeof address === 'number') {
            console.error(
              'cannot handle action: token address must be hex string',
              {
                action,
              },
            )

            break
          }

          state.selectedToken = { address }
        }
        break
      }
      case 'EditingStarted': {
        state.amountEditing = true
        break
      }
      case 'EditingStopped': {
        state.amountEditing = false
        break
      }
      case 'SelectorRecentlyOpened': {
        state.formEditingMode = {
          name: action.selector.name as 'token' | 'chain',
          recently: 'opened',
        }

        state.tokenSearchValue = ''
        state.highlightedSelectorResult = action.selector.highlightedResult

        break
      }

      case 'SelectorOpened': {
        state.formEditingMode = {
          name: action.selector.name as 'token' | 'chain',
          recently: undefined,
        }

        break
      }

      case 'SelectorClosed': {
        state.formEditingMode = undefined
        state.tokenSearchValue = ''
        state.highlightedSelectorResult = undefined
        break
      }

      case 'SelectorRecentlyClosed': {
        state.formEditingMode = {
          name: action.selector.name as 'token' | 'chain',
          recently: 'closed',
        }
        state.tokenSearchValue = ''
        state.highlightedSelectorResult = undefined
        break
      }

      case 'SelectorInputRecentlyChanged': {
        state.selectorRecentlyChanged = true
        state.tokenSearchValue = action.value
        if (action.selector.highlightedResult) {
          state.highlightedSelectorResult = action.selector.highlightedResult
        }
        break
      }

      case 'SelectorInputChanged': {
        state.selectorRecentlyChanged = false
        break
      }

      case 'HighlightMoved': {
        state.highlightedSelectorResult = action.selector.highlightedResult
        break
      }

      case 'AmountChanged': {
        state.amount = action.value
        break
      }

      case 'FeePredictionStarted': {
        state.fee = { status: 'loading' }
        break
      }

      case 'FeePredicted': {
        state.fee = {
          status: 'predicted',
          amount: action.amount,
          details: action.fee,
          workflowDetails: action.workflowDetails,
        }
        break
      }

      case 'UnavailableFeePredicted': {
        state.fee = { status: 'unavailable' }
        break
      }

      default:
        return state
    }
  }

  const [state, dispatch] = useImmerReducer<State>(reducer, {
    ...initialState,
    loadingAllowed: initiallyLoadingAllowed,
    flowStep: initialStep,
    formEditingMode: initialFormEditingMode,
  })

  const viewModel: ViewModel = { ...state, dispatch }

  return (
    <DepositFlowStateContext.Provider value={viewModel}>
      {props.children}
    </DepositFlowStateContext.Provider>
  )
}
