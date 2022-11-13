---
to: src/components/<%= component_name %>/<%= component_name %>.test.tsx
---
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import CoreProvider from '@component/CoreProvider'
import <%= component_name %> from './'

describe('Component: <%= component_name %>', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <CoreProvider>
        <<%= component_name %>/>
      </CoreProvider>
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
