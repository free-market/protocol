import { useCore } from '@component/CoreProvider'
import cx from 'classnames'
import StepChoiceEditorCard from '@component/StepChoiceEditorCard'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import { catalog } from 'config'

const variantsNoTransform = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: 0, opacity: 0 },
}

export const StepChoiceEditor = (props: {
  stepChoiceEditorCard?: React.ReactNode
  stepChoiceBreadCrumbs?: React.ReactNode
  fadeIn?: 'instant' | 'slow'
  invisible?: boolean
  layoutId?: string
}): JSX.Element => {
  const core = useCore()

  if (core.selectedActionGroup == null) {
    throw new Error('selectedActionGroup required')
  }

  if (
    core.selectedStepChoice == null ||
    core.selectedStepChoice.recentlyClosed
  ) {
    return <></>
  }

  const action =
    catalog[core.selectedActionGroup.name].actions[
      core.selectedStepChoice?.index
    ]

  const {
    stepChoiceEditorCard = <StepChoiceEditorCard />,

    stepChoiceBreadCrumbs = (
      <div className="flex items-center text-sm text-stone-500/75 pt-2 group-hover:text-stone-500 cursor-pointer">
        <ChevronLeftIcon className="w-5 h-5 mx-2" />
        <div>{catalog[core.selectedActionGroup.name].title}</div>
        <ChevronLeftIcon className="w-5 h-5 mx-2" />
        <div>{action.title}</div>
      </div>
    ),
    fadeIn = 'slow',
    invisible = false,
    layoutId = `${core.selectedActionGroup?.name}:${
      !core.selectedStepChoice?.recentlyClosed && core.selectedStepChoice?.index
    }:${core.salt}`,
  } = props

  // TODO: use memoized callbacks: https://beta.reactjs.org/apis/react/useCallback
  const deselect = () => {
    if (core.selectedStepChoice == null) {
      core.selectActionGroup(null)
    } else {
      core.selectStepChoice(null)
    }
  }

  const stepChoiceShadow = (
    <motion.div
      transition={{ duration: fadeIn === 'instant' ? 0 : undefined }}
      className="bg-stone-800/75 absolute top-0 right-0 left-0 bottom-0 z-20 p-2 group cursor-pointer"
      onClick={deselect}
      variants={variantsNoTransform}
      initial="hidden"
      animate={{
        y: 0,
        opacity: Number(!core.workflowSteps.some((step) => step.recentlyAdded)),
      }}
      exit="hidden"
    >
      {stepChoiceBreadCrumbs}
    </motion.div>
  )

  return (
    <motion.div
      className={cx('absolute top-0 right-0 left-0 bottom-0 z-20 !m-0', {
        invisible,
      })}
    >
      {stepChoiceShadow}
      <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center">
        <motion.div
          layoutId={layoutId}
          className="flex items-center flex-col content-end space-y-5 z-30"
        >
          {stepChoiceEditorCard}
        </motion.div>
      </div>
    </motion.div>
  )
}
