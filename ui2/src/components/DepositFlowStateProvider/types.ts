export type Action =
  | { name: 'DepositButtonClicked' }
  | { name: 'FormLoaded' }
  | { name: 'BackButtonClicked' }
  | { name: 'EditingStarted' }
  | { name: 'EditingStopped' }
  | {
      name: 'SelectorRecentlyOpened'
      selector: { name: string; highlightedResult?: { address: string } }
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
      selector: { name: string; highlightedResult?: { address: string } }
      value: string
    }
  | { name: 'SelectorShadowClicked' }
  | {
      name: 'SelectorResultHoverStarted'
      selector: { name: string }
      result: { address: string }
    }
  | {
      name: 'HighlightMoved'
      selector: {
        name: string
        highlightedResult: { address: string }
      }
    }
  | {
      name: 'SelectorResultClicked'
      selector: { name: string }
      result: { address: string }
    }

export type WalletState = 'ready' | 'insufficient-balance' | 'unconnected'

export type EditingMode = {
  name: 'token' | 'chain'
  recently?: 'opened' | 'closed'
}

export type State = {
  loadingAllowed: boolean
  open: boolean
  loading: boolean
  formEditingMode?: EditingMode
  amountEditing: boolean
  tokenSearchValue: string
  highlightedSelectorResult?: { address: string }
  selectedChain: { address: string }
  selectedToken: { address: string }
  selectorRecentlyChanged: boolean
}

export type ViewModel = State & { dispatch: (action: Action) => void }
