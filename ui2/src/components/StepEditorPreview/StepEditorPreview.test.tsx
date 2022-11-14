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

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
