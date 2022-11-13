import {ChevronLeftIcon} from '@heroicons/react/20/solid'
import {PlusIcon} from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { useCore } from '../CoreProvider'

const variants = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: -10, opacity: 0 }
}

const variantsNoTransform = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: 0, opacity: 0 }
}

const StepChoiceCard = (): JSX.Element => {
  return (
    <div className="inline-flex bg-zinc-700 py-2 px-2 rounded-xl cursor-pointer hover:bg-zinc-600/75 active:opacity-75 select-none items-center justify-between group flex-col space-y-2">
      <div className="inline-flex items-center w-full justify-between">
        <div className="inline-flex items-center">
          <img src='https://curve.fi/favicon-32x32.png' className="w-5 h-5"/>
          <div className="text-zinc-300 px-2">Swap</div>
        </div>
        <PlusIcon className="w-8 h-8 text-zinc-500 group-hover:text-zinc-400/50"/>
      </div>
      <div className="flex items-center text-zinc-600 group-hover:text-zinc-500/50">
        <div className="flex items-center rounded-full bg-zinc-600 text-zinc-300/75 py-1 px-2 space-x-2 font-medium group-hover:bg-zinc-500/50 text-lg">
          <div className="rounded-full overflow-hidden w-5 h-5">
            <img src="https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg"/>
          </div>
          <span>USDC</span>
        </div>

        &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp;{' '}

        <div className="flex items-center rounded-full bg-zinc-600 text-zinc-300/75 py-1 px-2 space-x-2 font-medium group-hover:bg-zinc-500/50 text-lg">
          <div className="rounded-full overflow-hidden w-5 h-5">
            <img src="https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png"/>
          </div>
          <span>USDT</span>
        </div>
      </div>
    </div>
  )
}

const Divider = (props: { delay: number }): JSX.Element => {
    return (
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" className="w-full relative px-5" transition={{ delay: props.delay }}>
            <div className='border-t border-zinc-600 w-full' />

            <div className='absolute top-0 left-0 right-0 z-10'>
              <div className='mx-auto w-10 flex justify-center -mt-3 bg-zinc-900 top-0 z-10 text-zinc-600'>
                or
              </div>
            </div>
            </motion.div>
            )
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
          className="flex items-center h-full justify-center">
          <p className="inline text-zinc-500 text-sm">Select an action group to get started.</p>
        </motion.div>
    )

    default:
      return (
        <>
          <motion.div
            variants={variantsNoTransform}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex items-center text-sm text-zinc-500/75 pt-2 hover:text-zinc-500 cursor-pointer"
            onClick={deselect}>
            <ChevronLeftIcon className="w-4 h-4 mx-2" />
            <div>Curve</div>
          </motion.div>

          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end space-y-5" transition={{ delay: 0.2 }}>
            <StepChoiceCard />
          </motion.div>
            <Divider delay={0.25} />
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end space-y-5" transition={{ delay: 0.3 }}>
            <StepChoiceCard />
          </motion.div>
            <Divider delay={0.35} />
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end space-y-5" transition={{ delay: 0.4 }}>
            <StepChoiceCard />
          </motion.div>
            <Divider delay={0.45} />
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end space-y-5" transition={{ delay: 0.5 }}>
            <StepChoiceCard />
          </motion.div>
        </>
    )
  }
}
