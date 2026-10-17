import { act, render } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSizeTransform } from './use-size-transform';

function View() {
  const [mode, setMode] = useState<'calendar' | 'input'>('calendar');
  const { attach, capture } = useSizeTransform<HTMLDivElement>(mode);
  return (
    <div ref={attach} data-testid="view">
      <button
        type="button"
        onClick={() => {
          capture();
          setMode('input');
        }}
      >
        Switch
      </button>
    </div>
  );
}

describe('useSizeTransform', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // 2026-10-17: a browser can skip transitionend (a background tab, a dropped frame), which
  // left the picker fixed at its inline height.
  it('drops its inline styles once the spring has had time, even without transitionend', () => {
    vi.useFakeTimers();
    // The calendar's height as the switch is captured, then the text input's.
    const heights = [512, 220];
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ height: heights.length > 1 ? heights.shift()! : heights[0] }) as DOMRect,
    );
    const { getByRole, getByTestId } = render(<View />);
    const original = window.getComputedStyle;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style = original(element);
      return new Proxy(style, {
        get: (target, key) =>
          key === 'transitionDuration' ? '0.5s' : Reflect.get(target, key, target),
      });
    });
    act(() => getByRole('button').click());
    const view = getByTestId('view');
    expect(view.style.height).toBe('220px');
    act(() => vi.advanceTimersByTime(650));
    expect(view.style.height).toBe('');
    expect(view.style.overflow).toBe('');
    expect(view.style.transition).toBe('');
  });
});
