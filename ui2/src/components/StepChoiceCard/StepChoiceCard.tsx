import { useCore } from '@component/CoreProvider'
import { motion } from 'framer-motion'
import AssetPill from '@component/AssetPill'
import { PlusIcon } from '@heroicons/react/24/solid'

export const StepChoiceCard = (): JSX.Element => {
  const core = useCore()

  const click = () => {
    core.selectStepChoice('swap')
  }

  const inputPill = (
    <AssetPill
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
      asset={{
        label: 'USDT',
        icon: { url: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png' },
      }}
    />
  )

  return (
    <motion.button
      layout="position"
      className="inline-flex bg-zinc-700 py-2 px-2 rounded-xl shadow-md items-center justify-between group flex-col cursor-pointer hover:bg-[#45454D] active:opacity-75 select-none space-y-2 focus:outline-2"
      onClick={click}
    >
      <div className="inline-flex items-center w-full justify-between">
        <div className="inline-flex items-center">
          <img src="https://curve.fi/favicon-32x32.png" className="w-5 h-5" />
          <div className="text-zinc-400 px-2">Curve Swap</div>
        </div>

        <PlusIcon className="w-6 h-6 text-zinc-500 group-hover:text-zinc-400/50" />
      </div>
      <div className="flex items-center text-zinc-600 group-hover:text-zinc-500/50">
        {inputPill}
        &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp; {outputPill}
      </div>
    </motion.button>
  )
}
