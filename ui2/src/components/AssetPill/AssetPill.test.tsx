import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { catalog } from 'config'
import AssetPill from './'

describe('Component: AssetPill', () => {
  it('should render children', () => {
    const { asFragment } = render(
      <AssetPill asset={catalog.curve.actions[0].input.asset} />,
    )

    expect(asFragment()).toMatchInlineSnapshot()
  })
})
