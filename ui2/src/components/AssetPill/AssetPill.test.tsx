import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import AssetPill from './';

describe('Component: AssetPill', () => {
  it('should render children', () => {
    const { asFragment } = render(<AssetPill />)

    expect(asFragment()).toMatchInlineSnapshot()
  });
});
