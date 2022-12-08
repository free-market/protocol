import Logo from '@component/Logo'

export const CrossChainDepositLayout = (): JSX.Element => {
  const url = 'https://app.aave.com/icons/tokens/eth.svg'
  return (
    <>
      <div className="max-w-sm mx-auto p-2 flex items-center gap-2">
        <Logo className="stroke-zinc-300 w-6 h-6 rounded-full bg-zinc-800 p-1" />
        <div className="font-light text-md">cross-chain-deposit.fmprotocol.com</div>
      </div>

      <div className="bg-zinc-700 rounded-xl p-2 space-y-2 max-w-sm mx-auto shadow-md">
        <button className="w-full text-left bg-zinc-600 p-2 rounded-xl space-y-2">
          <div className="text-xs text-zinc-400 font-light">CHAIN</div>
          <div className="flex items-center gap-2">
            <div className="rounded-full overflow-hidden w-5 h-5 bg-zinc-500">
              <img className="w-full h-full" src={url} />
            </div>
            <div className="text-zinc-300">Ethereum</div>
          </div>
        </button>

        <button className="w-full text-left bg-zinc-600 p-2 rounded-xl space-y-2">
          <div className="text-xs text-zinc-400 font-light">TOKEN</div>
          <div className="flex items-center gap-2">
            <div className="rounded-full overflow-hidden w-5 h-5 bg-zinc-500">
              <img className="w-full h-full" src={url} />
            </div>
            <div className="text-zinc-300 font-medium">ETH</div>
          </div>
        </button>

        <div className="bg-zinc-600 p-2 rounded-xl space-y-2">
          <div className="text-xs text-zinc-400 font-light">AMOUNT</div>
          <div className="flex items-center gap-2">
            <div className="text-zinc-300 font-medium">0.00</div>
          </div>
        </div>
        <div className="bg-zinc-600 p-2 text-zinc-200 rounded-xl text-center bg-sky-600 font-medium text-xl">Start</div>
      </div>
    </>
  )
}
