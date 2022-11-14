import { Draft } from 'immer'
import { useImmer } from 'use-immer'
import React, { useEffect } from 'react'

export type ActionGroupName = 'curve'

// TODO: deprecate this by storing identifiers instead of slugs
export type StepChoiceName = 'swap'

const initialState = {
  selectedActionGroupName: null as ActionGroupName | null,
  selectedStepChoiceName: null as StepChoiceName | null,
  previewStep: null as { id: string; recentlyClosed: false } | { recentlyClosed: true } | null,
}

export type CoreState = typeof initialState

export type Core = CoreState & {
  selectActionGroup: (actionGroupName: ActionGroupName | null) => void
  selectStepChoice: (stepChoiceName: StepChoiceName | null) => void
  escape: () => void
  startPreviewingWorkflowStep: (identifier: string) => void
  stopPreviewingWorkflowStep: () => void
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

    selectActionGroup: (actionGroupName) =>
      updateState((draft: Draft<CoreState>) => {
        if (actionGroupName !== draft.selectedActionGroupName) {
          draft.selectedStepChoiceName = null
        }

        draft.selectedActionGroupName = actionGroupName
      }),

    selectStepChoice: (stepChoiceName) =>
      updateState((draft: Draft<CoreState>) => {
        draft.selectedStepChoiceName = stepChoiceName
      }),

    escape: () =>
      updateState((draft: Draft<CoreState>) => {
        if (draft.selectedStepChoiceName != null) {
          draft.selectedStepChoiceName = null
        } else if (draft.selectedActionGroupName != null) {
          draft.selectedActionGroupName = null
        }
      }),

    startPreviewingWorkflowStep: (id) =>
      updateState((draft: Draft<CoreState>) => {
        draft.previewStep = { id, recentlyClosed: false }
      }),

    stopPreviewingWorkflowStep: () => {
      updateState((draft: Draft<CoreState>) => {
        draft.previewStep = { recentlyClosed: true }
      })

      setTimeout(() => {
        updateState((draft: Draft<CoreState>) => {
          draft.previewStep = null
        })
      }, 1)
    },
  }

  useEffect(() => {
    const callback = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        core.escape()
      }
    }

    window.addEventListener('keydown', callback)

    return () => {
      window.removeEventListener('keydown', callback)
    }
  }, [])

  return <CoreContext.Provider value={core}>{props.children}</CoreContext.Provider>
}
