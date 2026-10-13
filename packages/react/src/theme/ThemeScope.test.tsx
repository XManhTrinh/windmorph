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
  it('writes all four attributes, inheriting unset ones', () => {
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
    expect(screen.getByText('forest dark high standard')).toBeInTheDocument();
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
