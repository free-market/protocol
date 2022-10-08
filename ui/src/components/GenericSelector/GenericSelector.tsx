import React from 'react'
import cx from 'classnames'
import { motion, LayoutGroup } from 'framer-motion'

type GenericSelectorProps = {
  id: string
  heading: React.ReactNode
  choiceName: string
  choices: { name: string, label: React.ReactNode }[]
  onChoice: (choiceName: string) => void
  oneline?: boolean
}

export const GenericSelector = (props: GenericSelectorProps): JSX.Element => {
  const { id, heading, choiceName, choices, onChoice, oneline } = props

  const choiceButtons = choices.map(({name, label}) => {
    const active = name === choiceName
    const container = cx('transition flex rounded-full pr-2 cursor-pointer items-center relative',
                         active
                           ? 'bg-s-base01 text-s-base2 hover:bg-s-base02/75 active:bg-s-base02 dark:bg-s-base1 dark:text-s-base03 dark:hover:bg-s-base0 dark:active:bg-s-base1/75 poppy:bg-zinc-200 poppy:text-zinc-800 poppy:hover:bg-zinc-300 poppy:active:bg-zinc-400'
                           : 'bg-s-base2 text-s-base01 hover:bg-s-base1/25 active:bg-s-base1/50 dark:bg-s-base02 dark:text-s-base1 dark:hover:bg-s-base01/25 dark:active:bg-s-base01 poppy:bg-zinc-800 poppy:hover:bg-zinc-700 poppy:active:bg-zinc-600 poppy:text-inherit')

    return (
      <div onClick={() => { onChoice(name) }} className={container} key={name}>
      <div className={cx('m-2 w-2 h-2 rounded-full', active ? 'poppy-bg-zinc-800 bg-s-base01' : 'bg-s-base0 poppy:bg-zinc-500')}/>
      {active && <motion.div layoutId="active" className="m-2 w-2 h-2 rounded-full bg-s-blue absolute z-10"/>}
      <div className="text-sm">{label}</div>
    </div>
    )
  })

  return (
    <LayoutGroup id={id}>
      <div className={cx('w-full border-l-2 border-s-base0 poppy:border-zinc-600 poppy:text-zinc-400 px-5 text-s-base1',
        oneline ?
          'flex items-center space-x-5' : 'space-y-2'
        )}>
        <div>{heading}</div>
        <div className="inline-flex space-x-5">{choiceButtons}</div>
      </div>
    </LayoutGroup>
  )
}
