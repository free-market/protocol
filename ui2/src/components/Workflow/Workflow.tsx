import AssetPill from '@component/AssetPill'
import { useCore } from '@component/CoreProvider'
import { motion } from 'framer-motion'
import cx from 'classnames'
import { BellIcon } from '@heroicons/react/24/outline'

export const Workflow = (): JSX.Element => {
  const core = useCore()

  const handleMouseEnter = () => {
    core.startPreviewingWorkflowStep('#2')
  }

  const handleMouseLeave = () => {
    core.stopPreviewingWorkflowStep()
  }

  const inputPill = (
    <AssetPill
      className="inline-flex items-center rounded-full bg-zinc-700/75 text-zinc-300 py-1 px-2 space-x-2 font-medium text-lg group-hover:bg-zinc-600/75"
      asset={{
        label: 'USDC',
        icon: {
          url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg',
        },
      }}
    />
  )

  const outputPill = (
    <AssetPill
      className="inline-flex items-center rounded-full bg-zinc-700/75 text-zinc-300 py-1 px-2 space-x-2 font-medium text-lg group-hover:bg-zinc-600/75"
      asset={{
        label: 'USDT',
        icon: { url: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png' },
      }}
    />
  )

  const triggerStep = (
    <motion.div className="rounded-xl bg-zinc-700/25 w-full p-2 group">
      <div className="inline-flex items-center gap-2 justify-between w-full">
        <div className="inline-flex items-center gap-2">
          <div className="text-zinc-400">#1</div>
          <BellIcon className="w-5 w-5 text-zinc-400" />
          <div className="text-zinc-400">User Trigger</div>
        </div>
      </div>
    </motion.div>
  )

  const step = (
    <motion.div
      className="rounded-xl bg-zinc-700/25 w-full p-2 hover:bg-zinc-700/50 cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="inline-flex items-center gap-2 justify-between w-full">
        <div className="inline-flex items-center gap-2">
          <div className="text-zinc-400">#2</div>
          <img src="https://curve.fi/favicon-32x32.png" className="w-5 h-5" />
          <div className="text-zinc-400">Curve Swap</div>
        </div>
        <div className="flex items-center text-zinc-600 group-hover:text-zinc-500/50">
          {inputPill}
          &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp; {outputPill}
        </div>
      </div>
    </motion.div>
  )

  const layoutId = core.newStep ? (core.newStep.recentlyAdded ? 'foo' : 'random-id') : 'random-id'

  const secondStep = (
    <motion.div
      key={layoutId}
      layoutId={layoutId}
      className="rounded-xl bg-zinc-700/25 w-full p-2 hover:bg-zinc-700/50 cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cx('inline-flex items-center gap-2 justify-between w-full transition-opacity', {
          'opacity-0 pointer-events-none': core.newStep?.recentlyAdded,
        })}
      >
        <div className="inline-flex items-center gap-2">
          <div className="text-zinc-400">#3</div>
          <img src="https://curve.fi/favicon-32x32.png" className="w-5 h-5" />
          <div className="text-zinc-400">Curve Swap</div>
        </div>
        <div className="flex items-center text-zinc-600 group-hover:text-zinc-500/50">
          {inputPill}
          &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp; {outputPill}
        </div>
      </div>
    </motion.div>
  )

  return (
    <>
      <div className="space-y-2">
        {triggerStep}
        {step}
        {core.newStep && secondStep}
      </div>
    </>
  )
}
