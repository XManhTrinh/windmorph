import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Surface, surfaceStyles } from './Surface';

describe('Surface', () => {
  it('defaults to a flat surface', () => {
    render(<Surface data-testid="surface" />);
    expect(screen.getByTestId('surface')).toHaveClass(
      'bg-surface',
      'text-on-surface',
      'shadow-elevation-0',
      'rounded-corner-none',
    );
  });

  it('applies container, elevation and shape', () => {
    render(
      <Surface
        data-testid="surface"
        container="surface-container-high"
        elevation={3}
        shape="extra-large"
      />,
    );
    expect(screen.getByTestId('surface')).toHaveClass(
      'bg-surface-container-high',
      'shadow-elevation-3',
      'rounded-corner-extra-large',
    );
  });

  it('puts className, style and ref on the outer element and lets consumer classes win', () => {
    let element: HTMLDivElement | null = null;
    render(
      <Surface
        ref={(node) => {
          element = node;
        }}
        data-testid="surface"
        elevation={2}
        className="fixed shadow-elevation-5 bg-primary"
        style={{ top: 4 }}
      />,
    );
    const surface = screen.getByTestId('surface');
    expect(element).toBe(surface);
    expect(surface).toHaveClass('fixed', 'shadow-elevation-5', 'bg-primary');
    expect(surface).not.toHaveClass('shadow-elevation-2');
    expect(surface).not.toHaveClass('bg-surface');
    expect(surface).toHaveStyle({ top: '4px' });
  });

  it('exposes extendable variant definitions', () => {
    expect(surfaceStyles({ container: 'inverse-surface' })).toContain('bg-inverse-surface');
  });
});
