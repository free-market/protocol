import { Draft } from 'immer'
import { useImmer } from 'use-immer'
import React, { useEffect } from 'react'

import { ActionGroupName, StepChoiceIndex } from 'config'

export type StepChoice = { index: StepChoiceIndex; recentlySelected: boolean; recentlyClosed: false } | { recentlyClosed: true }

const initialState = {
  submitting: false,
  selectedActionGroup: null as { name: ActionGroupName } | null,
  selectedStepChoice: null as StepChoice | null,
  previewStep: null as { id: string; recentlyClosed: false } | { recentlyClosed: true } | null,
  workflowSteps: [] as {
    id: string
    recentlyAdded: boolean
    actionGroup: { name: ActionGroupName }
    stepChoice: { index: StepChoiceIndex }
  }[],
}

export type CoreState = typeof initialState

export type Core = CoreState & {
  selectActionGroup: (actionGroupName: ActionGroupName | null) => void
  selectStepChoice: (stepChoice: StepChoice | null) => Promise<void>
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

  // TODO: FMP-219: replace updateState usage with sagas
  const [state, updateState] = useImmer({
    ...initialState,
    selectedActionGroup: initialNoSelectedStepChoice ? null : { name: 'curve' },
    selectedStepChoice: initialNoSelectedStepChoice ? null : { name: 'swap', recentlySelected: false, recentlyClosed: false },
  } as CoreState)

  const core: Core = {
    ...state,

    selectActionGroup: (actionGroupName: ActionGroupName | null) =>
      updateState((draft: Draft<CoreState>) => {
        if (actionGroupName == null) {
          draft.selectedActionGroup = null
        } else {
          const { selectedActionGroup } = draft

          if (selectedActionGroup != null && selectedActionGroup.name !== actionGroupName) {
            draft.selectedStepChoice = null
          }

          draft.selectedActionGroup = { name: actionGroupName }
        }
      }),

    selectStepChoice: async (stepChoice) => {
      if (stepChoice == null) {
        updateState((draft: Draft<CoreState>) => {
          if (draft.selectedStepChoice != null) {
            draft.selectedStepChoice = { recentlyClosed: true }
          }
        })
        await new Promise((resolve) => setTimeout(resolve, 300))
        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = null
        })
      } else if (!stepChoice.recentlyClosed) {
        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = stepChoice
          draft.selectedStepChoice.recentlySelected = true
        })
        await new Promise((resolve) => setTimeout(resolve, 300))
        updateState((draft: Draft<CoreState>) => {
          if (draft.selectedStepChoice && !draft.selectedStepChoice.recentlyClosed) {
            draft.selectedStepChoice.recentlySelected = false
          }
        })
      } else {
        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = stepChoice
        })
      }
    },

    escape: () =>
      updateState((draft: Draft<CoreState>) => {
        if (draft.selectedStepChoice != null) {
          if (draft.selectedStepChoice.recentlyClosed) {
            updateState((draft: Draft<CoreState>) => {
              draft.selectedStepChoice = null
            })
          } else {
            draft.selectedStepChoice = { recentlyClosed: true }

            setTimeout(() => {
              updateState((draft: Draft<CoreState>) => {
                draft.selectedStepChoice = null
              })
            }, 300)
          }
        } else if (draft.selectedActionGroup != null) {
          draft.selectedActionGroup = null
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
      const group = state.selectedActionGroup
      const choice = state.selectedStepChoice

      if (state.submitting || choice == null || choice.recentlyClosed || group == null) {
        return
      }

      updateState((draft: Draft<CoreState>) => {
        draft.submitting = true
      })

      await new Promise((resolve) => setTimeout(resolve, 1200))

      updateState((draft: Draft<CoreState>) => {
        draft.workflowSteps.push({
          id: `${group.name}:${choice.index}`,
          stepChoice: { index: choice.index },
          actionGroup: { name: group.name },
          recentlyAdded: true,
        })
      })

      await new Promise((resolve) => setTimeout(resolve, 300))

      updateState((draft: Draft<CoreState>) => {
        const index = draft.workflowSteps.findIndex((stepDraft) => stepDraft.id === `${group.name}:${choice.index}`)

        if (index !== -1) {
          draft.workflowSteps[index].recentlyAdded = false
        }
      })

      if (waitBeforeNavigation) {
        await waitBeforeNavigation()
      }

      updateState((draft: Draft<CoreState>) => {
        draft.selectedStepChoice = null
        draft.submitting = false
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
