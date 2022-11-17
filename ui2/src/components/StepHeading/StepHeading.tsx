import { ActionGroupName } from '@component/CoreProvider/CoreProvider'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { headingMap } from 'config'
import { useCore } from '../CoreProvider'

export const StepHeading = (props: { actionGroupName?: ActionGroupName }): JSX.Element => {
  const { actionGroupName = 'curve' } = props
  const core = useCore()

  const click = () => {
    core.selectActionGroup(actionGroupName)
  }

  return (
    <button
      className="block w-full bg-zinc-700 p-2 rounded-xl cursor-pointer hover:bg-zinc-600 active:opacity-75 select-none flex items-center justify-between group"
      onClick={click}
    >
      <div className="flex items-center">
        <img src={headingMap[actionGroupName].icon.url} className="w-8 h-8" />
        <div className="text-zinc-300 text-lg px-2">{headingMap[actionGroupName].title}</div>
      </div>
      <ChevronRightIcon className="text-zinc-500 w-8 h-8 group-hover:text-zinc-400/50 transform translate-x-2" />
    </button>
  )
}
