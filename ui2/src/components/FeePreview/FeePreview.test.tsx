import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import FeePreview from './'

describe('Component: FeePreview', () => {
  it('should render children', () => {
    const { asFragment } = render(<FeePreview />)

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          <div
            class="max-w-xs mx-auto rounded-xl overflow-hidden cursor-pointer group relative"
            style="--fmp-scale: 0;"
          >
            <div
              class="h-[52px]"
            >
               
            </div>
          </div>
        </div>
      </DocumentFragment>
    `)
  })
})
