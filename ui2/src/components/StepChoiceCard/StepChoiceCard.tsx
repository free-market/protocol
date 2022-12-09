import { useCore } from '@component/CoreProvider'
import { motion } from 'framer-motion'
import AssetPill from '@component/AssetPill'
import { PlusIcon } from '@heroicons/react/24/solid'
import { catalog, CatalogAction } from 'config'

export const StepChoiceCard = (props: {
  index?: number
  action: CatalogAction
}): JSX.Element => {
  const { action, index = 0 } = props
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

  const inputPill = <AssetPill asset={action.input.asset} />

  const outputPill = <AssetPill asset={action.output.asset} />

  return (
    <motion.button
      className="inline-flex bg-zinc-700 rounded-xl shadow-md items-center justify-between group flex-col cursor-pointer hover:bg-[#45454D] active:opacity-75 select-none space-y-2 focus:outline-2"
      onClick={click}
    >
      <div className="inline-flex bg-zinc-700 py-2 px-2 rounded-xl items-center justify-between flex-col cursor-pointer hover:bg-[#45454D] active:opacity-75 select-none space-y-2 focus:outline-2 transition-opacity">
        <div className="inline-flex items-center w-full justify-between">
          <div className="inline-flex items-center">
            <img
              src={catalog[core.selectedActionGroup.name].icon.url}
              className="w-5 h-5"
            />
            <div className="text-zinc-400 px-2">
              {catalog[core.selectedActionGroup.name].title} {action.title}
            </div>
          </div>

          <PlusIcon className="w-6 h-6 text-zinc-500 group-hover:text-zinc-400/50" />
        </div>
        <div className="flex items-center text-zinc-600 group-hover:text-zinc-500/50">
          {inputPill}
          &nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;&nbsp; {outputPill}
        </div>
      </div>
    </motion.button>
  )
}
