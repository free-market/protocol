import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CoreProvider from '@component/CoreProvider'
import CrossChainJobCard from './'

describe('Component: CrossChainJobCard', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <CoreProvider>
        <CrossChainJobCard />
      </CoreProvider>,
    )

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="min-w-[20rem] w-full !rounded-xl shadow-md text-stone-200 font-medium p-2 max-w-xs mx-auto space-y-2 overflow-hidden cursor-pointer group relative"
          style="--fmp-scale: 0;"
        >
          <div
            class="absolute inset-0 pointer-events-none group-hover:bg-stone-900/10 group-active:bg-stone-900/25 z-50"
          />
          <div
            class="absolute inset-0 -top-2 pointer-events-none bg-stone-600 z-10"
          />
          <div
            class="relative flex justify-between !my-2 z-20"
          >
            <div
              class="text-lg leading-none"
            >
              Transfer
            </div>
            <div
              class="w-6 h-6 rounded-full"
            >
              <svg
                aria-hidden="true"
                class="text-stone-400 w-5 h-5"
                fill="currentColor"
                style="transform: scale(var(--fmp-scale));"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                  fill-rule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div
            class="!m-0 relative z-20"
          />
          <div
            class="flex items-stretch gap-2 pt-2 !mt-0 relative z-20"
          >
            <div
              class="basis-1/2 space-y-2 flex flex-col"
            >
              <div
                class="text-xs font-light leading-none text-left"
              >
                STATUS
              </div>
              <div
                class="grow flex items-end h-3 leading-none"
              >
                completed
              </div>
            </div>
            <div
              class="basis-1/2 space-y-2"
            >
              <div
                class="text-xs font-light leading-none text-left"
              >
                TRANSACTION
              </div>
              <div
                class="flex flex-col justify-end gap-1"
              >
                <div
                  class="flex flex-col gap-1"
                >
                  <div
                    class="relative"
                  >
                    <div
                      class="absolute left-0 top-0 bottom-0 flex items-center"
                    />
                    <div
                      class="pl-2 flex items-center gap-2"
                    >
                      <div
                        class="rounded bg-[#627eea] w-[calc(100%-2rem)] h-4 flex justify-between relative overflow-hidden border border-stone-600"
                      >
                        <div />
                        <div
                          class=""
                        >
                          <div
                            class="h-4 mx-4 overflow-hidden flex items-center"
                          >
                            <div
                              class="w-6 h-6 relative"
                            >
                              <img
                                class="w-full h-full"
                                src="https://app.aave.com/icons/networks/ethereum.svg"
                                style="opacity: 0;"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <svg
                        class="stroke-emerald-400/90 w-4 h-4"
                        style="transform: translateY(100%); transform-origin: 0px 0px;"
                        transform-origin="0px 0px"
                        viewBox="0 0 50 50"
                      >
                        <path
                          class="stroke-emerald-400/90"
                          d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
                          fill="none"
                          stroke-width="3"
                          style="transform: translateX(5px) translateY(4px); transform-origin: 0px 0px;"
                          transform-origin="0px 0px"
                        />
                        <path
                          class="stroke-emerald-400/90"
                          d="M14,26 L 22,33 L 35,16"
                          fill="none"
                          pathLength="1"
                          stroke-dasharray="0.2px 1px"
                          stroke-dashoffset="0px"
                          stroke-width="3"
                        />
                      </svg>
                    </div>
                  </div>
                  <div
                    class="relative"
                  >
                    <div
                      class="absolute left-0 top-0 bottom-0 flex items-center"
                    />
                    <div
                      class="pl-2 flex items-center gap-2"
                    >
                      <div
                        class="rounded bg-[#399fe7] w-[calc(100%-2rem)] h-4 flex justify-between relative overflow-hidden border border-stone-600"
                      >
                        <div />
                        <div
                          class=""
                        >
                          <div
                            class="h-4 mx-4 overflow-hidden flex items-center"
                          >
                            <div
                              class="w-6 h-6 relative"
                            >
                              <img
                                class="w-full h-full"
                                src="https://app.aave.com/icons/networks/arbitrum.svg"
                                style="opacity: 0;"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <svg
                        class="stroke-emerald-400/90 w-4 h-4"
                        style="transform: translateY(100%); transform-origin: 0px 0px;"
                        transform-origin="0px 0px"
                        viewBox="0 0 50 50"
                      >
                        <path
                          class="stroke-emerald-400/90"
                          d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
                          fill="none"
                          stroke-width="3"
                          style="transform: translateX(5px) translateY(4px); transform-origin: 0px 0px;"
                          transform-origin="0px 0px"
                        />
                        <path
                          class="stroke-emerald-400/90"
                          d="M14,26 L 22,33 L 35,16"
                          fill="none"
                          pathLength="1"
                          stroke-dasharray="0.2px 1px"
                          stroke-dashoffset="0px"
                          stroke-width="3"
                        />
                      </svg>
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
