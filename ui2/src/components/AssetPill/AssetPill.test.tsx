import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { catalog } from 'config'
import AssetPill from './'

describe('Component: AssetPill', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <AssetPill asset={catalog.curve.actions[0].input.asset} />,
    )

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
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
          <span
            class="text-xs text-stone-400 flex items-center gap-1"
          >
            <span>
              on Ethereum
            </span>
          </span>
        </div>
      </DocumentFragment>
    `)
  })
})
