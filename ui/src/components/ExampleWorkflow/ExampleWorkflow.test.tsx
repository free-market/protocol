import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ExampleWorkflow from './'

describe('Component: ExampleWorkflow', () => {
  it('should render children', () => {
    render(<ExampleWorkflow initialStageNumber={0}>sentinel value</ExampleWorkflow>)

    expect(screen.getByText('sentinel value')).toBeInTheDocument()
  })
})
