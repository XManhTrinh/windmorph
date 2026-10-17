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
    expect(bar).toHaveClass('w-[240px]');
    expect(bar).toHaveStyle({ '--m3-progress-height': '4px' });
    const [track, active] = [...bar.querySelectorAll('path')];
    expect(bar).toHaveAttribute('data-tokens', 'md-comp-progress-indicator');
    expect(track).toHaveClass('stroke-[var(--_md-comp-progress-indicator-track-color)]');
    expect(active).toHaveClass(
      'stroke-[var(--_md-comp-progress-indicator-active-indicator-color)]',
    );
    expect(bar.querySelector('circle')).toHaveClass(
      'fill-[var(--_md-comp-progress-indicator-stop-indicator-color)]',
    );
    // jsdom has no layout, so the default 240px width is used.
    expect(active).toHaveAttribute('d', 'M2 2L60 2');
    expect(bar.querySelector('circle')).toHaveAttribute('cx', '238');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('can hide the stop dot and be wavy', () => {
    render(<LinearProgressIndicator value={0.5} wavy stopIndicator={false} aria-label="Wavy" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle({ '--m3-progress-height': '10px' });
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

describe('LinearProgressIndicator thickness and track', () => {
  it('takes the spec’s thick configuration, growing to fit the strokes and the wave', () => {
    render(<LinearProgressIndicator value={0.5} wavy thickness={8} aria-label="Thick" />);
    const bar = screen.getByRole('progressbar');
    // 8px strokes plus 3px of wave either side (Compose's thick sample is 14px).
    expect(bar).toHaveStyle({ '--m3-progress-height': '14px' });
    const [track, active] = [...bar.querySelectorAll('path')];
    expect(track).toHaveAttribute('stroke-width', '8');
    expect(active).toHaveAttribute('stroke-width', '8');
  });

  it('sets the track’s thickness on its own', () => {
    render(<LinearProgressIndicator value={0.5} thickness={4} trackThickness={8} aria-label="x" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveStyle({ '--m3-progress-height': '8px' });
    const [track, active] = [...bar.querySelectorAll('path')];
    expect(track).toHaveAttribute('stroke-width', '8');
    expect(active).toHaveAttribute('stroke-width', '4');
  });

  it('can drop the track and its stop dot, for use inside a button', () => {
    render(
      <LinearProgressIndicator
        value={0.5}
        track={false}
        classNames={{ indicator: 'stroke-current' }}
        aria-label="x"
      />,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar.querySelector('[data-slot="track"]')).toBeNull();
    expect(bar.querySelector('circle')).toBeNull();
    expect(bar.querySelector('path')).toHaveClass('stroke-current');
    expect(bar.querySelector('path')).not.toHaveClass(
      'stroke-[var(--_md-comp-progress-indicator-active-indicator-color)]',
    );
  });

  it('eases the moving line into the value when it arrives', async () => {
    const { rerender } = render(<LinearProgressIndicator aria-label="Loading" />);
    const first = screen.getByRole('progressbar').querySelectorAll('path')[1]!;
    await waitFor(() => expect(first.getAttribute('d')).not.toBe('M2 2L2 2'));
    rerender(<LinearProgressIndicator value={0.5} aria-label="Loading" />);
    // The handoff settles on the determinate line (0 to 50% of 240px).
    await waitFor(() => expect(first.getAttribute('d')).toBe('M2 2L120 2'), { timeout: 2000 });
  });
});

describe('CircularProgressIndicator', () => {
  it('is indeterminate without a value, flat or wavy, turning over a track', async () => {
    const { container, rerender } = render(<CircularProgressIndicator aria-label="Loading" />);
    const ring = screen.getByRole('progressbar', { name: 'Loading' });
    expect(ring).not.toHaveAttribute('aria-valuenow');
    expect(ring).toHaveAttribute('data-indeterminate', 'true');
    expect(ring).toHaveAttribute('data-tokens', 'md-comp-progress-indicator');
    const [track, active] = [...ring.querySelectorAll('path')];
    expect(track).toHaveClass('stroke-[var(--_md-comp-progress-indicator-track-color)]');
    // The arc starts at 10% of the ring.
    expect(active).toHaveAttribute('stroke-dasharray', '0.1 1');
    const group = ring.querySelector('g')!;
    const before = group.getAttribute('transform');
    await waitFor(() => expect(group.getAttribute('transform')).not.toBe(before));
    expect(await axeViolations(container)).toEqual([]);
    rerender(<CircularProgressIndicator wavy aria-label="Loading" />);
    expect(ring).toHaveStyle({ '--m3-progress-size': '48px' });
    expect(ring.querySelectorAll('path')[1]).toHaveAttribute('pathLength', '2');
  });

  it('is not mirrored in right-to-left layouts', () => {
    render(
      <div dir="rtl">
        <CircularProgressIndicator value={0.3} aria-label="x" />
      </div>,
    );
    expect(screen.getByRole('progressbar').querySelector('svg')!.getAttribute('class')).not.toMatch(
      /rtl:/,
    );
  });

  it('takes the thick configuration: 44px flat, 52px wavy', () => {
    const { rerender } = render(
      <CircularProgressIndicator value={0.5} thickness={8} aria-label="x" />,
    );
    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveStyle({ '--m3-progress-size': '44px' });
    expect(ring.querySelector('path')).toHaveAttribute('stroke-width', '8');
    rerender(<CircularProgressIndicator value={0.5} wavy thickness={8} aria-label="x" />);
    expect(ring).toHaveStyle({ '--m3-progress-size': '52px' });
  });

  it('can drop the track', () => {
    render(<CircularProgressIndicator value={0.5} track={false} aria-label="x" />);
    expect(screen.getByRole('progressbar').querySelectorAll('path')).toHaveLength(1);
  });

  it('draws an arc from 12 o’clock over a gapped track', async () => {
    const { container } = render(<CircularProgressIndicator value={0.5} aria-label="Syncing" />);
    const ring = screen.getByRole('progressbar', { name: 'Syncing' });
    expect(ring).toHaveStyle({ '--m3-progress-size': '40px' });
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
    expect(screen.getByRole('progressbar').querySelectorAll('path')[1]).toHaveAttribute(
      'visibility',
      'hidden',
    );
    rerender(<CircularProgressIndicator value={0.4} wavy aria-label="x" />);
    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveStyle({ '--m3-progress-size': '48px' });
    const active = ring.querySelectorAll('path')[1]!;
    expect(active).toHaveAttribute('pathLength', '2');
    expect(active).toHaveAttribute('stroke-dasharray', '0.4 2');
  });

  it('takes a size from 24 to 240px, keeping the strokes’ thickness', () => {
    const { rerender } = render(
      <CircularProgressIndicator value={0.5} size={120} aria-label="x" />,
    );
    const ring = screen.getByRole('progressbar');
    expect(ring).toHaveStyle({ '--m3-progress-size': '120px' });
    expect(ring.querySelector('svg')).toHaveAttribute('viewBox', '0 0 120 120');
    for (const path of ring.querySelectorAll('path')) {
      expect(path).toHaveAttribute('stroke-width', '4');
    }
    // Clamped to the spec's range.
    rerender(<CircularProgressIndicator value={0.5} size={8} aria-label="x" />);
    expect(ring).toHaveStyle({ '--m3-progress-size': '24px' });
    rerender(
      <CircularProgressIndicator value={0.5} size={400} wavy thickness={8} aria-label="x" />,
    );
    expect(ring).toHaveStyle({ '--m3-progress-size': '240px' });
    expect(ring.querySelector('path')).toHaveAttribute('stroke-width', '8');
    // Without it, the defaults.
    rerender(<CircularProgressIndicator value={0.5} aria-label="x" />);
    expect(ring).toHaveStyle({ '--m3-progress-size': '40px' });
  });
});
