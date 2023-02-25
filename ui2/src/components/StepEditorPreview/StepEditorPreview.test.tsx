import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CoreProvider from '@component/CoreProvider'
import StepEditorPreview from './'

describe('Component: StepEditorPreview', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <CoreProvider>
        <StepEditorPreview />
      </CoreProvider>,
    )

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="absolute top-0 right-0 left-0 bottom-0 z-20 !m-0"
        >
          <div
            class="bg-stone-800/75 absolute top-0 right-0 left-0 bottom-0 z-20 p-2 group cursor-pointer"
            style="opacity: 0; transform: none;"
          >
            <div
              class="flex justify-center items-center text-sm text-stone-500/75 pt-2 group-hover:text-stone-500 cursor-pointer text-4xl"
            >
              click to view
            </div>
          </div>
          <div
            class="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center"
          >
            <div
              class="flex items-center flex-col content-end space-y-5 z-30"
              style="opacity: 1;"
            >
              <div
                class="inline-flex bg-stone-700 py-2 px-2 rounded-xl shadow-md items-center justify-between group flex-col space-y-1 opacity-80"
              >
                <div
                  class="inline-flex items-center w-full justify-between"
                >
                  <div
                    class="inline-flex items-center"
                  >
                    <img
                      class="w-5 h-5"
                      src="https://curve.fi/favicon-32x32.png"
                    />
                    <div
                      class="text-stone-400 px-2"
                    >
                      Curve Swap
                    </div>
                  </div>
                  <button
                    class="w-8 h-8 p-2 -mt-2 -mb-2 -mr-3 box-content text-stone-500 cursor-pointer hover:text-stone-400 focus:outline-2"
                    type="reset"
                  >
                    <svg
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clip-rule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                        fill-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div
                  class="w-64 flex flex-col"
                >
                  <div>
                    <div
                      class="gap-1"
                    >
                      <div
                        class="text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-center flex-grow gap-3"
                      >
                        <input
                          autocomplete="off"
                          autocorrect="off"
                          class="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis foucs:outline-2 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded-2xl px-2 py-3 hover:bg-stone-500/50"
                          disabled=""
                          inputmode="decimal"
                          maxlength="79"
                          min="0"
                          minlength="1"
                          pattern="^\\\\d*(\\\\.\\\\d{0,2})?$"
                          placeholder="0.00"
                          spellcheck="false"
                          step="0.0001"
                          title="Token Amount"
                          type="text"
                          value="10.25"
                        />
                        <div
                          class="inline-flex flex-col items-start rounded-xl bg-stone-600 text-stone-300 py-1 px-2"
                        >
                          <div
                            class="inline-flex items-center space-x-2 font-medium text-lg"
                          >
                            <div
                              class="relative w-5 h-5"
                            >
                              <div
                                class="rounded-full overflow-hidden w-5 h-5 bg-stone-500"
                              >
                                <img
                                  class="w-full h-full"
                                  src="/usdc.svg"
                                />
                              </div>
                              <div
                                class="absolute rounded-full overflow-hidden w-3 h-3 bg-stone-500 -bottom-1 -right-1"
                              >
                                <img
                                  class="w-full h-full"
                                  src="/ethereum-chain.svg"
                                />
                              </div>
                            </div>
                            <span
                              class="inline-flex flex-col items-start font-medium"
                            >
                              <span>
                                USDC
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex text-stone-400 items-center gap-2"
                  >
                    <div
                      class="border-b-2 border-stone-600 grow"
                    />
                    <div
                      class="rounded-full border-2 border-stone-600 w-8 h-8 flex items-center justify-center"
                    >
                      <svg
                        class="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          clip-rule="evenodd"
                          d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z"
                          fill-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div
                      class="border-b-2 border-stone-600 grow"
                    />
                  </div>
                  <div>
                    <div
                      class="gap-1"
                    >
                      <div
                        class="text-2xl leading-7 tracking-[-0.01em] font-bold relative flex items-center flex-grow gap-3"
                      >
                        <input
                          autocomplete="off"
                          autocorrect="off"
                          class="relative font-bold outline-none border-none flex-auto overflow-hidden overflow-ellipsis placeholder-low-emphesis focus:placeholder-primary focus:placeholder:text-low-emphesis foucs:outline-2 flex-grow text-left bg-transparent placeholder:text-stone-400 text-stone-200 rounded-2xl px-2 py-3 hover:bg-stone-500/50"
                          disabled=""
                          inputmode="decimal"
                          maxlength="79"
                          min="0"
                          minlength="1"
                          pattern="^\\\\d*(\\\\.\\\\d{0,2})?$"
                          placeholder="0.00"
                          spellcheck="false"
                          step="0.0001"
                          title="Token Amount"
                          type="text"
                          value="10.23"
                        />
                        <div
                          class="inline-flex flex-col items-start rounded-xl bg-stone-600 text-stone-300 py-1 px-2"
                        >
                          <div
                            class="inline-flex items-center space-x-2 font-medium text-lg"
                          >
                            <div
                              class="relative w-5 h-5"
                            >
                              <div
                                class="rounded-full overflow-hidden w-5 h-5 bg-stone-500"
                              >
                                <img
                                  class="w-full h-full"
                                  src="https://app.aave.com/icons/tokens/usdt.svg"
                                />
                              </div>
                              <div
                                class="absolute rounded-full overflow-hidden w-3 h-3 bg-stone-500 -bottom-1 -right-1"
                              >
                                <img
                                  class="w-full h-full"
                                  src="/ethereum-chain.svg"
                                />
                              </div>
                            </div>
                            <span
                              class="inline-flex flex-col items-start font-medium"
                            >
                              <span>
                                USDT
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `)
  })
})
