import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider';

/** A 200px track at x 0–200 (jsdom lays nothing out). */
function setup(onChangeEnd = vi.fn()) {
  render(
    <Slider aria-label="Volume" defaultValue={80} onChangeEnd={onChangeEnd} data-testid="s" />,
  );
  const track = screen.getByTestId('s').firstElementChild as HTMLElement;
  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 44 }),
  );
  const input = screen.getByRole('slider', { name: 'Volume' });
  return { track, input, onChangeEnd };
}

const touch = (type: string, x: number, y: number) =>
  new PointerEvent(type, {
    pointerId: 7,
    pointerType: 'touch',
    clientX: x,
    clientY: y,
    bubbles: true,
  });

describe('Slider touch on the track', () => {
  it('lets the page scroll horizontal sliders vertically and vertical ones sideways', () => {
    const { track } = setup();
    expect(track.style.touchAction).toBe('pan-y');
    expect(screen.getByTestId('s')).toHaveClass('touch-pan-y');
  });

  it('leaves the value alone when a vertical swipe starts on the track', () => {
    const { track, input, onChangeEnd } = setup();
    fireEvent(track, touch('pointerdown', 100, 20));
    expect(input).toHaveValue('80');
    act(() => {
      window.dispatchEvent(touch('pointermove', 101, 0));
      window.dispatchEvent(touch('pointermove', 102, -60));
      // The browser scrolls and cancels the pointer.
      window.dispatchEvent(touch('pointercancel', 102, -60));
    });
    expect(input).toHaveValue('80');
    expect(onChangeEnd).not.toHaveBeenCalled();
  });

  it("isn't a tap after a move across the track, even if nothing cancels the pointer", () => {
    const { track, input } = setup();
    fireEvent(track, touch('pointerdown', 100, 20));
    act(() => {
      window.dispatchEvent(touch('pointermove', 100, 60));
      window.dispatchEvent(touch('pointerup', 100, 60));
    });
    expect(input).toHaveValue('80');
  });

  it('sets the value on release after a tap', () => {
    const { track, input, onChangeEnd } = setup();
    fireEvent(track, touch('pointerdown', 50, 20));
    expect(input).toHaveValue('80');
    act(() => window.dispatchEvent(touch('pointerup', 50, 20)));
    expect(input).toHaveValue('25');
    expect(onChangeEnd).toHaveBeenCalledWith(25);
  });

  // The gesture kept the state of the render it began in (2026-11-16).
  it('drops a tap still pending when the slider turns off, and reads the range as it is now', () => {
    const onChangeEnd = vi.fn();
    const { rerender } = render(
      <Slider aria-label="Level" defaultValue={80} onChangeEnd={onChangeEnd} data-testid="t" />,
    );
    const track = screen.getByTestId('t').firstElementChild as HTMLElement;
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 44 }),
    );
    fireEvent(track, touch('pointerdown', 50, 20));
    rerender(
      <Slider
        aria-label="Level"
        defaultValue={80}
        onChangeEnd={onChangeEnd}
        data-testid="t"
        disabled
      />,
    );
    rerender(
      <Slider aria-label="Level" defaultValue={80} onChangeEnd={onChangeEnd} data-testid="t" />,
    );
    act(() => window.dispatchEvent(touch('pointerup', 50, 20)));
    expect(onChangeEnd).not.toHaveBeenCalled();
    // A range that changes while a finger is down: the tap lands on the new one.
    fireEvent(track, touch('pointerdown', 50, 20));
    rerender(
      <Slider
        aria-label="Level"
        defaultValue={80}
        max={200}
        onChangeEnd={onChangeEnd}
        data-testid="t"
      />,
    );
    act(() => window.dispatchEvent(touch('pointerup', 50, 20)));
    expect(onChangeEnd).toHaveBeenCalledWith(50);
  });

  it('drags the thumb once the touch moves along the track', () => {
    const { track, input, onChangeEnd } = setup();
    fireEvent(track, touch('pointerdown', 100, 20));
    act(() => window.dispatchEvent(touch('pointermove', 104, 20)));
    expect(input).toHaveValue('80');
    act(() => window.dispatchEvent(touch('pointermove', 120, 22)));
    expect(input).toHaveValue('60');
    act(() => window.dispatchEvent(touch('pointermove', 160, 22)));
    expect(input).toHaveValue('80');
    act(() => window.dispatchEvent(touch('pointerup', 160, 22)));
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
  });
});
