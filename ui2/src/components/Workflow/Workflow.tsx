import AssetPill from '@component/AssetPill'
import { useCore } from '@component/CoreProvider'
import { motion } from 'framer-motion'
import cx from 'classnames'
import { catalog } from 'config'

export const Workflow = (): JSX.Element => {
  const core = useCore()

  const handleMouseEnter = () => {
    core.startPreviewingWorkflowStep('#1')
  }

  const handleMouseLeave = () => {
    core.stopPreviewingWorkflowStep()
  }

  const inputPill = (
    <AssetPill
      network="not-included"
      className="inline-flex items-center rounded-full bg-zinc-700/75 text-zinc-300 py-1 px-2 space-x-2 font-medium text-lg group-hover:bg-zinc-600/75"
      asset={catalog.curve.actions[0].input.asset}
    />
  )

  const outputPill = (
    <AssetPill
      network="not-included"
      className="inline-flex items-center rounded-full bg-zinc-700/75 text-zinc-300 py-1 px-2 space-x-2 font-medium text-lg group-hover:bg-zinc-600/75"
      asset={catalog.curve.actions[0].output.asset}
    />
  )

  const step = (
    <motion.div
      className="rounded-xl bg-zinc-700/25 w-full p-2 hover:bg-zinc-700/50 cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="inline-flex items-center gap-2 justify-between w-full">
        <div className="inline-flex items-center gap-2">
          <div className="text-zinc-400">#1</div>
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

  const layoutId = core.newStep ? (core.newStep.recentlyAdded ? 'curve:secondary=false' : 'random-id') : 'random-id'

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

  return (
    <>
      <div className="space-y-2">
        {step}
        {core.newStep && secondStep}
      </div>
    </>
  )
}
