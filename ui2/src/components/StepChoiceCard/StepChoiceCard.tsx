import { useCore } from '@component/CoreProvider'
import { motion } from 'framer-motion'
import AssetPill from '@component/AssetPill'
import { PlusIcon } from '@heroicons/react/24/solid'
import { catalog, CatalogAction } from 'config'
import cx from 'classnames'

export const StepChoiceCard = (props: {
  index?: number
  action: CatalogAction
  forceHover?: boolean
  forceActive?: boolean
}): JSX.Element => {
  const { action, index = 0, forceHover = false, forceActive = false } = props
  const core = useCore()

  if (core.selectedActionGroup == null) {
    throw new Error('StepChoiceCard: selectedActionGroupName required')
  }

  const click = () => {
    core.selectStepChoice({
      index,
      recentlySelected: true,
      recentlyClosed: false,
    })
  }

  const inputPill = <AssetPill asset={action.input.asset} groupHover />

  const outputPill = <AssetPill asset={action.output.asset} groupHover />

  // formlerly, we use bg-[#45454D] for the hover state
  return (
    <motion.button
      data-force-hover={forceHover}
      data-force-active={forceActive}
      className={cx(
        'inline-flex bg-stone-700 rounded-xl shadow-md items-center justify-between group flex-col cursor-pointer hover:bg-stone-600/75 force-hover:bg-stone-600/75 active:opacity-75 force-active:opacity-75 select-none space-y-2 focus:outline-2 group',
      )}
      onClick={click}
    >
      <div className="inline-flex bg-stone-700 py-2 px-2 rounded-xl items-center justify-between flex-col cursor-pointer hover:bg-stone-600/75 group-force-hover:bg-stone-600/75 active:opacity-75 force-active:opacity-75 select-none space-y-2 focus:outline-2 transition-opacity">
        <div className="inline-flex items-center w-full justify-between">
          <div className="inline-flex items-center">
            <img
              src={catalog[core.selectedActionGroup.name].icon.url}
              className="w-5 h-5"
            />
            <div className="text-stone-400 px-2">
              {catalog[core.selectedActionGroup.name].title} {action.title}
            </div>
          </div>

          <PlusIcon className="w-6 h-6 text-stone-500 group-hover:text-stone-400/50 group-force-hover:text-stone-400/50" />
        </div>
        <div className="flex items-center text-stone-600 group-hover:text-stone-500/50 group-force-hover:text-stone-500/50">
          {inputPill}
          &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp; {outputPill}
        </div>
      </div>
    </motion.button>
  )
}
