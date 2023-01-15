import StepChoiceEditor from '@component/StepChoiceEditor'
import { motion } from 'framer-motion'
import AssetPill from '@component/AssetPill'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { CoreContext, useCore } from '@component/CoreProvider/CoreProvider'
import { catalog } from 'config'

export const StepEditorPreview = (): JSX.Element => {
  const core = useCore()

  const deselect = () => {
    core.selectStepChoice(null)
  }

  const inputPill = (
    <AssetPill
      asset={catalog.curve.actions[0].input.asset}
      network="not-included"
    />
  )

  const outputPill = (
    <AssetPill
      asset={catalog.curve.actions[0].output.asset}
      network="not-included"
    />
  )

  const card = (
    <motion.div className="inline-flex bg-stone-700 py-2 px-2 rounded-xl shadow-md items-center justify-between group flex-col space-y-1 opacity-80">
      <div className="inline-flex items-center w-full justify-between">
        <div className="inline-flex items-center">
          <img src="https://curve.fi/favicon-32x32.png" className="w-5 h-5" />
          <div className="text-stone-400 px-2">Curve Swap</div>
        </div>

        <button
          type="reset"
          className="w-8 h-8 p-2 -mt-2 -mb-2 -mr-3 box-content text-stone-500 cursor-pointer hover:text-stone-400 focus:outline-2"
          onClick={deselect}
        >
          <XCircleIcon />
        </button>
      </div>
      <div className="w-64 flex flex-col">
        <div>
          <div className="gap-1">
            <div className="text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-center flex-grow gap-3">
              <input
                disabled
                inputMode="decimal"
                step="0.0001"
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
                value="10.25"
                className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis foucs:outline-2 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded-2xl px-2 py-3 hover:bg-stone-500/50"
              />
              {inputPill}
            </div>
          </div>
        </div>

        <div className="flex text-stone-400 items-center gap-2">
          <div className="border-b-2 border-stone-600 grow"></div>

          <div className="rounded-full border-2 border-stone-600 w-8 h-8 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-8 h-8"
            >
              <path
                fillRule="evenodd"
                d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="border-b-2 border-stone-600 grow"></div>
        </div>

        <div>
          <div className="gap-1">
            <div className="text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-center flex-grow gap-3">
              <input
                disabled
                inputMode="decimal"
                step="0.0001"
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
                className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis foucs:outline-2 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded-2xl px-2 py-3 hover:bg-stone-500/50"
                value="10.23"
              />
              {outputPill}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <CoreContext.Provider
      value={{
        ...core,
        selectedStepChoice: {
          index: 0,
          recentlySelected: false,
          recentlyClosed: false,
        },
        selectedActionGroup: { name: 'curve', recentlySelected: false },
      }}
    >
      <StepChoiceEditor
        stepChoiceEditorCard={card}
        stepChoiceBreadCrumbs={
          <div className="flex justify-center items-center text-sm text-stone-500/75 pt-2 group-hover:text-stone-500 cursor-pointer text-4xl">
            click to view
          </div>
        }
        fadeIn="instant"
        layoutId="preview"
      />
    </CoreContext.Provider>
  )
}
