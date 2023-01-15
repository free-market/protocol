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
  open: boolean
  loading: boolean
  formEditingMode?: EditingMode
  amountEditing: boolean
  tokenSearchValue: string
  highlightedSelectorResult?: { address: string | number }
  selectedChain: { address: string | number }
  selectedToken: { address: string | number }
  selectorRecentlyChanged: boolean
}

export type ViewModel = State & { dispatch: (action: Action) => void }
