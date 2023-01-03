import { useImmerReducer } from 'use-immer'
import { Action, State, ViewModel } from './types'

export const useViewModel = (initialState: State): ViewModel => {
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

  const [state, dispatch] = useImmerReducer(reducer, initialState)

  return { ...state, dispatch }
}

export const initialState = {
  loadingAllowed: false,
  open: false,
  loading: false,
  formEditingMode: undefined,
  amountEditing: false,
  tokenSearchValue: '',
}
