import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ScriptEditor from './'

describe('Component: ScriptEditor', () => {
  it('should render children', () => {
    render(<ScriptEditor snippet="">sentinel value</ScriptEditor>)

    expect(screen.getByText('sentinel value')).toBeInTheDocument()
  })
})
