import { Draft } from 'immer'
import { useImmer } from 'use-immer'
import React from 'react'

export type ActionGroupName = 'none' | 'curve'

const initialState = {
  selectedActionGroupName: 'none' as ActionGroupName
}

export type CoreState = typeof initialState

export type Core = CoreState & {
  selectActionGroup: (actionGroupName: ActionGroupName) => void
}

export const CoreContext = React.createContext(null as Core | null)

export const useCore = (): Core => {
  const core = React.useContext(CoreContext)

  if (core == null) {
    throw new Error('useCore: missing CoreProvider')
  }

  return core
}

export const CoreProvider = (props: { children: React.ReactNode }): JSX.Element => {
  const [state, updateState] = useImmer(initialState)

  const core: Core = {
    ...state,
    selectActionGroup: (actionGroupName) => {
      updateState((draft: Draft<CoreState>) => {
        draft.selectedActionGroupName = actionGroupName
      })
    }
  }

  return (
    <CoreContext.Provider value={core}>
      {props.children}
    </CoreContext.Provider>
  )
}
