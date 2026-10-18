import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/** How many times the `LoadingIndicator` module has been loaded in the current test. */
let loads = 0;

/** The components under test, from this test's fresh modules. */
async function load() {
  const [
    { Autocomplete },
    { AutocompleteItem, SelectItem },
    { Select },
    { preloadLoadingIndicator },
  ] = await Promise.all([
    import('../autocomplete/Autocomplete'),
    import('../select/option-list'),
    import('../select/Select'),
    import('./lazy-loading-indicator'),
  ]);
  return { Autocomplete, AutocompleteItem, Select, SelectItem, preloadLoadingIndicator };
}

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)));

describe('LazyLoadingIndicator', () => {
  beforeEach(() => {
    // Fresh modules for each test, so each starts with the indicator's code not yet loaded.
    vi.resetModules();
    loads = 0;
    vi.doMock('./LoadingIndicator', async (importOriginal) => {
      loads += 1;
      return importOriginal();
    });
  });

  it("doesn't load the indicator's code for a field that never loads options", async () => {
    const { Select, SelectItem } = await load();
    render(
      <Select label="Size">
        <SelectItem key="s">Small</SelectItem>
        <SelectItem key="l">Large</SelectItem>
      </Select>,
    );
    const trigger = screen.getByRole('button', { name: /Size/ });
    fireEvent.pointerMove(document.body);
    await userEvent.hover(trigger);
    await userEvent.click(trigger);
    expect(await screen.findByRole('option', { name: 'Small' })).toBeInTheDocument();
    await settle();
    expect(loads).toBe(0);
  });

  it('preloads it when a field that takes `loading` is hovered or focused', async () => {
    const { Autocomplete, AutocompleteItem } = await load();
    render(
      <Autocomplete label="City" items={[]} loading={false}>
        {(city: { id: string; name: string }) => (
          <AutocompleteItem key={city.id}>{city.name}</AutocompleteItem>
        )}
      </Autocomplete>,
    );
    await settle();
    expect(loads).toBe(0);
    await userEvent.tab();
    await waitFor(() => expect(loads).toBe(1));
  });

  it('shows the indicator, named, while `loading`', async () => {
    const { Select, SelectItem } = await load();
    render(
      <Select label="Size" loading defaultOpen>
        <SelectItem key="s">Small</SelectItem>
      </Select>,
    );
    expect(await screen.findByRole('progressbar', { name: 'Loading options' })).toBeVisible();
    expect(loads).toBe(1);
  });

  it('once preloaded, shows in the same render as `loading` turns on', async () => {
    const { Select, SelectItem, preloadLoadingIndicator } = await load();
    await preloadLoadingIndicator();
    render(
      <Select label="Size" loading defaultOpen>
        <SelectItem key="s">Small</SelectItem>
      </Select>,
    );
    expect(screen.getByRole('progressbar', { name: 'Loading options' })).toBeInTheDocument();
  });
});
