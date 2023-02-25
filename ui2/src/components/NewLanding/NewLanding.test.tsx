import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import NewLanding from './'

describe('Component: NewLanding', () => {
  it('should render children', () => {
    const { asFragment } = render(<NewLanding />)

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          class="bg-stone-900 min-h-screen flex flex-col"
        >
          <div
            class="h-24 flex justify-between"
          >
            <div
              class="h-24 flex items-center mx-5 gap-2"
            >
              <div
                class="border border-4 border-stone-500 rounded-full p-1"
              >
                <svg
                  class="w-5 h-5 stroke-stone-200"
                  id="svg2"
                  viewBox="0 0 750.00001 1200"
                >
                  <g
                    id="layer1"
                    transform="translate(0,147.63784)"
                  >
                    <path
                      d="M 118.93994,944.93135 C 408.3018,941.88962 361.81792,708.72632 359.17669,454.84232"
                      id="path4467"
                      style="fill: none; fill-rule: evenodd; stroke-width: 220; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 4; stroke-dasharray: none; stroke-opacity: 1;"
                    />
                    <path
                      d="m 112.56614,415.69241 527.59454,4e-5"
                      id="path4469"
                      style="fill: none; fill-rule: evenodd; stroke-width: 220; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 4; stroke-dasharray: none; stroke-opacity: 1;"
                    />
                    <path
                      d="m 638.86492,-33.109346 c -258.86492,0 -277.82254,152.733086 -277.82254,259.020506 0,1.46169 -0.048,22.72491 -0.0478,24.20899"
                      id="path4471"
                      style="fill: none; fill-rule: evenodd; stroke-width: 220; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 4; stroke-dasharray: none; stroke-opacity: 1;"
                    />
                  </g>
                </svg>
              </div>
              <span
                class="text-stone-200 font-bold text-xl tracking-tight"
              >
                freemarket
              </span>
            </div>
            <div
              class="h-24 flex items-center mx-5 gap-2"
            />
            <div
              class="h-24 flex items-center mx-5 gap-2"
            >
              <div
                class="w-full text-stone-500 flex gap-2 font-semibold"
              >
                <a
                  class="inline-block relative transition-all transition-1000 text-stone-200"
                  href="#"
                >
                  <div
                    class="absolute left-0 right-0 bottom-0 -bottom-1 mx-auto w-5 rounded border-t-2 border-stone-200"
                  />
                  About
                </a>
                <a
                  class="inline-block relative transition-all transition-1000 hover:text-stone-400"
                  href="https://docs.fmprotocol.com"
                >
                  Docs
                </a>
                <a
                  class="inline-block relative transition-all transition-1000 hover:text-stone-400"
                  href="https://medium.com/free-market-labs"
                >
                  Blog
                </a>
              </div>
            </div>
          </div>
          <div
            class="grow mx-auto max-w-6xl text-center text-[5rem] font-semibold tracking-[-1.6px] text-stone-200 flex items-center select-none"
          >
            <span>
              <span>
                Free Market is a better way to build cross-chain workflows.
              </span>
               
              <a
                class="cursor-pointer hover:text-stone-200 active:text-stone-400 text-stone-500 inline-flex items-start leading-tight hover:underline"
              >
                Try our first app.
                <svg
                  aria-hidden="true"
                  class="w-10 h-10 inline-block"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clip-rule="evenodd"
                    d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                    fill-rule="evenodd"
                  />
                  <path
                    clip-rule="evenodd"
                    d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                    fill-rule="evenodd"
                  />
                </svg>
              </a>
            </span>
          </div>
          <div
            class="max-w-2xl mx-auto flex justify-between items-start gap-10 py-20"
          >
            <div
              class="inline-flex rounded-full items-center bg-stone-200 text-stone-700 font-semibold px-8 py-3 gap-2 border border-transparent"
            >
              <span>
                VIEW DOCS
              </span>
              <svg
                aria-hidden="true"
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  fill-rule="evenodd"
                />
              </svg>
            </div>
            <div
              class="inline-flex rounded-full items-center text-stone-200 font-semibold px-8 py-3 gap-2 border border-stone-200"
            >
              <span>
                GET EARLY ACCESS
              </span>
              <svg
                aria-hidden="true"
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  fill-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </DocumentFragment>
    `)
  })
})
