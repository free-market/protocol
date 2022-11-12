import {ChevronLeftIcon} from '@heroicons/react/20/solid'
import { motion } from 'framer-motion'
import { useCore } from '../CoreProvider'

const variants = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: -20, opacity: 0 }
}

export const StepBuilder = (): JSX.Element => {
  const core = useCore()

  const deselect = () => {
    core.selectActionGroup('none')
  }

  switch (core.selectedActionGroupName) {
    case 'none':
      return (
        <motion.div
          key={core.selectedActionGroupName}
          variants={variants}
          animate="visible"
          exit="hidden"
          transition={{ stiffness: 100, duration: 0.05 }}
          className="flex items-center h-full">
          <p className="text-zinc-500 text-sm">Hello! Select an action group on the left to get started.</p>
        </motion.div>
    )

    default:
      return (
        <>
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" className="flex items-center text-sm text-zinc-500 mb-2 hover:text-zinc-400/75 cursor-pointer" onClick={deselect}>
            <ChevronLeftIcon className="w-4 h-4 mx-2" />
            <div>Curve</div>
          </motion.div>
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex justify-center flex-col" transition={{ transition: { delay: 0.2 } }}>
          <div className="bg-zinc-700 p-2 rounded-xl cursor-pointer hover:bg-zinc-600 active:bg-zinc-600/75 select-none flex items-center justify-between group">
            <div className="flex items-center">
              <img src='https://curve.fi/favicon-32x32.png' className="w-8 h-8"/>
              <div className="text-zinc-300 text-lg px-2">Curve</div>
            </div>
          </div>
        </motion.div>
        </>
    )
  }
}
