import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { useCore } from '@component/CoreProvider'
import StepChoiceCard from '@component/StepChoiceCard'
import StepChoiceEditor from '@component/StepChoiceEditor'
import StepEditorPreview from '@component/StepEditorPreview'

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
      <div className="border-t border-zinc-600 w-36" />
      <div className="mx-auto w-10 flex justify-center -mt-3 text-zinc-600 transform translate-y-1">or</div>
      <div className="border-t border-zinc-600 w-36" />
    </motion.div>
  )
}

export const StepBuilder = (): JSX.Element => {
  const core = useCore()

  // TODO: use memoized callbacks: https://beta.reactjs.org/apis/react/useCallback
  const deselect = () => {
    core.escape()
  }

  switch (core.selectedActionGroupName) {
    case null:
      return (
        <motion.div
          key={core.selectedActionGroupName}
          variants={variants}
          animate="visible"
          exit="hidden"
          transition={{ stiffness: 100, duration: 0.05 }}
          className="flex items-center h-full justify-center"
        >
          <p className="inline text-zinc-500 text-sm">Select an action group to get started.</p>
          {core.previewStep != null && !core.previewStep.recentlyClosed && <StepEditorPreview />}
        </motion.div>
      )

    default: {
      const firstCardId =
        (core.selectedStepChoice && !core.selectedStepChoice.recentlyClosed && !core.selectedStepChoice.recentlySelected) ||
        (core.newStep && core.newStep.recentlyAdded)
          ? 'foo3'
          : core.newStep
          ? 'foo2'
          : 'foo'
      const choiceCardsAndDividers = (
        <>
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            key={core.selectedActionGroupName}
            className="flex items-center flex-col content-end space-y-5"
            transition={{ delay: 0.2 }}
          >
            <motion.div key={firstCardId} layout layoutId={firstCardId}>
              <StepChoiceCard index={0} />
            </motion.div>
          </motion.div>
          <Divider delay={0.25} />
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            key={core.selectedActionGroupName}
            className="flex items-center flex-col content-end space-y-5"
            transition={{ delay: 0.3 }}
          >
            <motion.div layout layoutId="baz">
              <StepChoiceCard index={1} />
            </motion.div>
          </motion.div>
          <Divider delay={0.35} />
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            key={core.selectedActionGroupName}
            className="flex items-center flex-col content-end space-y-5"
            transition={{ delay: 0.4 }}
          >
            <motion.div layout layoutId="bar">
              <StepChoiceCard index={2} />
            </motion.div>
          </motion.div>
          <Divider delay={0.45} />
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            key={core.selectedActionGroupName}
            className="flex items-center flex-col content-end space-y-5"
            transition={{ delay: 0.5 }}
          >
            <motion.div layout layoutId="quux">
              <StepChoiceCard index={3} />
            </motion.div>
          </motion.div>
        </>
      )

      const breadCrumbs = (
        <motion.button
          variants={variantsNoTransform}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="flex items-center text-sm text-zinc-500/75 pt-2 hover:text-zinc-500 cursor-pointer focus:outline-2"
          onClick={deselect}
        >
          <ChevronLeftIcon className="w-5 h-5 mx-2" />
          <div>Curve</div>
        </motion.button>
      )

      const stepChoiceEditor = (
        <StepChoiceEditor
          invisible={core.previewStep != null && !core.previewStep.recentlyClosed}
          fadeIn={core.previewStep == null ? 'slow' : 'instant'}
        />
      )

      return (
        <>
          {breadCrumbs}
          {choiceCardsAndDividers}
          {core.previewStep != null && !core.previewStep.recentlyClosed && <StepEditorPreview />}
          <AnimatePresence>{core.selectedStepChoice && stepChoiceEditor}</AnimatePresence>
        </>
      )
    }
  }
}
