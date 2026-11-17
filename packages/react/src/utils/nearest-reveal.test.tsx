import { render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useNearestReveal } from './nearest-reveal';

function Collection() {
  const ref = useRef<HTMLUListElement>(null);
  useNearestReveal(ref);
  return (
    <ul ref={ref} data-testid="root">
      <li>Inbox</li>
    </ul>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useNearestReveal', () => {
  it("turns React Aria's centring reveal of the root into the nearest one", () => {
    const reveal = vi.fn();
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(reveal);
    const { getByTestId } = render(<Collection />);
    const root = getByTestId('root');
    root.scrollIntoView({ block: 'center', inline: 'center' });
    expect(reveal).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
    expect(reveal.mock.contexts[0]).toBe(root);
    // Other elements keep the browser's own.
    root.querySelector('li')!.scrollIntoView({ block: 'center' });
    expect(reveal).toHaveBeenLastCalledWith({ block: 'center' });
  });

  it('gives the root back its own scrollIntoView when it unmounts', () => {
    const { getByTestId, unmount } = render(<Collection />);
    const root = getByTestId('root');
    expect(Object.hasOwn(root, 'scrollIntoView')).toBe(true);
    unmount();
    expect(Object.hasOwn(root, 'scrollIntoView')).toBe(false);
  });
});
