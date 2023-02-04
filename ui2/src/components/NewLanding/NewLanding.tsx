import Logo from '@component/Logo'
import {
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid'

export const Navbar = () => {
  const line = (
    <div className="absolute left-0 right-0 bottom-0 -bottom-1 mx-auto w-5 rounded border-t-2 border-stone-200" />
  )

  return (
    <div className="w-full text-stone-500 flex gap-2 font-semibold">
      <a
        href="#"
        className="inline-block relative transition-all transition-1000 text-stone-200"
      >
        {line}
        About
      </a>

      <a
        href="https://docs.fmprotocol.com"
        className="inline-block relative transition-all transition-1000 hover:text-stone-400"
      >
        Docs
      </a>

      <a
        href="https://medium.com/free-market-labs"
        className="inline-block relative transition-all transition-1000 hover:text-stone-400"
      >
        Blog
      </a>

      {/*
          TODO(FMP-391): GET EARLY ACCESS link
      <a href="#" className="inline-block relative transition-all transition-1000">
        Contact
      </a>
        */}
    </div>
  )
}

export const NewLanding = (): JSX.Element => {
  return (
    <>
      <div className="bg-stone-900 min-h-screen flex flex-col">
        <div className="h-24 flex justify-between">
          <div className="h-24 flex items-center mx-5 gap-2">
            <div className="border border-4 border-stone-500 rounded-full p-1">
              <Logo className="w-5 h-5 stroke-stone-200" />
            </div>
            <span className="text-stone-200 font-bold text-xl tracking-tight">
              freemarket
            </span>
          </div>
          <div className="h-24 flex items-center mx-5 gap-2"></div>
          <div className="h-24 flex items-center mx-5 gap-2">
            <Navbar />
          </div>
        </div>
        <div className="grow mx-auto max-w-6xl text-center text-[5rem] font-semibold tracking-[-1.6px] text-stone-200 flex items-center select-none">
          <span>
            <span>
              Free Market is a better way to build cross-chain workflows.
            </span>{' '}
            <a className="cursor-pointer hover:text-stone-200 active:text-stone-400 text-stone-500 inline-flex items-start leading-tight hover:underline">
              Try our first app.
              <ArrowTopRightOnSquareIcon className="w-10 h-10 inline-block" />
            </a>
          </span>
        </div>
        <div className="max-w-2xl mx-auto flex justify-between items-start gap-10 py-20">
          <div className="inline-flex rounded-full items-center bg-stone-200 text-stone-700 font-semibold px-8 py-3 gap-2 border border-transparent">
            <span>VIEW DOCS</span>
            <ChevronRightIcon className="w-6 h-6" />
          </div>
          <div className="inline-flex rounded-full items-center text-stone-200 font-semibold px-8 py-3 gap-2 border border-stone-200">
            {/* TODO(FMP-391): GET EARLY ACCESS link */}
            <span>GET EARLY ACCESS</span>
            <ChevronRightIcon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </>
  )
}
