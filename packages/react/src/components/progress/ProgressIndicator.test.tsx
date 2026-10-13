import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { CircularProgressIndicator, LinearProgressIndicator } from './ProgressIndicator';

describe('LinearProgressIndicator', () => {
  it('is a determinate progressbar with a track, an active line and a stop dot', async () => {
    const { container } = render(<LinearProgressIndicator value={0.25} aria-label="Uploading" />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar).toHaveAttribute('aria-valuenow', '0.25');
    expect(bar).toHaveAttribute('aria-valuetext', '25%');
    expect(bar).toHaveClass('w-[240px]', 'h-[4px]');
    const [track, active] = [...bar.querySelectorAll('path')];
    expect(track).toHaveClass('stroke-secondary-container');
    expect(active).toHaveClass('stroke-primary');
    // jsdom has no layout, so the default 240px width is used.
    expect(active).toHaveAttribute('d', 'M2 2L60 2');
    expect(bar.querySelector('circle')).toHaveAttribute('cx', '238');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('can hide the stop dot and be wavy', () => {
    render(<LinearProgressIndicator value={0.5} wavy stopIndicator={false} aria-label="Wavy" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('h-[10px]');
    expect(bar.querySelector('circle')).toBeNull();
    expect(bar.querySelectorAll('path')[1]!.getAttribute('d')).toContain('Q');
  });

  it('animates two lines when indeterminate', async () => {
    render(<LinearProgressIndicator aria-label="Loading" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-indeterminate', 'true');
    const second = bar.querySelectorAll('path')[1]!;
    const first = second.getAttribute('d');
    await waitFor(() => expect(second.getAttribute('d')).not.toBe(first));
  });

  it('puts className, style and data-* on the root', () => {
    render(
      <LinearProgressIndicator
        value={0.1}
        aria-label="x"
        className="w-full"
        style={{ marginTop: 2 }}
        data-testid="bar"
      />,
    );
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveClass('w-full');
    expect(bar).not.toHaveClass('w-[240px]');
    expect(bar).toHaveStyle({ marginTop: '2px' });
  });
});

describe('CircularProgressIndicator', () => {
  it('draws an arc from 12 o’clock over a gapped track', async () => {
    const { container } = render(<CircularProgressIndicator value={0.5} aria-label="Syncing" />);
    const ring = screen.getByRole('progressbar', { name: 'Syncing' });
    expect(ring).toHaveClass('size-[40px]');
    const [track, active] = [...ring.querySelectorAll('path')];
    expect(active).toHaveAttribute('stroke-dasharray', '0.5 1');
    expect(active).toHaveAttribute('pathLength', '1');
    expect(Number(track!.getAttribute('stroke-dashoffset'))).toBeCloseTo(
      -(0.5 + 8 / (Math.PI * 40)),
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('hides the arc at 0 and is 48px when wavy', () => {
    const { rerender } = render(<CircularProgressIndicator value={0} aria-label="x" />);
    expect(screen.getByRole('progressbar').querySelectorAll('path')).toHaveLength(1);
    rerender(<CircularProgressIndicator value={0.4} wavy aria-label="x" />);
    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveClass('size-[48px]');
    const active = ring.querySelectorAll('path')[1]!;
    expect(active).toHaveAttribute('pathLength', '2');
    expect(active).toHaveAttribute('stroke-dasharray', '0.4 2');
  });
});
