import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cx from 'classnames'
import { InformationCircleIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { Asset, MoneyAmount, WorkflowStep, BLOCKCHAIN_INFO } from '@fmp/sdk'
import { formatMoney } from 'utils'
import '../../magic-box.css'
// import '../../magic-box2.css'

export const StepInfo = (props: { step: WorkflowStep; active: boolean; children?: React.ReactNode }): JSX.Element => {
  // const activeClass = props.active ? 'magicbox ' : ''
  const activeClass = 'magicbox'
  return (
    <div
      className={`${activeClass} rounded-full p-2 bg-s-base2 dark:bg-s-base02 text-s-base0 dark:text-s-base00 font-bold flex items-center space-x-2 transition group-hover:bg-s-base2 dark:group-hover:bg-s-base02 min-w-[240px]`}
    >
      <img className="inline w-6 h-6 rounded-full" src={props.step.info.iconUrl} />
      <div className="inline">{props.step.info.name}</div>
    </div>
  )
}
