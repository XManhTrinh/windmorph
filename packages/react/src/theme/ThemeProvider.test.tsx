import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { setMediaQueries } from '../../test/setup';
import { useTheme } from './context';
import { createTheme } from './create-theme';
import { serializeThemeState } from './state';
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
