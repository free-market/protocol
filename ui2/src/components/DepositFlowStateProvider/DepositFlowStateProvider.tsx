import { createContext } from 'react'
import { useImmerReducer } from 'use-immer'

import { Action, EditingMode, State, ViewModel } from './types'

export const initialState: State = {
  loadingAllowed: false,
  open: false,
  loading: false,
  formEditingMode: undefined,
  amountEditing: false,
  tokenSearchValue: '',
  selectedChain: { address: 1 },
  selectedToken: { address: '0x0' },
  selectorRecentlyChanged: false,
}

export const DepositFlowStateContext = createContext<ViewModel>({
  ...initialState,
  dispatch() {
    // no-op
  },
})

export const DepositFlowStateProvider = (props: {
  initiallyLoadingAllowed?: boolean
  initiallyOpen?: boolean
  initialFormEditingMode?: EditingMode
  children?: React.ReactNode
}): JSX.Element => {
  const {
    initiallyLoadingAllowed = initialState.loadingAllowed,
    initiallyOpen = initialState.open,
    initialFormEditingMode = initialState.formEditingMode,
  } = props

  const reducer = (state: State, action: Action) => {
    switch (action.name) {
      case 'DepositButtonClicked': {
        state.open = true
        if (state.loadingAllowed) {
          state.loading = true
        }
        break
      }
      case 'FormLoaded': {
        state.loading = false
        break
      }
      case 'BackButtonClicked': {
        state.open = false
        state.loading = false
        state.formEditingMode = undefined
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
          state.selectedChain = action.result
        } else if (action.selector.name === 'token') {
          state.selectedToken = action.result
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

      default:
        return state
    }
  }

  const [state, dispatch] = useImmerReducer<State>(reducer, {
    ...initialState,
    loadingAllowed: initiallyLoadingAllowed,
    open: initiallyOpen,
    formEditingMode: initialFormEditingMode,
  })

  const viewModel: ViewModel = { ...state, dispatch }

  return (
    <DepositFlowStateContext.Provider value={viewModel}>
      {props.children}
    </DepositFlowStateContext.Provider>
  )
}
