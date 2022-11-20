// TODO: rename to 'ActionCatalog'

import StepHeading from '../StepHeading'

export const StepCatalog = (props: { content?: React.ReactNode }): JSX.Element => {
  const {
    content = (
      <>
        <p className="text-zinc-300 text-sm font-light">Welcome to Free Market! Browse our action catalog to get started.</p>
        <StepHeading actionGroupName="curve" />
        <StepHeading actionGroupName="1inch" />
        <StepHeading actionGroupName="zksync" />
        <StepHeading actionGroupName="aave" />
      </>
    ),
  } = props

  return (
    <>
      <div className="inline-block flex flex-col items-start w-64 text-zinc-800 text-3xl space-y-1 py-3 pb-0 select-none font-extralight">
        <div className="bg-zinc-200 px-2">Free</div>
        <div className="bg-zinc-200 px-2">Market</div>
        <div className="bg-zinc-200 px-2">Protocol</div>
      </div>

      {content}
    </>
  )
}
