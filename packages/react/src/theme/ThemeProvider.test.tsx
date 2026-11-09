import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { setMediaQueries } from '../../test/setup';
import { ThemeContext, useTheme, type ThemeProviderValue } from './context';
import { createTheme } from './create-theme';
import { DEFAULT_THEME_STATE, serializeThemeState } from './state';
import { ThemeProvider } from './ThemeProvider';

function ThemeControls() {
  const { theme, mode, resolvedMode, contrast, motion, density, themes } = useTheme();
  const { setTheme, setMode, setDensity } = useTheme();
  return (
    <div>
      <output aria-label="state">{`${theme} ${mode} ${resolvedMode} ${contrast} ${motion}`}</output>
      <output aria-label="density">{density}</output>
      <output aria-label="themes">{themes.join(',')}</output>
      <button onClick={() => setTheme('ocean')}>ocean</button>
      <button onClick={() => setTheme('unknown')}>unknown</button>
      <button onClick={() => setMode('dark')}>dark</button>
      <button onClick={() => setDensity(-2)}>dense</button>
    </div>
  );
}

const html = document.documentElement;
const state = () => screen.getByLabelText('state').textContent;

describe('ThemeProvider', () => {
  it('applies the defaults to <html>', () => {
    render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>,
    );
    expect(state()).toBe('baseline system light standard expressive');
    expect(html).toHaveAttribute('data-theme', 'baseline');
    expect(html).toHaveAttribute('data-mode', 'system');
    expect(html).toHaveAttribute('data-contrast', 'standard');
    expect(html).toHaveAttribute('data-motion', 'expressive');
    expect(html).toHaveAttribute('data-density', '0');
    expect(screen.getByLabelText('themes')).toHaveTextContent(
      'baseline,ocean,forest,sunset,rose,slate',
    );
  });

  it('updates attributes and the cookie when the theme changes', async () => {
    render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ocean' }));
    await userEvent.click(screen.getByRole('button', { name: 'dark' }));
    expect(html).toHaveAttribute('data-theme', 'ocean');
    expect(html).toHaveAttribute('data-mode', 'dark');
    expect(state()).toBe('ocean dark dark standard expressive');
    expect(document.cookie).toContain(
      `windmorph-theme=${serializeThemeState({ theme: 'ocean', mode: 'dark', contrast: 'standard', motion: 'expressive', density: 0 })}`,
    );
  });

  describe('transitions during a colour change', () => {
    const changing = 'data-wm-theme-changing';

    function holdFrames() {
      const frames: FrameRequestCallback[] = [];
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        frames.push(callback);
        return frames.length;
      });
      onTestFinished(() => void vi.restoreAllMocks());
      return () => frames.shift()?.(0);
    }
    const press = (name: string) => act(() => screen.getByRole('button', { name }).click());
    const Sample = () => (
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>
    );

    it('stops them for two frames, then lets them run again', () => {
      const nextFrame = holdFrames();
      render(<Sample />);
      expect(html).not.toHaveAttribute(changing);
      press('dark');
      expect(html).toHaveAttribute('data-mode', 'dark');
      expect(html).toHaveAttribute(changing);
      act(() => nextFrame());
      expect(html).toHaveAttribute(changing);
      act(() => nextFrame());
      expect(html).not.toHaveAttribute(changing);
    });

    it('covers a change of theme too', () => {
      holdFrames();
      render(<Sample />);
      press('ocean');
      expect(html).toHaveAttribute(changing);
    });

    it('leaves them alone for a change that keeps the colours', () => {
      holdFrames();
      render(<Sample />);
      press('dense');
      expect(html).toHaveAttribute('data-density', '-2');
      expect(html).not.toHaveAttribute(changing);
    });

    it('leaves nothing behind when it unmounts mid-change', () => {
      holdFrames();
      const { unmount } = render(<Sample />);
      press('dark');
      unmount();
      expect(html).not.toHaveAttribute(changing);
    });
  });

  it('stores nothing until the selection changes, then every change', async () => {
    render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>,
    );
    expect(document.cookie).not.toContain('windmorph-theme');
    await userEvent.click(screen.getByRole('button', { name: 'ocean' }));
    expect(document.cookie).toContain('windmorph-theme');
  });

  it("doesn't rewrite a stored selection it only read", () => {
    const stored = serializeThemeState({
      theme: 'forest',
      mode: 'light',
      contrast: 'high',
      motion: 'standard',
      density: -3,
    });
    document.cookie = `windmorph-theme=${stored}; max-age=60; path=/`;
    const write = vi.spyOn(document, 'cookie', 'set');
    render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>,
    );
    expect(state()).toBe('forest light light high standard');
    expect(write).not.toHaveBeenCalled();
    write.mockRestore();
  });

  it('restores the stored selection on mount', () => {
    document.cookie = `windmorph-theme=${serializeThemeState({ theme: 'forest', mode: 'light', contrast: 'high', motion: 'standard', density: -3 })}`;
    render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>,
    );
    expect(state()).toBe('forest light light high standard');
    expect(html).toHaveAttribute('data-contrast', 'high');
    expect(screen.getByLabelText('density')).toHaveTextContent('-3');
    expect(html).toHaveAttribute('data-density', '-3');
  });

  it('sets, stores and reports the density', async () => {
    const onDensityChange = vi.fn();
    render(
      <ThemeProvider onDensityChange={onDensityChange}>
        <ThemeControls />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'dense' }));
    expect(onDensityChange).toHaveBeenCalledWith(-2);
    expect(html).toHaveAttribute('data-density', '-2');
    expect(decodeURIComponent(decodeURIComponent(document.cookie))).toContain('density=-2');
  });

  it('takes a controlled density', () => {
    render(
      <ThemeProvider density={-1}>
        <ThemeControls />
      </ThemeProvider>,
    );
    expect(html).toHaveAttribute('data-density', '-1');
  });

  it('supports localStorage and no persistence', async () => {
    const { unmount } = render(
      <ThemeProvider storage="local-storage">
        <ThemeControls />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ocean' }));
    expect(window.localStorage.getItem('windmorph-theme')).toContain('ocean');
    expect(document.cookie).not.toContain('windmorph-theme');
    unmount();
    window.localStorage.clear();

    render(
      <ThemeProvider storage="none">
        <ThemeControls />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ocean' }));
    expect(window.localStorage.getItem('windmorph-theme')).toBeNull();
    expect(document.cookie).not.toContain('windmorph-theme');
  });

  it('resolves system mode from prefers-color-scheme and follows changes', () => {
    setMediaQueries({ '(prefers-color-scheme: dark)': true });
    render(
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>,
    );
    expect(state()).toBe('baseline system dark standard expressive');
    act(() => setMediaQueries({ '(prefers-color-scheme: dark)': false }));
    expect(state()).toBe('baseline system light standard expressive');
  });

  it("keeps its context value as the server rendered it when the device's mode differs", async () => {
    setMediaQueries({ '(prefers-color-scheme: dark)': true });
    // A change to the provider's value right after hydration would make React client-render
    // every Suspense boundary still waiting for its streamed HTML.
    const values = new Set<ThemeProviderValue | null>();
    function ContextReader() {
      values.add(useContext(ThemeContext));
      return null;
    }
    const app = (
      <ThemeProvider>
        <ContextReader />
        <ThemeControls />
      </ThemeProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(app);
    document.body.append(container);
    expect(container.querySelector('output')).toHaveTextContent('baseline system light');
    values.clear();

    const root = await act(async () => hydrateRoot(container, app));
    onTestFinished(() => {
      act(() => root.unmount());
      container.remove();
    });
    expect(state()).toBe('baseline system dark standard expressive');
    expect(values.size).toBe(1);
    act(() => setMediaQueries({ '(prefers-color-scheme: dark)': false }));
    expect(state()).toBe('baseline system light standard expressive');
    expect(values.size).toBe(1);
  });

  describe('when the saved selection differs from the server-rendered one', () => {
    /** Server-renders the provider with its defaults, then hydrates it with a cookie saved. */
    async function hydrateWithSavedMode({ pendingBoundary }: { pendingBoundary: boolean }) {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const app = (
        <ThemeProvider>
          <ThemeControls />
        </ThemeProvider>
      );
      const container = document.createElement('div');
      container.innerHTML = renderToString(app);
      // React's marker for a Suspense boundary whose streamed HTML hasn't arrived yet.
      const marker = document.createComment('$?');
      if (pendingBoundary) document.body.append(marker);
      document.body.append(container);
      document.cookie = `windmorph-theme=${serializeThemeState({ ...DEFAULT_THEME_STATE, mode: 'dark' })}`;
      const root = await act(async () => hydrateRoot(container, app));
      onTestFinished(() => {
        act(() => root.unmount());
        container.remove();
        marker.remove();
        warn.mockRestore();
      });
      return warn;
    }

    it('warns while streamed boundaries are pending, naming what changed', async () => {
      const warn = await hydrateWithSavedMode({ pendingBoundary: true });
      expect(state()).toBe('baseline dark dark standard expressive');
      expect(warn).toHaveBeenCalledOnce();
      expect(warn.mock.calls[0]![0]).toContain(
        'hydrated with the server\'s mode "system", then applied the saved mode "dark"',
      );
      expect(warn.mock.calls[0]![0]).toContain('getThemeFromCookies');
    });

    it('stays quiet when nothing is still streaming', async () => {
      const warn = await hydrateWithSavedMode({ pendingBoundary: false });
      expect(state()).toBe('baseline dark dark standard expressive');
      expect(warn).not.toHaveBeenCalled();
    });

    it('stays quiet when the server rendered the saved selection', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      document.cookie = `windmorph-theme=${serializeThemeState({ ...DEFAULT_THEME_STATE, mode: 'dark' })}`;
      const app = (
        <ThemeProvider defaultMode="dark">
          <ThemeControls />
        </ThemeProvider>
      );
      const container = document.createElement('div');
      container.innerHTML = renderToString(app);
      const marker = document.createComment('$?');
      document.body.append(marker, container);
      const root = await act(async () => hydrateRoot(container, app));
      onTestFinished(() => {
        act(() => root.unmount());
        container.remove();
        marker.remove();
        warn.mockRestore();
      });
      expect(state()).toBe('baseline dark dark standard expressive');
      expect(warn).not.toHaveBeenCalled();
    });
  });

  it('can be controlled', async () => {
    const onThemeChange = vi.fn();
    render(
      <ThemeProvider theme="rose" onThemeChange={onThemeChange}>
        <ThemeControls />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ocean' }));
    expect(onThemeChange).toHaveBeenCalledWith('ocean');
    expect(html).toHaveAttribute('data-theme', 'rose');
  });

  it('ignores themes that are not available', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ThemeProvider themes={['baseline', 'forest']}>
        <ThemeControls />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ocean' }));
    expect(html).toHaveAttribute('data-theme', 'baseline');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('setTheme("ocean") ignored'));
    warn.mockRestore();
  });

  it('injects CSS for custom themes and allows selecting them', () => {
    const acme = createTheme({ name: 'acme', seed: '#0B57D0', contrast: 'standard' });
    render(
      <ThemeProvider themes={['baseline', acme]} defaultTheme="acme">
        <ThemeControls />
      </ThemeProvider>,
    );
    expect(html).toHaveAttribute('data-theme', 'acme');
    const style = document.head.querySelector('style[data-href="windmorph-theme-acme"]');
    expect(style?.textContent).toContain('[data-theme="acme"]');
  });

  it('leaves <html> alone when applyToDocument is false', () => {
    render(
      <ThemeProvider applyToDocument={false}>
        <ThemeControls />
      </ThemeProvider>,
    );
    expect(html).not.toHaveAttribute('data-theme');
  });
});
