import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { LoadingIndicator } from './LoadingIndicator';
import {
  determinateFrame,
  framePath,
  frameTransform,
  getDeterminateShapes,
  prepareShapes,
} from './loading-indicator-frames';

const pathOf = (root: HTMLElement) => root.querySelector('path')!;

describe('LoadingIndicator', () => {
  it('is an indeterminate, named progressbar by default', async () => {
    const { container } = render(<LoadingIndicator aria-label="Loading messages" />);
    const indicator = screen.getByRole('progressbar', { name: 'Loading messages' });
    expect(indicator).not.toHaveAttribute('aria-valuenow');
    expect(indicator).toHaveAttribute('data-indeterminate', 'true');
    expect(indicator).toHaveClass('size-12', 'rounded-corner-full', 'text-primary');
    expect(indicator.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('morphs and rotates while indeterminate', async () => {
    render(<LoadingIndicator aria-label="Loading" />);
    const path = pathOf(screen.getByRole('progressbar'));
    const first = path.getAttribute('d');
    const firstTransform = path.parentElement!.getAttribute('transform');
    await waitFor(() => {
      expect(path.getAttribute('d')).not.toBe(first);
      expect(path.parentElement!.getAttribute('transform')).not.toBe(firstTransform);
    });
  });

  it('shows determinate progress', async () => {
    const { container, rerender } = render(<LoadingIndicator value={0.4} aria-label="Uploading" />);
    const indicator = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(indicator).toHaveAttribute('aria-valuenow', '0.4');
    expect(indicator).toHaveAttribute('aria-valuemin', '0');
    expect(indicator).toHaveAttribute('aria-valuemax', '1');
    expect(indicator).toHaveAttribute('aria-valuetext', '40%');
    expect(indicator).not.toHaveAttribute('data-indeterminate');

    const prepared = prepareShapes(getDeterminateShapes(), false);
    const frame = determinateFrame(0.4, 1);
    expect(pathOf(indicator)).toHaveAttribute('d', framePath(prepared, frame));
    expect(pathOf(indicator).parentElement).toHaveAttribute('transform', frameTransform(frame));

    rerender(<LoadingIndicator value={1} aria-label="Uploading" />);
    expect(pathOf(indicator)).toHaveAttribute('d', framePath(prepared, determinateFrame(1, 1)));
    expect(await axeViolations(container)).toEqual([]);
  });

  it('draws a contained indicator on a primary-container circle', () => {
    render(<LoadingIndicator variant="contained" aria-label="Loading" />);
    expect(screen.getByRole('progressbar')).toHaveClass(
      'bg-primary-container',
      'text-on-primary-container',
    );
  });

  it('uses custom shapes', () => {
    render(<LoadingIndicator value={0} shapes={['Heart', 'Square']} aria-label="Loading" />);
    const prepared = prepareShapes(['Heart', 'Square'], false);
    expect(pathOf(screen.getByRole('progressbar'))).toHaveAttribute(
      'd',
      framePath(prepared, determinateFrame(0, 1)),
    );
  });

  it('puts className, style, data-* and ref on the root and classNames on the svg', () => {
    let node: HTMLDivElement | null = null;
    render(
      <LoadingIndicator
        aria-label="Loading"
        ref={(el) => {
          node = el;
        }}
        className="fixed size-24"
        style={{ top: 4 }}
        data-testid="indicator"
        classNames={{ root: 'opacity-80', indicator: 'text-tertiary' }}
      />,
    );
    const root = screen.getByTestId('indicator');
    expect(root).toBe(node);
    expect(root).toHaveClass('fixed', 'size-24', 'opacity-80');
    expect(root).not.toHaveClass('size-12');
    expect(root).toHaveStyle({ top: '4px' });
    expect(root.querySelector('svg')).toHaveClass('size-full', 'fill-current', 'text-tertiary');
  });

  it('accepts aria-labelledby', () => {
    render(
      <>
        <span id="label">Syncing</span>
        <LoadingIndicator aria-labelledby="label" />
      </>,
    );
    expect(screen.getByRole('progressbar', { name: 'Syncing' })).toBeInTheDocument();
  });
});
