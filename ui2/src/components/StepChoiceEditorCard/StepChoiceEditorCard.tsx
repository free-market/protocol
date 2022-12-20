import { useCore } from '@component/CoreProvider'
import { motion } from 'framer-motion'
import cx from 'classnames'
import AssetPill from '@component/AssetPill'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { Form, Field } from 'react-final-form'
import { catalog } from 'config'

export const StepChoiceEditorCard = (props: {
  forceHover?: boolean
  forceActive?: boolean
}): JSX.Element => {
  const { forceHover = false, forceActive = false } = props
  const staleCore = useCore()
  const onSubmit = () => {
    return staleCore.submitStepChoice()
  }

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ inputAmount: '1.00', outputAmount: '1.00' }}
      render={({ handleSubmit, submitting: formSubmitting, form }) => {
        const core = useCore()
        const submitting = core.submitting || formSubmitting
        const outputAmount = form.getFieldState('outputAmount')?.value
        const inputAmount = form.getFieldState('inputAmount')?.value
        const empty =
          (inputAmount == null || Number(inputAmount) === 0) &&
          (outputAmount == null || Number(outputAmount) === 0)

        const deselect = () => {
          core.escape()
        }

        const button = (
          <motion.button
            data-force-hover={forceHover}
            data-force-active={forceActive}
            disabled={submitting || empty}
            className={cx(
              'w-full text-stone-200 font-bold bg-sky-600 rounded-xl px-3 py-2 text-xl hover:bg-sky-500/75 active:bg-sky-700 force-hover:bg-sky-500/75 force-active:bg-sky-700 flex justify-center items-center overflow-hidden',
              {
                'cursor-not-allowed': submitting || empty,
                'opacity-50': empty,
              },
            )}
          >
            <div className="h-8">
              <div
                className="transition-all h-8"
                style={{
                  marginTop: submitting ? -77 : 2,
                  height: 'max-content',
                }}
              >
                <div className="flex items-center">Add Step</div>
              </div>
              <div className="transition-all h-8 mt-12">
                <span
                  className="border-2 border-transparent animate-spin inline-block w-8 h-8 border-4 rounded-full"
                  style={{ borderLeftColor: 'rgb(231 229 228)' }}
                />
              </div>
            </div>
          </motion.button>
        )

        if (core.selectedActionGroup == null) {
          throw new Error('selectedActionGroup required')
        }

        if (
          core.selectedStepChoice == null ||
          core.selectedStepChoice.recentlyClosed
        ) {
          return null
        }

        const action =
          catalog[core.selectedActionGroup.name].actions[
            core.selectedStepChoice?.index
          ]

        const inputPill = (
          <AssetPill asset={action.input.asset} network="not-included" />
        )

        const outputPill = (
          <AssetPill asset={action.output.asset} network="not-included" />
        )

        return (
          <form onSubmit={handleSubmit}>
            <motion.div className="inline-flex bg-stone-700 rounded-xl shadow-md items-center justify-between group flex-col space-y-5">
              <div
                className="inline-flex bg-stone-700 py-2 px-2 rounded-xl shadow-md items-center justify-between group flex-col space-y-5 transition-opacity"
                style={{
                  opacity:
                    core.selectedStepChoice &&
                    !core.selectedStepChoice.recentlyClosed &&
                    !core.selectedStepChoice.recentlySelected
                      ? 1
                      : 0,
                }}
              >
                <div className="inline-flex items-center w-full justify-between">
                  <div className="inline-flex items-center">
                    <img
                      src={catalog[core.selectedActionGroup.name].icon.url}
                      className="w-5 h-5"
                    />
                    <div className="text-stone-400 px-2">
                      {catalog[core.selectedActionGroup.name].title}{' '}
                      {action.title}
                    </div>
                  </div>

                  <button
                    type="reset"
                    className="w-8 h-8 p-2 -mt-2 -mb-2 -mr-3 box-content text-stone-500 cursor-pointer hover:text-stone-400 focus:outline-2"
                    onClick={deselect}
                  >
                    <XCircleIcon />
                  </button>
                </div>

                <>
                  <div className="w-64 flex flex-col space-y-1">
                    <div>
                      <Field
                        name="inputAmount"
                        render={({ input }) => (
                          <div className="gap-1">
                            <div className="text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-center flex-grow gap-3">
                              <input
                                disabled={submitting}
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
                                autoFocus
                                className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis focus:outline-2 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded-2xl px-2 py-3 hover:bg-stone-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent"
                                {...input}
                                onBlur={(event) => {
                                  const value = parseFloat(event.target.value)
                                  if (!isNaN(value)) {
                                    form.change('inputAmount', value.toFixed(2))
                                  }
                                  input.onBlur(event)
                                }}
                                onChange={(event) => {
                                  const value = parseFloat(event.target.value)
                                  if (!isNaN(value)) {
                                    form.change(
                                      'outputAmount',
                                      value.toFixed(2),
                                    )
                                  }
                                  input.onChange(event)
                                }}
                              />
                              {inputPill}
                            </div>
                          </div>
                        )}
                      />
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
                      <Field
                        name="outputAmount"
                        render={({ input }) => (
                          <div className="gap-1">
                            <div className="text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-center flex-grow gap-3">
                              <input
                                disabled={submitting}
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
                                className="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis foucs:outline-2 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded-2xl px-2 py-3 hover:bg-stone-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed disabled:!bg-transparent"
                                {...input}
                                onBlur={(event) => {
                                  const value = parseFloat(event.target.value)
                                  if (!isNaN(value)) {
                                    form.change(
                                      'outputAmount',
                                      value.toFixed(2),
                                    )
                                  }
                                  input.onBlur(event)
                                }}
                                onChange={(event) => {
                                  const value = parseFloat(event.target.value)
                                  if (!isNaN(value)) {
                                    form.change('inputAmount', value.toFixed(2))
                                  }
                                  input.onChange(event)
                                }}
                              />
                              {outputPill}
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </>
                {button}
              </div>
            </motion.div>
          </form>
        )
      }}
    />
  )
}
