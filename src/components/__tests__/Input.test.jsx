import { render } from '@testing-library/react';
import Input from '../Input.jsx';
import { describe, it, expect } from 'vitest';

// simple verification of default styling and textarea support

describe('Input', () => {
  it('renders input with default classes', () => {
    const { container } = render(<Input />);
    const input = container.firstChild;
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveClass(
      'rounded-xl',
      'border',
      'border-black/10',
      'dark:border-white/10'
    );
  });

  it('supports textarea and class overrides', () => {
    const { container } = render(<Input as="textarea" className="min-h-[96px]" />);
    const textarea = container.firstChild;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveClass('min-h-[96px]');
  });
});
