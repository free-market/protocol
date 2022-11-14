import { Draft } from 'immer'
import { useImmer } from 'use-immer'
import React, { useEffect } from 'react'

export type ActionGroupName = 'curve'

// TODO: deprecate this by storing identifiers instead of slugs
export type StepChoice = { name: 'swap'; recentlySelected: boolean; recentlyClosed: false } | { recentlyClosed: true }

const initialState = {
  selectedActionGroupName: null as ActionGroupName | null,
  selectedStepChoice: null as StepChoice | null,
  previewStep: null as { id: string; recentlyClosed: false } | { recentlyClosed: true } | null,
  newStep: null as { recentlyAdded: boolean } | null, // TODO: store real workflow state
}

export type CoreState = typeof initialState

export type Core = CoreState & {
  selectActionGroup: (actionGroupName: ActionGroupName | null) => void
  selectStepChoice: (stepChoiceName: string | null) => Promise<void>
  escape: () => void
  startPreviewingWorkflowStep: (identifier: string) => void
  stopPreviewingWorkflowStep: () => void
  submitStepChoice: (waitBeforeNavigation?: () => Promise<void>) => Promise<void>
}

export const CoreContext = React.createContext(null as Core | null)

export const useCore = (): Core => {
  const core = React.useContext(CoreContext)

  if (core == null) {
    throw new Error('useCore: missing CoreProvider')
  }

  return core
}

export const CoreProvider = (props: { children: React.ReactNode; initialNoSelectedStepChoice?: boolean }): JSX.Element => {
  const { initialNoSelectedStepChoice = true } = props
  const [state, updateState] = useImmer(initialState)

  const core: Core = {
    ...state,
    selectedStepChoice: initialNoSelectedStepChoice ? { name: 'swap', recentlySelected: false, recentlyClosed: false } : null,

    selectActionGroup: (actionGroupName) =>
      updateState((draft: Draft<CoreState>) => {
        if (actionGroupName !== draft.selectedActionGroupName) {
          draft.selectedStepChoice = null
        }

        draft.selectedActionGroupName = actionGroupName
      }),

    selectStepChoice: async (stepChoiceName) => {
      if (stepChoiceName == null) {
        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = { recentlyClosed: true }
        })
        await new Promise((resolve) => setTimeout(resolve, 300))
        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = null
        })
      } else {
        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = { name: 'swap', recentlySelected: true, recentlyClosed: false }
        })
        await new Promise((resolve) => setTimeout(resolve, 300))
        updateState((draft: Draft<CoreState>) => {
          if (draft.selectedStepChoice && !draft.selectedStepChoice.recentlyClosed) {
            draft.selectedStepChoice.recentlySelected = false
          }
        })
      }
    },

    escape: () =>
      updateState((draft: Draft<CoreState>) => {
        if (draft.selectedStepChoice != null && !draft.selectedStepChoice.recentlyClosed) {
          draft.selectedStepChoice = { recentlyClosed: true }
          setTimeout(() => {
            updateState((draft: Draft<CoreState>) => {
              draft.selectedStepChoice = null
            })
          }, 300)
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

    submitStepChoice: async (waitBeforeNavigation) => {
      await new Promise((resolve) => setTimeout(resolve, 1200))

      updateState((draft: Draft<CoreState>) => {
        draft.newStep = { recentlyAdded: true }
      })

      await new Promise((resolve) => setTimeout(resolve, 300))

      updateState((draft: Draft<CoreState>) => {
        draft.newStep = { recentlyAdded: false }
      })

      if (waitBeforeNavigation) {
        await waitBeforeNavigation()
      }

      updateState((draft: Draft<CoreState>) => {
        draft.selectedStepChoice = null
      })
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
