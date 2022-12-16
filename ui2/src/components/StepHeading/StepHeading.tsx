import { CatalogGroup } from 'config'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { catalog } from 'config'
import { useCore } from '../CoreProvider'

export const StepHeading = (props: {
  actionGroupName?: CatalogGroup['name']
}): JSX.Element => {
  const { actionGroupName = 'curve' } = props
  const core = useCore()

  const click = () => {
    core.selectActionGroup({ name: actionGroupName })
  }

  return (
    <div className="relative flex items-stretch cursor-pointer group">
      <button
        className="block w-full bg-stone-700 p-2 rounded-xl cursor-pointer hover:bg-stone-600 active:opacity-75 select-none flex items-center justify-between group"
        onClick={click}
      >
        <div className="flex items-center">
          <img src={catalog[actionGroupName].icon.url} className="w-8 h-8" />
          <div className="text-stone-300 text-lg px-2 font-extralight">
            {catalog[actionGroupName].title}
          </div>
        </div>
        <ChevronRightIcon className="text-stone-500 w-8 h-8 group-hover:text-stone-400/50 transform translate-x-2" />
      </button>
    </div>
  )
}
