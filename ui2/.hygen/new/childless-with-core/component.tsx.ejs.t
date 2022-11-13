---
to: src/components/<%= component_name %>/<%= component_name %>.tsx
---
import { useCore } from '@component/CoreProvider'

export const <%= component_name %> = (): JSX.Element => {
  const core = useCore()

  return (
    <>
      <p>Hello Core! {JSON.stringify(core)}</p>
    </>
  )
}
