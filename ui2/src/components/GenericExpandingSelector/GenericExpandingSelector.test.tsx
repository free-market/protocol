import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import GenericExpandingSelector from './'

describe('Component: GenericExpandingSelector', () => {
  it('should render children', () => {
    const { asFragment } = render(<GenericExpandingSelector />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
