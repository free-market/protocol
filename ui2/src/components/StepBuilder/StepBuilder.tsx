import {ChevronLeftIcon} from '@heroicons/react/20/solid'
import {PlusIcon} from '@heroicons/react/24/solid'
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
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end" transition={{ transition: { delay: 0.2 } }}>
            <div className="inline-flex bg-zinc-700 py-2 px-4 rounded-xl cursor-pointer hover:bg-zinc-600 active:bg-zinc-600/75 select-none items-center justify-between group flex-col space-y-5">
              <div className="inline-flex items-center w-full justify-between">
              <div className="inline-flex items-center">
                <img src='https://curve.fi/favicon-32x32.png' className="w-5 h-5 group-active:opacity-75"/>
                <div className="text-zinc-300 px-2">Swap</div>
              </div>
                <PlusIcon className="w-8 h-8 text-zinc-600 group-hover:text-zinc-400/50 group-active:text-zinc-500"/>
              </div>
              <div className="flex items-center text-zinc-600 group-hover:text-zinc-400/50 group-active:text-zinc-500">
                <div className="flex items-center rounded-full bg-zinc-500 text-zinc-300/75 py-1 px-2 space-x-2">
                  <div className="rounded-full overflow-hidden w-5 h-5">
                    <img src="https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg"/>
                  </div>
                  <span>USDC</span>
                </div>

                &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp;{' '}

                <div className="flex items-center rounded-full bg-zinc-500 text-zinc-300/75 py-1 px-2 space-x-2">
                  <div className="rounded-full overflow-hidden w-5 h-5">
                    <img src="https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png"/>
                  </div>
                  <span>USDT</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
    )
  }
}
