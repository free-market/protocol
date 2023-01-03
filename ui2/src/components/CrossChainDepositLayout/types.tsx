export type Action =
  | { name: 'DepositButtonClicked' }
  | { name: 'FormLoaded' }
  | { name: 'BackButtonClicked' }
  | { name: 'EditingStarted' }
  | { name: 'EditingStopped' }
  | { name: 'SelectorRecentlyOpened'; selector: { name: string } }
  | { name: 'SelectorOpened'; selector: { name: string } }
  | { name: 'SelectorRecentlyClosed'; selector: { name: string } }
  | { name: 'SelectorClosed'; selector: { name: string } }
  | { name: 'SelectorInputChanged'; selector: { name: string }; value: string }

export type WalletState = 'ready' | 'insufficient-balance' | 'unconnected'

export type EditingMode = {
  name: 'token' | 'chain'
  recently?: 'opened' | 'closed'
}

export type State = {
  open: boolean
  loading: boolean
  formEditingMode?: EditingMode
  amountEditing: boolean
  tokenSearchValue: string
}
