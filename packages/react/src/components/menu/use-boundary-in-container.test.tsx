import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBoundaryInContainer } from './use-boundary-in-container';

/** A popover in `container`, kept within it by a stand-in; counts its renders. */
function Placed({ container, rendered }: { container: Element; rendered: () => void }) {
  const popoverRef = useRef<HTMLDivElement>(null);
  rendered();
  useBoundaryInContainer(container, popoverRef);
  return createPortal(
    <div ref={popoverRef}>
      <div data-testid="list" />
    </div>,
    container,
  );
}

/** A scroll pane holding a positioned container, in the page. */
function setUp() {
  const pane = document.body.appendChild(document.createElement('div'));
  pane.style.overflow = 'auto';
  const container = pane.appendChild(document.createElement('div'));
  container.style.position = 'relative';
  const rendered = vi.fn();
  const view = render(<Placed container={container} rendered={rendered} />);
  // The stand-in is placed as the popover mounts: one measure of the container per placement.
  const measures = vi.spyOn(window, 'getComputedStyle');
  const placements = () => measures.mock.calls.filter(([element]) => element === container).length;
  return { pane, container, rendered, placements, view };
}

const nextFrame = () =>
  act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe('useBoundaryInContainer', () => {
  it('places the stand-in once a frame as things around it scroll, and never for the popover’s own', async () => {
    const { pane, container, placements } = setUp();
    // The menu's own list scrolling moves nothing around it.
    container.querySelector('[data-testid="list"]')!.dispatchEvent(new Event('scroll'));
    await nextFrame();
    expect(placements()).toBe(0);
    // A pane scrolling several times in a frame: one placement, as the frame starts.
    for (let i = 0; i < 5; i++) pane.dispatchEvent(new Event('scroll'));
    expect(placements()).toBe(0);
    await nextFrame();
    expect(placements()).toBe(1);
  });

  it('renders again on a window resize only when what shows of the container changed', () => {
    const { rendered } = setUp();
    const renders = rendered.mock.calls.length;
    // jsdom lays nothing out, so the container's box is the same after each resize.
    for (let i = 0; i < 5; i++) window.dispatchEvent(new Event('resize'));
    expect(rendered.mock.calls.length).toBe(renders);
  });
});
