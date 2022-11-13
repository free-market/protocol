import { ChevronRightIcon } from '@heroicons/react/24/solid'

import { useCore } from '../CoreProvider'

export const StepHeading = (): JSX.Element => {
  const core = useCore()

  const click = () => {
    core.selectActionGroup('curve')
  }

  return (
    <div
      className="bg-zinc-700 p-2 rounded-xl cursor-pointer hover:bg-zinc-600 active:opacity-75 select-none flex items-center justify-between group"
      onClick={click}
    >
      <div className="flex items-center">
        <img src="https://curve.fi/favicon-32x32.png" className="w-8 h-8" />
        <div className="text-zinc-300 text-lg px-2">Curve</div>
      </div>
      <ChevronRightIcon className="text-zinc-500 w-8 h-8 group-hover:text-zinc-400/50 transform translate-x-2" />
    </div>
  )
}
