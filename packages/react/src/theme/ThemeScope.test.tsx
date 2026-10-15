import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useThemeScope } from './context';
import { ThemeProvider } from './ThemeProvider';
import { ThemeScope } from './ThemeScope';

function ScopeState() {
  const { theme, mode, contrast, motion } = useThemeScope();
  return <span>{`${theme} ${mode} ${contrast} ${motion}`}</span>;
}

describe('ThemeScope', () => {
  it('writes all five attributes, inheriting unset ones', () => {
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
    expect(inner).toHaveAttribute('data-motion', 'standard');
    expect(inner).toHaveAttribute('data-density', '0');
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
    expect(screen.getByTestId('inherits')).toHaveAttribute('data-density', '-1');
    expect(screen.getByTestId('dense')).toHaveAttribute('data-density', '-3');
    expect(screen.getByTestId('nested')).toHaveAttribute('data-density', '-3');
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
});
