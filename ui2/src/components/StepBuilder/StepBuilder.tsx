import { useCore } from '../CoreProvider'

export const StepBuilder = (): JSX.Element => {
  const core = useCore()

  switch (core.selectedActionGroupName) {
    case 'none':
      return (
        <p className="text-zinc-300">Hello</p>
      )

    case 'curve':
      return (
        <p className="text-zinc-300">Curve</p>
      )
  }
}
