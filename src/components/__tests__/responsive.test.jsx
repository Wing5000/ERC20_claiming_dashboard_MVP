import { render } from '@testing-library/react';
import TokenSummary from '../TokenSummary.jsx';
import { describe, it, expect } from 'vitest';

// basic layout check at small viewport width

describe('responsive layout', () => {
  it('fits within 360px without horizontal overflow', () => {
    const { container } = render(
      <div style={{ width: 360 }}>
        <TokenSummary name="Sample" symbol="SMP" progress={50} />
      </div>
    );
    const root = container.firstChild;
    expect(root.scrollWidth).toBeLessThanOrEqual(360);
  });
});
