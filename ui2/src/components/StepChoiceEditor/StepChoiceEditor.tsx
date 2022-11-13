import { useCore } from '@component/CoreProvider'
import StepChoiceEditorCard from '@component/StepChoiceEditorCard'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'

const variantsNoTransform = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: 0, opacity: 0 },
}

export const StepChoiceEditor = (): JSX.Element => {
  const core = useCore()

  // TODO: use memoized callbacks: https://beta.reactjs.org/apis/react/useCallback
  const deselect = () => {
    if (core.selectedStepChoiceName == null) {
      core.selectActionGroup(null)
    } else {
      core.selectStepChoice(null)
    }
  }

  const stepChoiceBreadCrumbs = (
    <div className="flex items-center text-sm text-zinc-500/75 pt-2 group-hover:text-zinc-500 cursor-pointer">
      <ChevronLeftIcon className="w-5 h-5 mx-2" />
      <div>Curve</div>
      <ChevronLeftIcon className="w-5 h-5 mx-2" />
      <div>Swap</div>
    </div>
  )

  const stepChoiceShadow = (
    <motion.div
      className="bg-zinc-800/75 absolute top-0 right-0 left-0 bottom-0 z-20 p-2 group cursor-pointer"
      onClick={deselect}
      variants={variantsNoTransform}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {stepChoiceBreadCrumbs}
    </motion.div>
  )

  return (
    <motion.div className="absolute top-0 right-0 left-0 bottom-0 z-20 !m-0">
      {stepChoiceShadow}
      <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center">
        <motion.div layout layoutId="foo" className="flex items-center flex-col content-end space-y-5 z-30">
          <StepChoiceEditorCard />
        </motion.div>
      </div>
    </motion.div>
  )
}
