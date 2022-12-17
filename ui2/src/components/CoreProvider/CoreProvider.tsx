import { Draft } from 'immer'
import { useImmer } from 'use-immer'
import React, { useEffect } from 'react'

import { CatalogGroup, StepChoiceIndex } from 'config'

export type OpenStepChoice = {
  index: StepChoiceIndex
  recentlySelected: boolean
  recentlyClosed: false
}

export type StepChoice = OpenStepChoice | { recentlyClosed: true }

export type CoreAction =
  | {
      name: 'ActionGroupSelectionStarted'
      data: { actionGroup: { name: CatalogGroup['name'] } | null }
    }
  | { name: 'ActionGroupSelectionFinished' }
  | { name: 'StepChoiceSelected'; data: { stepChoice: StepChoice } }
  | { name: 'StepChoiceDeselectionStarted' }
  | { name: 'StepChoiceDeselectionFinished' }
  | { name: 'StepChoiceSelectionStarted'; data: { stepChoice: OpenStepChoice } }
  | { name: 'StepChoiceSelectionFinished' }

const initialState = {
  salt: 'initial',
  submitting: false,
  selectedActionGroup: null as {
    name: CatalogGroup['name']
    recentlySelected: boolean
  } | null,
  selectedStepChoice: null as StepChoice | null,
  previewStep: null as
    | { id: string; recentlyClosed: false }
    | { recentlyClosed: true }
    | null,
  workflowSteps: [] as {
    id: string
    recentlyAdded: boolean
    actionGroup: { name: CatalogGroup['name'] }
    stepChoice: { index: StepChoiceIndex }
  }[],
  catalog: 'open' as 'open' | 'collapsed',
  triggerStep: 'visible' as 'visible' | 'hidden',
}

export type CoreState = typeof initialState

export type Core = CoreState & {
  selectActionGroup: (
    actionGroup: { name: CatalogGroup['name'] } | null,
  ) => void
  selectStepChoice: (stepChoice: StepChoice | null) => Promise<void>
  escape: () => void
  startPreviewingWorkflowStep: (identifier: string) => void
  stopPreviewingWorkflowStep: () => void
  submitStepChoice: (
    waitBeforeNavigation?: () => Promise<void>,
  ) => Promise<void>
}

export const CoreContext = React.createContext(null as Core | null)

export const useCore = (): Core => {
  const core = React.useContext(CoreContext)

  if (core == null) {
    throw new Error('useCore: missing CoreProvider')
  }

  return core
}

export const CoreProvider = (props: {
  children: React.ReactNode
  initialNoSelectedStepChoice?: boolean
  initialWorkflowSteps?: CoreState['workflowSteps']
  initialCatalog?: 'open' | 'collapsed'
  initialTriggerStep?: 'visible' | 'hidden'
}): JSX.Element => {
  const {
    initialCatalog = 'collapsed',
    initialNoSelectedStepChoice = true,
    initialWorkflowSteps,
    initialTriggerStep = 'visible',
  } = props

  const [state, updateState] = useImmer({
    ...initialState,
    selectedActionGroup: initialNoSelectedStepChoice ? null : { name: 'curve' },
    selectedStepChoice: initialNoSelectedStepChoice
      ? null
      : { name: 'swap', recentlySelected: false, recentlyClosed: false },
    workflowSteps: initialWorkflowSteps ?? initialState.workflowSteps,
    catalog: initialCatalog,
    triggerStep: initialTriggerStep,
  } as CoreState)

  const dispatch = (action: CoreAction): void => {
    switch (action.name) {
      case 'ActionGroupSelectionStarted': {
        updateState((draft: Draft<CoreState>) => {
          const {
            data: { actionGroup },
          } = action

          if (actionGroup == null) {
            draft.selectedActionGroup = null
          } else {
            const { selectedActionGroup } = draft

            if (
              selectedActionGroup != null &&
              selectedActionGroup.name !== actionGroup.name
            ) {
              draft.selectedStepChoice = null
            }

            draft.selectedActionGroup = {
              ...actionGroup,
              recentlySelected: true,
            }
          }
        })

        break
      }

      case 'ActionGroupSelectionFinished': {
        updateState((draft: Draft<CoreState>) => {
          if (draft.selectedActionGroup?.recentlySelected) {
            draft.selectedActionGroup.recentlySelected = false
          }
        })
        break
      }

      case 'StepChoiceDeselectionStarted': {
        updateState((draft: Draft<CoreState>) => {
          if (draft.selectedStepChoice != null) {
            draft.selectedStepChoice = { recentlyClosed: true }
          }
        })

        break
      }

      case 'StepChoiceDeselectionFinished': {
        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = null
        })

        break
      }

      case 'StepChoiceSelectionStarted': {
        const {
          data: { stepChoice },
        } = action

        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = stepChoice
          draft.selectedStepChoice.recentlySelected = true
        })

        break
      }

      case 'StepChoiceSelectionFinished': {
        updateState((draft: Draft<CoreState>) => {
          if (
            draft.selectedStepChoice &&
            !draft.selectedStepChoice.recentlyClosed
          ) {
            draft.selectedStepChoice.recentlySelected = false
          }
        })

        break
      }

      case 'StepChoiceSelected': {
        const {
          data: { stepChoice },
        } = action

        updateState((draft: Draft<CoreState>) => {
          draft.selectedStepChoice = stepChoice
        })

        break
      }
    }
  }

  const core: Core = {
    ...state,

    selectActionGroup: async (
      actionGroup: { name: CatalogGroup['name'] } | null,
    ) => {
      dispatch({ name: 'ActionGroupSelectionStarted', data: { actionGroup } })
      await new Promise((resolve) => setTimeout(resolve, 300))
      dispatch({ name: 'ActionGroupSelectionFinished' })
    },

    selectStepChoice: async (stepChoice) => {
      if (stepChoice == null) {
        dispatch({ name: 'StepChoiceDeselectionStarted' })
        await new Promise((resolve) => setTimeout(resolve, 300))
        dispatch({ name: 'StepChoiceDeselectionFinished' })
      } else if (!stepChoice.recentlyClosed) {
        dispatch({ name: 'StepChoiceSelectionStarted', data: { stepChoice } })
        await new Promise((resolve) => setTimeout(resolve, 300))
        dispatch({ name: 'StepChoiceSelectionFinished' })
      } else {
        dispatch({ name: 'StepChoiceSelected', data: { stepChoice } })
      }
    },

    escape: async () => {
      if (state.selectedStepChoice != null) {
        if (state.selectedStepChoice.recentlyClosed) {
          dispatch({ name: 'StepChoiceDeselectionFinished' })
        } else {
          dispatch({ name: 'StepChoiceDeselectionStarted' })
          await new Promise((resolve) => setTimeout(resolve, 300))
          dispatch({ name: 'StepChoiceDeselectionFinished' })
        }
      } else if (state.selectedActionGroup != null) {
        dispatch({
          name: 'ActionGroupSelectionStarted',
          data: { actionGroup: null },
        })
      }
    },

    startPreviewingWorkflowStep: (id) =>
      // TODO: dispatch({ name: 'StepPreviewAppearanceFinished', data: { step: { id } } })
      updateState((draft: Draft<CoreState>) => {
        draft.previewStep = { id, recentlyClosed: false }
      }),

    stopPreviewingWorkflowStep: () => {
      // TODO: dispatch({ name: 'StepPreviewDisappearanceStarted' })
      updateState((draft: Draft<CoreState>) => {
        draft.previewStep = { recentlyClosed: true }
      })

      setTimeout(() => {
        // TODO: dispatch({ name: 'StepPreviewDisappearanceFinished' })
        updateState((draft: Draft<CoreState>) => {
          draft.previewStep = null
        })
      }, 1)
    },

    submitStepChoice: async (waitBeforeNavigation) => {
      const {
        selectedActionGroup: group,
        selectedStepChoice: choice,
        salt,
      } = state

      if (
        state.submitting ||
        choice == null ||
        choice.recentlyClosed ||
        group == null
      ) {
        return
      }

      // TODO: dispatch({ name: 'StepChoiceSubmissionStarted', data: { salt: `${Math.random()}` }})
      updateState((draft: Draft<CoreState>) => {
        draft.submitting = true

        draft.salt = Math.random().toString()
      })

      await new Promise((resolve) => setTimeout(resolve, 1200))

      const id = `${group.name}:${choice.index}:${salt}`

      // TODO: dispatch({ name: 'WorkflowStepAdded', data: { step: { ... }}})
      updateState((draft: Draft<CoreState>) => {
        draft.workflowSteps.push({
          id,
          stepChoice: { index: choice.index },
          actionGroup: { name: group.name },
          recentlyAdded: true,
        })
      })

      await new Promise((resolve) => setTimeout(resolve, 300))

      // TODO: dispatch({ name: 'WorkflowStepAdditionFinished', data: { step: { id }}})
      updateState((draft: Draft<CoreState>) => {
        const index = draft.workflowSteps.findIndex(
          (stepDraft) => stepDraft.id === id,
        )

        if (index !== -1) {
          draft.workflowSteps[index].recentlyAdded = false
        }
      })

      if (waitBeforeNavigation) {
        await waitBeforeNavigation()
      }

      // TODO: dispatch({ name: 'StepChoiceSubmissionFinished' })
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
  }, [core.escape])

  return (
    <CoreContext.Provider value={core}>{props.children}</CoreContext.Provider>
  )
}
