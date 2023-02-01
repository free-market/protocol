import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import FeePreview from './'

describe('Component: FeePreview', () => {
  it('should render children', () => {
    const { asFragment } = render(<FeePreview />)

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
