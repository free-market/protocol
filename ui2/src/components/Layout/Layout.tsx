import { AnimatePresence } from 'framer-motion'
import cx from 'classnames'
import React from 'react'

import Logo from '../Logo'
import StepCatalog from '../StepCatalog'
import StepBuilder from '../StepBuilder'
import Workflow from '../Workflow'

import './super-shadow.css'
import { useCore } from '@component/CoreProvider'

export const Layout = (props: {
  stepCatalog?: React.ReactNode
  stepBuilder?: React.ReactNode
  workflow?: React.ReactNode
  height?: 'auto' | 'full'
  gutter?: 'hidden' | 'visible'
  background?: 'opaque' | 'transparent'
}): JSX.Element => {
  const {
    height = 'full',
    gutter = 'visible',
    background = 'opaque',
    stepCatalog = <StepCatalog />,
    stepBuilder = <StepBuilder />,
    workflow = <Workflow />,
  } = props
  const core = useCore()

  return (
    <div
      className={cx('sm:flex items-stretch max-h-full h-full overflow-hidden', {
        'bg-stone-900': background === 'opaque',
      })}
    >
      {gutter === 'visible' && (
        <div
          className={cx('w-14 shrink-0 box-content overflow-hidden', {
            'sm:h-screen': height === 'full',
          })}
        >
          <div
            className={cx(
              "p-3 border-b sm:border-b-0 border-stone-800 select-none bg-repeat bg-[length:70px_70px] w-full bg-[url('/fmp-logo-repeat.svg')] ",
              { 'sm:h-screen': height === 'full' },
            )}
            style={{
              backgroundPosition: '20px -5px',
              boxShadow: '#18181b 0px 0px 30vh 0px inset',
            }}
          >
            <Logo className="stroke-stone-200 w-8 h-8" />
          </div>
        </div>
      )}
      {stepCatalog && (
        <div
          className={cx(
            'text-stone-200 px-3 sm:overflow-y-auto shrink grow-0 space-y-2',
            {
              'w-96': core.catalog === 'open',
              'sm:h-screen': height === 'full',
            },
          )}
        >
          {stepCatalog}
        </div>
      )}
      <div
        className={cx('w-full grow', {
          'sm-h-screen': height === 'full',
          'p-4': background === 'opaque',
        })}
      >
        <div className="h-full p-2 rounded-xl bg-stone-800 w-full sm:flex gap-2">
          <div className="h-full grow basis-0 max-w-sm rounded-xl relative super-shadow overflow-hidden">
            <div
              className="h-full p-2 rounded-xl bg-stone-900 max-w-sm grow basis-0 space-y-5 overflow-y-auto relative"
              key={core.selectedActionGroup?.name}
            >
              <AnimatePresence mode="wait">{stepBuilder}</AnimatePresence>
            </div>
          </div>
          <div className="h-full shrink min-w-xs basis-0 grow overflow-y-auto">
            {workflow}
          </div>
        </div>
      </div>
    </div>
  )
}
