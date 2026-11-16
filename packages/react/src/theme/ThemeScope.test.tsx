import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { useThemeScope } from './context';
import { ThemeProvider } from './ThemeProvider';
import { ThemeScope } from './ThemeScope';
import { Overlay } from '../primitives/Overlay';

function ScopeState() {
  const { theme, mode, contrast, motion } = useThemeScope();
  return <span>{`${theme} ${mode} ${contrast} ${motion}`}</span>;
}

describe('ThemeScope', () => {
  it('writes the attributes that differ from the theme around it, inheriting unset ones', () => {
    render(
      <ThemeProvider defaultMode="light" defaultMotion="standard">
        <ThemeScope theme="forest" data-testid="outer">
          <ThemeScope mode="dark" contrast="high" data-testid="inner">
            <ScopeState />
          </ThemeScope>
        </ThemeScope>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('outer')).toHaveAttribute('data-theme', 'forest');
    expect(screen.getByTestId('outer')).toHaveAttribute('data-mode', 'light');
    const inner = screen.getByTestId('inner');
    expect(inner).toHaveAttribute('data-theme', 'forest');
    expect(inner).toHaveAttribute('data-mode', 'dark');
    expect(inner).toHaveAttribute('data-contrast', 'high');
    // The motion scheme and density are the page's: `<html>` carries them, so the theme's rules
    // don't declare them again here (an app's `:root` values for them still reach the scope).
    for (const scope of [screen.getByTestId('outer'), inner]) {
      expect(scope).not.toHaveAttribute('data-motion');
      expect(scope).not.toHaveAttribute('data-density');
    }
    expect(screen.getByText('forest dark high standard')).toBeInTheDocument();
  });

  it('sets the density for its subtree, inherited by nested scopes', () => {
    render(
      <ThemeProvider defaultDensity={-1}>
        <ThemeScope data-testid="inherits">
          <ThemeScope density={-3} data-testid="dense">
            <ThemeScope theme="ocean" data-testid="nested" />
          </ThemeScope>
          <ThemeScope density={0} data-testid="reset" />
        </ThemeScope>
      </ThemeProvider>,
    );
    // The page's density is on `<html>`; a nested scope inherits its parent's through the DOM.
    expect(screen.getByTestId('inherits')).not.toHaveAttribute('data-density');
    expect(screen.getByTestId('dense')).toHaveAttribute('data-density', '-3');
    expect(screen.getByTestId('nested')).not.toHaveAttribute('data-density');
    expect(screen.getByTestId('nested')).toHaveAttribute('data-theme', 'ocean');
    expect(screen.getByTestId('reset')).toHaveAttribute('data-density', '0');
  });

  it('works without a provider and lets consumer classes win', () => {
    render(
      <ThemeScope theme="slate" className="fixed text-primary" data-testid="scope">
        <ScopeState />
      </ThemeScope>,
    );
    const scope = screen.getByTestId('scope');
    expect(scope).toHaveAttribute('data-theme', 'slate');
    expect(scope).toHaveClass('fixed', 'text-primary');
    expect(scope).not.toHaveClass('text-on-surface');
  });

  it('renders a span with as="span", inline content keeping every theme feature', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <a href="#photo">
        <ThemeScope as="span" ref={ref} mode="dark" className="scoped" data-testid="scope">
          New
          <Overlay>
            <span>Overlay text</span>
          </Overlay>
        </ThemeScope>
      </a>,
    );
    const scope = screen.getByTestId('scope');
    expect(scope.tagName).toBe('SPAN');
    expect(ref.current).toBe(scope);
    expect(scope).toHaveAttribute('data-mode', 'dark');
    expect(scope).toHaveClass('text-on-surface', 'scoped');
    // An overlay opened inside still takes the scope's mode and class.
    const wrapper = screen.getByText('Overlay text').closest('[data-overlay-scope]')!;
    expect(wrapper).toHaveAttribute('data-mode', 'dark');
    expect(wrapper).toHaveClass('scoped');
  });
});
