import Logo from '@component/Logo'

export const CrossChainDepositLayout = (): JSX.Element => {
  const url = 'https://app.aave.com/icons/tokens/eth.svg'
  return (
    <>
      <div className="max-w-sm mx-auto p-2 flex items-center gap-2">
        <Logo className="stroke-zinc-300 w-6 h-6 rounded-full bg-zinc-800 p-1" />
        <div className="font-light text-md">ccd.fmprotocol.com</div>
      </div>

      <div className="bg-zinc-700 rounded-xl p-2 space-y-2 max-w-sm mx-auto shadow-md">
        {/* TODO(FMP-293): support hover, active states */}
        <button className="w-full text-left bg-zinc-600 p-2 rounded-xl space-y-2">
          <div className="text-xs text-zinc-400 font-light">CHAIN</div>
          <div className="flex items-center gap-2">
            <div className="rounded-full overflow-hidden w-4 h-4 bg-zinc-500">
              <img className="w-full h-full opacity-[0.9]" src={url} />
            </div>
            <div className="text-zinc-300">Ethereum</div>
          </div>
        </button>

        {/* TODO(FMP-293): support hover, active states */}
        <button className="w-full text-left bg-zinc-600 p-2 rounded-xl space-y-2">
          <div className="text-xs text-zinc-400 font-light">TOKEN</div>
          <div className="flex items-center gap-2">
            <div className="rounded-full overflow-hidden w-4 h-4 bg-zinc-500">
              <img className="w-full h-full opacity-[0.9]" src={url} />
            </div>
            <div className="text-zinc-300 font-medium">ETH</div>
          </div>
        </button>

        <div className="bg-zinc-600 pt-2 rounded-xl">
          <div className="text-xs text-zinc-400 font-light ml-2">AMOUNT</div>
          <div className="flex items-center gap-2"></div>
          <input
            inputMode="decimal"
            step="0.00000001"
            title="Token Amount"
            autoComplete="off"
            autoCorrect="off"
            type="text"
            pattern="^\d*(\.\d{0,2})?$"
            placeholder="0.00"
            min="0"
            minLength={1}
            maxLength={79}
            spellCheck={false}
            autoFocus
            className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline-2 flex-grow text-left bg-transparent placeholder:text-zinc-400 text-zinc-200 rounded-2xl px-2 pb-3 pt-8 -mt-6 hover:bg-zinc-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent w-full"
          />
        </div>

        {/* TODO(FMP-293): support hover, active states */}
        <button className="w-full bg-zinc-600 p-2 text-zinc-200 rounded-xl text-center bg-sky-600 font-medium text-xl">Start</button>
      </div>
    </>
  )
}
