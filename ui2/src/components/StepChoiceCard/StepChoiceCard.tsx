import { useCore } from '@component/CoreProvider'
import {motion} from 'framer-motion'
import cx from 'classnames'
import AssetPill from '@component/AssetPill'
import {PlusIcon, XCircleIcon} from '@heroicons/react/24/solid'

export const StepChoiceCard = (props: {
  editing?: boolean
  submitting?: boolean
  empty?: boolean
}): JSX.Element => {
  const { editing = false, empty = false, submitting = false } = props
  const core = useCore()

  const click = () => {
    core.selectStepChoice('swap')
  }

  const deselect = () => {
    core.selectStepChoice(null)
  }

  const button = (
    <motion.button
      className={cx(
        'w-full text-stone-200 font-bold bg-sky-600 rounded-xl px-3 py-2 text-xl active:bg-sky-700 flex justify-center items-center overflow-hidden',
        {
          'cursor-not-allowed': submitting || empty,
          'opacity-50': empty
        }
      )}
    >
      <div className='h-8'>
        <div
          className='transition-all h-8'
          style={{
            marginTop: submitting ? -77 : 2,
            height: 'max-content'
          }}
        >
          <div className='flex items-center'>Add Step</div>
        </div>
        <div className='transition-all h-8 mt-12'>
          <span
            className='border-2 border-transparent animate-spin inline-block w-8 h-8 border-4 rounded-full'
            style={{ borderLeftColor: 'rgb(231 229 228)' }}
          />
        </div>
      </div>
    </motion.button>
  )

  const inputPill = (
    <AssetPill asset={{label: 'USDC', icon: {url: 'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg'}}} />
  )

  const outputPill = (
    <AssetPill asset={{label: 'USDT', icon: {url: 'https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png'}}} />
  )

  return (
    <motion.div
      layout="position"
      className={cx("inline-flex bg-zinc-700 py-2 px-2 rounded-xl shadow-md items-center justify-between group flex-col",
        editing ? 'space-y-5' : 'cursor-pointer hover:bg-[#45454D] active:opacity-75 select-none space-y-2'
      )}
      onClick={editing ? undefined : click}>
      <div className="inline-flex items-center w-full justify-between">
        <div className="inline-flex items-center">
          <img src='https://curve.fi/favicon-32x32.png' className="w-5 h-5"/>
          <div className="text-zinc-400 px-2">Swap</div>
        </div>
        {editing ? (
          <XCircleIcon className='w-8 h-8 p-2 -m-2 box-content text-zinc-500 cursor-pointer hover:text-zinc-400' onClick={deselect}/>
        ) : (
          <PlusIcon className='w-6 h-6 text-zinc-500 group-hover:text-zinc-400/50'/>
        )}
      </div>
      {editing ? (
        <>
          <div className="w-64 flex flex-col content-end justify-end items-end space-y-5">

            {inputPill}
            {outputPill}
          </div>
        </>
      ) : (
        <div className={cx('flex items-center text-zinc-600', {'group-hover:text-zinc-500/50': !editing})}>
          {inputPill}

          &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp;{' '}

          {outputPill}
        </div>
      )}

      {editing && button}
    </motion.div>
  )
}
