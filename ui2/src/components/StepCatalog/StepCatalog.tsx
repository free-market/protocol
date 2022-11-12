// TODO: rename to 'ActionCatalog'

import StepHeading from '../StepHeading'

export const StepCatalog = (props: {
  content?: React.ReactNode
}): JSX.Element => {
  const {
    content = (
      <>
        <p className="text-zinc-300 text-sm mb-2">
          Welcome to Free Market! Browse our action catalog to get started.
        </p>
        <StepHeading />
        <p className="text-zinc-300 text-sm mt-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sed pharetra lectus. Nulla facilisi. Vestibulum tempus iaculis lorem a pharetra. Mauris a massa vitae ante tempus condimentum. Morbi non mi turpis. Vestibulum bibendum velit at tincidunt pretium. Ut consectetur dui sed nunc posuere, non porta lorem tincidunt. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
        </p>

        <p className="text-zinc-300 text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sed pharetra lectus. Nulla facilisi. Vestibulum tempus iaculis lorem a pharetra. Mauris a massa vitae ante tempus condimentum. Morbi non mi turpis. Vestibulum bibendum velit at tincidunt pretium. Ut consectetur dui sed nunc posuere, non porta lorem tincidunt. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
        </p>

        <p className="text-zinc-300 text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sed pharetra lectus. Nulla facilisi. Vestibulum tempus iaculis lorem a pharetra. Mauris a massa vitae ante tempus condimentum. Morbi non mi turpis. Vestibulum bibendum velit at tincidunt pretium. Ut consectetur dui sed nunc posuere, non porta lorem tincidunt. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
        </p>

        <p className="text-zinc-300 text-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sed pharetra lectus. Nulla facilisi. Vestibulum tempus iaculis lorem a pharetra. Mauris a massa vitae ante tempus condimentum. Morbi non mi turpis. Vestibulum bibendum velit at tincidunt pretium. Ut consectetur dui sed nunc posuere, non porta lorem tincidunt. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
        </p>
      </>
    )
  } = props

  return (
    <>
      <div className="inline-block flex flex-col items-start w-64 text-zinc-800 text-3xl space-y-1 py-3 select-none">
        <div className="bg-zinc-200 px-2">Free</div>
        <div className="bg-zinc-200 px-2">Market</div>
        <div className="bg-zinc-200 px-2">Protocol</div>
      </div>

      {content}
    </>
  )
}
