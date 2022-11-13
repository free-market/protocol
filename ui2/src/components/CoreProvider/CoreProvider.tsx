import { Draft } from 'immer'
import { useImmer } from 'use-immer'
import React from 'react'

export type ActionGroupName = 'curve'

// TODO: deprecate this by storing identifiers instead of slugs
export type StepChoiceName = 'swap'

const initialState = {
  selectedActionGroupName: null as ActionGroupName | null,
  selectedStepChoiceName: null as StepChoiceName | null
}

export type CoreState = typeof initialState

export type Core = CoreState & {
  selectActionGroup: (actionGroupName: ActionGroupName | null) => void
  selectStepChoice: (stepChoiceName: StepChoiceName | null) => void
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
    selectActionGroup: (actionGroupName) => updateState((draft: Draft<CoreState>) => {
      if (actionGroupName !== draft.selectedActionGroupName) {
        draft.selectedStepChoiceName = null
      }

      draft.selectedActionGroupName = actionGroupName
    }),
    selectStepChoice: (stepChoiceName) => updateState((draft: Draft<CoreState>) => {
      draft.selectedStepChoiceName = stepChoiceName
    })
  }

  return (
    <CoreContext.Provider value={core}>
      {props.children}
    </CoreContext.Provider>
  )
}
