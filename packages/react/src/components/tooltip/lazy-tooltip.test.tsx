import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** How many times the `Tooltip` module has been loaded in the current test. */
let loads = 0;

const Star = () => <svg viewBox="0 0 24 24" />;

/**
 * React Aria counts a hover only once a pointer move has set the interaction modality;
 * user-event's hover fires pointerenter before any move.
 */
async function hover(element: Element) {
  fireEvent.pointerMove(document.body);
  await userEvent.hover(element);
}

/** The components under test, from this test's fresh modules. */
async function load() {
  const [{ IconButton }, { Button }, { LazyTooltip, preloadTooltip }, { TooltipTrigger }] =
    await Promise.all([
      import('../icon-button/IconButton'),
      import('../button/Button'),
      import('./lazy-tooltip'),
      import('./tooltip-trigger'),
    ]);
  return { IconButton, Button, LazyTooltip, preloadTooltip, TooltipTrigger };
}

describe('LazyTooltip', () => {
  beforeEach(() => {
    // Fresh modules for each test, so each starts with the tooltip's code not yet loaded.
    vi.resetModules();
    loads = 0;
    vi.doMock('./Tooltip', async (importOriginal) => {
      loads += 1;
      return importOriginal();
    });
  });

  // First: React Aria skips the delay for a while after another tooltip has shown.
  it('starts loading on hover, before a delayed tooltip opens, which then shows after its delay', async () => {
    const { Button, LazyTooltip, TooltipTrigger } = await load();
    render(
      <TooltipTrigger delay={300}>
        <Button>Save</Button>
        <LazyTooltip>Save the draft</LazyTooltip>
      </TooltipTrigger>,
    );
    expect(loads).toBe(0);

    const start = performance.now();
    await hover(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(loads).toBe(1));
    // Loaded while the delay runs: nothing shows yet.
    expect(screen.queryByRole('tooltip')).toBeNull();

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Save the draft');
    expect(performance.now() - start).toBeGreaterThanOrEqual(300);
  });

  it("doesn't load the tooltip's code until the pointer moves over its trigger", async () => {
    const { IconButton } = await load();
    render(<IconButton icon={<Star />} aria-label="Favourite" />);
    const button = screen.getByRole('button', { name: 'Favourite' });
    // The button is fully there (named, focusable) without it.
    expect(button).toBeInTheDocument();
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(loads).toBe(0);

    await hover(button);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Favourite');
    expect(loads).toBe(1);
  });

  it('loads it on keyboard focus, and the tooltip shows', async () => {
    const { IconButton } = await load();
    render(<IconButton icon={<Star />} aria-label="Favourite" />);
    expect(loads).toBe(0);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Favourite' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Favourite');
    expect(loads).toBe(1);
  });

  it('once loaded, shows in the same render as it opens, without waiting on a Suspense reveal', async () => {
    const { IconButton, preloadTooltip } = await load();
    render(<IconButton icon={<Star />} aria-label="Favourite" />);
    await act(() => preloadTooltip());
    await userEvent.tab();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Favourite');
  });

  it('shows after a touch long press without pressing the button', async () => {
    const { IconButton } = await load();
    const onPress = vi.fn();
    render(<IconButton icon={<Star />} aria-label="Favourite" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Favourite' });
    fireEvent.pointerDown(button, { pointerType: 'touch', pointerId: 1, button: 0 });
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Favourite');
    expect(loads).toBe(1);
    fireEvent.pointerUp(window, { pointerType: 'touch', pointerId: 1 });
    expect(onPress).not.toHaveBeenCalled();
  });
});
