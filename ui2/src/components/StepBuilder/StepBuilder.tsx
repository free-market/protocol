import React from 'react'
import cx from 'classnames'
import {ChevronLeftIcon} from '@heroicons/react/20/solid'
import {PlusIcon, XCircleIcon} from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { useCore } from '../CoreProvider'

const variants = {
  visible: {
    y: 0,
    opacity: 1,
    // for debugging:
    // transition: { duration: 5 }
  },
  hidden: { y: -10, opacity: 0 }
}

const variantsNoTransform = {
  visible: { y: 0, opacity: 1 },
  hidden: { y: 0, opacity: 0 }
}

const StepChoiceCard = (props: {
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
        <div className={cx('inline-flex items-center rounded-full bg-zinc-600 text-zinc-300 py-1 px-2 space-x-2 font-medium text-lg shadow-md', {'group-hover:bg-zinc-500/50': !editing})}>
          <div className="rounded-full overflow-hidden w-5 h-5">
            <img src="https://res.cloudinary.com/sushi-cdn/image/fetch/w_48,f_auto,q_auto,fl_sanitize/https://raw.githubusercontent.com/sushiswap/icons/master/token/usdc.jpg"/>
          </div>
          <span>USDC</span>
        </div>
        )

        const outputPill = (
          <div className={cx('inline-flex items-center rounded-full bg-zinc-600 text-zinc-300 py-1 px-2 space-x-2 font-medium text-lg shadow-md', {'group-hover:bg-zinc-500/50': !editing})}>
          <div className="rounded-full overflow-hidden w-5 h-5">
            <img src="https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/0xdac17f958d2ee523a2206206994597c13d831ec7.png"/>
          </div>
          <span>USDT</span>
        </div>
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

const Divider = (props: { delay: number }): JSX.Element => {
  return (
    <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" className="w-full px-5 flex items-center justify-center h-4 overflow-visible" transition={{ delay: props.delay }}>

      <div className='border-t border-zinc-600 w-36' />
      <div className='mx-auto w-10 flex justify-center -mt-3 text-zinc-600 transform translate-y-1'>
        or
      </div>
      <div className='border-t border-zinc-600 w-36' />
    </motion.div>
  )
}

export const StepBuilder = (): JSX.Element => {
  const core = useCore()

  // TODO: use memoized callbacks: https://beta.reactjs.org/apis/react/useCallback
  const deselect = () => {
    if (core.selectedStepChoiceName == null) {
      core.selectActionGroup(null)
    } else {
      core.selectStepChoice(null)
    }
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
          className="flex items-center h-full justify-center">
          <p className="inline text-zinc-500 text-sm">Select an action group to get started.</p>
        </motion.div>
    )

    default: {
      const choiceCardsAndDividers = (
        <>
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end space-y-5" transition={{ delay: 0.2 }}>
            <motion.div layout layoutId="foo">
              <StepChoiceCard />
            </motion.div>
          </motion.div>
          <Divider delay={0.25} />
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end space-y-5" transition={{ delay: 0.3 }}>
            <motion.div layout layoutId="baz">
              <StepChoiceCard />
            </motion.div>
          </motion.div>
          <Divider delay={0.35} />
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end space-y-5" transition={{ delay: 0.4 }}>
            <motion.div layout layoutId="bar">
              <StepChoiceCard />
            </motion.div>
          </motion.div>
          <Divider delay={0.45} />
          <motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" key={core.selectedActionGroupName} className="flex items-center flex-col content-end space-y-5" transition={{ delay: 0.5 }}>
            <motion.div layout layoutId="quux">
              <StepChoiceCard />
            </motion.div>
          </motion.div>
        </>
      )

      const breadCrumbs = (
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
      )

      const stepChoiceBreadCrumbs = (
        <div className="flex items-center text-sm text-zinc-500/75 pt-2 group-hover:text-zinc-500 cursor-pointer">
          <ChevronLeftIcon className="w-4 h-4 mx-2" />
          <div>Curve</div>
          <ChevronLeftIcon className="w-4 h-4 mx-2" />
          <div>Swap</div>
        </div>
      )

      const stepChoiceShadow = (
        <motion.div className="bg-zinc-800/75 absolute top-0 right-0 left-0 bottom-0 z-20 p-2 group cursor-pointer" onClick={deselect} variants={variantsNoTransform} initial="hidden" animate="visible" exit="hidden">
          {stepChoiceBreadCrumbs}
        </motion.div>
      )

      const stepChoiceEditor = (
        <motion.div className="absolute top-0 right-0 left-0 bottom-0 z-20 !m-0">
          {stepChoiceShadow}
          <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center">
            <motion.div layout layoutId="foo" className="flex items-center flex-col content-end space-y-5 z-30">
              <StepChoiceCard editing />
            </motion.div>
          </div>
        </motion.div>
      )

      return (
        <>
          {React.cloneElement(breadCrumbs, {
          })}
          {choiceCardsAndDividers}
          {core.selectedStepChoiceName === 'swap' && stepChoiceEditor}
        </>
      )
    }
  }
}
