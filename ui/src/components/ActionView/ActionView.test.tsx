import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { buildWorkflow } from 'utils'
import ActionView from './'

describe('Component: ActionView', () => {
  it('should render children', () => {
    const workflow = buildWorkflow()

    render(<ActionView step={workflow.steps[0]}>sentinel value</ActionView>)

    expect(screen.getByText('sentinel value')).toBeInTheDocument()
  })
})
