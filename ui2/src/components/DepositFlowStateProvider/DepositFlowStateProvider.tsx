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
        break
      }
      // setOpen(false)
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
        break
      }

      case 'SelectorRecentlyClosed': {
        state.formEditingMode = {
          name: action.selector.name as 'token' | 'chain',
          recently: 'closed',
        }
        state.tokenSearchValue = ''
        break
      }

      case 'SelectorInputChanged': {
        state.tokenSearchValue = action.value
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
