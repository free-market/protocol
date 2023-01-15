import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { useCore } from '@component/CoreProvider'
import StepChoiceCard from '@component/StepChoiceCard'
import StepChoiceEditor from '@component/StepChoiceEditor'
import StepEditorPreview from '@component/StepEditorPreview'
import { catalog } from 'config'
import { CoreContext, CoreState } from '@component/CoreProvider/CoreProvider'
import { useCallback, useState } from 'react'
import StepChoiceEditorCard from '@component/StepChoiceEditorCard'

const variants = {
  visible: {
    y: 0,
    opacity: 1,
    // for debugging:
    // transition: { duration: 5 }
  },
  hidden: { y: -10, opacity: 0 },
}

const variantsNoTransform = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: 0, opacity: 0 },
}

const Divider = (props: { delay: number }): JSX.Element => {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="w-full px-5 flex items-center justify-center h-4 overflow-visible"
      transition={{ delay: props.delay }}
    >
      <div className="border-t border-stone-600 w-36" />
      <div className="mx-auto w-10 flex justify-center -mt-3 text-stone-600 transform translate-y-1">
        or
      </div>
      <div className="border-t border-stone-600 w-36" />
    </motion.div>
  )
}

export const StepBuilder = (props: {
  empty?: React.ReactNode
  overrideSelectedActionGroup?: CoreState['selectedActionGroup']
  forceHoverIndex?: number
  forceActiveIndex?: number
  forceHoverSubmit?: boolean
  forceActiveSubmit?: boolean
}): JSX.Element => {
  const {
    empty = null,
    overrideSelectedActionGroup = null,
    forceHoverIndex = -1,
    forceActiveIndex = -1,
    forceHoverSubmit = false,
    forceActiveSubmit = false,
  } = props
  const [fakeSubmitting, setFakeSubmitting] = useState(false)

  const core = useCore()

  const deselect = useCallback(() => {
    core.escape()
  }, [])

  let { selectedActionGroup } = core

  if (overrideSelectedActionGroup != null) {
    selectedActionGroup = overrideSelectedActionGroup
  }

  const submitStepChoice = useCallback(async () => {
    if (overrideSelectedActionGroup) {
      setFakeSubmitting(true)
      setTimeout(() => {
        core.escape()
        setTimeout(() => {
          core.escape()
        }, 100)
        setFakeSubmitting(false)
      }, 2000)
    }
  }, [overrideSelectedActionGroup])

  const render = () => {
    switch (selectedActionGroup) {
      case null:
        return (
          <motion.div
            key="null"
            variants={variants}
            animate="visible"
            exit="hidden"
            transition={{ stiffness: 100, duration: 0.05 }}
            className="flex items-center h-full justify-center"
          >
            <p className="inline text-stone-500 text-sm">
              {empty || <>Select an action group to get started.</>}
            </p>
            {core.previewStep != null && !core.previewStep.recentlyClosed && (
              <StepEditorPreview />
            )}
          </motion.div>
        )

      default: {
        const { actions } = catalog[selectedActionGroup.name]
        const choiceCardsAndDividers = actions.map((action, index) => {
          const secondary: boolean =
            !!(
              core.selectedStepChoice &&
              !core.selectedStepChoice.recentlyClosed &&
              !core.selectedStepChoice.recentlySelected &&
              core.selectedStepChoice.index === index
            ) || !!core.workflowSteps.find((step) => step.recentlyAdded)
          const choice = core.selectedStepChoice
          let id = `${selectedActionGroup?.name}:${index}:${core.salt}`
          const layout = choice != null ? !choice.recentlyClosed : true

          if (secondary) id = `${id}:secondary`

          const cardWrapper = (
            <motion.div
              key={layout ? id : `${id}:instant`}
              layout={layout}
              layoutId={layout ? id : undefined}
              initial={{
                opacity: Number(
                  core.selectedStepChoice == null ||
                    (overrideSelectedActionGroup == null
                      ? core.submitting
                      : fakeSubmitting) ||
                    core.selectedStepChoice.recentlyClosed,
                ),
              }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <StepChoiceCard
                index={index}
                action={action}
                forceHover={index === forceHoverIndex}
                forceActive={index === forceActiveIndex}
              />
            </motion.div>
          )

          return (
            <>
              {index !== 0 && (
                <Divider
                  key={`div${index}:${selectedActionGroup}`}
                  delay={0.15 + index * 0.1}
                />
              )}
              <motion.div
                key={`card${index}:${selectedActionGroup?.name}:${core.salt}`}
                variants={variants}
                initial={
                  selectedActionGroup?.recentlySelected ? 'hidden' : 'visible'
                }
                animate="visible"
                exit="hidden"
                className="flex items-center flex-col content-end space-y-5"
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                {cardWrapper}
              </motion.div>
            </>
          )
        })

        const breadCrumbs = (
          <motion.button
            key={`breadcrumbs:${selectedActionGroup}`}
            variants={variantsNoTransform}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex items-center text-sm text-stone-500/75 pt-2 hover:text-stone-500 cursor-pointer focus:outline-2"
            onClick={deselect}
          >
            <ChevronLeftIcon className="w-5 h-5 mx-2" />
            <div>{catalog[selectedActionGroup.name].title}</div>
          </motion.button>
        )

        const stepChoiceEditor = (
          <StepChoiceEditor
            key={`editor:${selectedActionGroup}`}
            invisible={
              core.previewStep != null && !core.previewStep.recentlyClosed
            }
            fadeIn={core.previewStep == null ? 'slow' : 'instant'}
            stepChoiceEditorCard={
              <StepChoiceEditorCard
                forceHover={forceHoverSubmit}
                forceActive={forceActiveSubmit}
              />
            }
          />
        )

        return (
          <>
            {breadCrumbs}
            {choiceCardsAndDividers}
            {core.previewStep != null && !core.previewStep.recentlyClosed && (
              <StepEditorPreview />
            )}
            <AnimatePresence>
              {core.selectedStepChoice && stepChoiceEditor}
            </AnimatePresence>
          </>
        )
      }
    }
  }

  const elements = render()

  if (overrideSelectedActionGroup != null) {
    return (
      <CoreContext.Provider
        value={{
          ...core,
          selectedActionGroup,
          submitStepChoice,
          submitting: fakeSubmitting,
        }}
      >
        {elements}
      </CoreContext.Provider>
    )
  }

  return elements
}
