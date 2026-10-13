import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { serializeThemeState } from './state';
import { ThemeScript, getThemeScriptSource } from './ThemeScript';

const html = document.documentElement;
const run = (source: string) => new Function(source)();

describe('ThemeScript', () => {
  it('applies the stored cookie selection to <html>', () => {
    document.cookie = `windmorph-theme=${serializeThemeState({ theme: 'sunset', mode: 'dark', contrast: 'medium', motion: 'standard' })}`;
    run(getThemeScriptSource());
    expect(html).toHaveAttribute('data-theme', 'sunset');
    expect(html).toHaveAttribute('data-mode', 'dark');
    expect(html).toHaveAttribute('data-contrast', 'medium');
    expect(html).toHaveAttribute('data-motion', 'standard');
  });

  it('falls back to defaults for missing or invalid values', () => {
    window.localStorage.setItem('my-key', encodeURIComponent('mode=sepia&theme=forest'));
    run(
      getThemeScriptSource({
        storage: 'local-storage',
        storageKey: 'my-key',
        defaults: { mode: 'light' },
      }),
    );
    expect(html).toHaveAttribute('data-theme', 'forest');
    expect(html).toHaveAttribute('data-mode', 'light');
    expect(html).toHaveAttribute('data-contrast', 'standard');
  });

  it('cannot be broken out of with a malicious storage key', () => {
    const source = getThemeScriptSource({ storageKey: '</script><script>alert(1)</script>' });
    expect(source).not.toContain('</script>');
    expect(() => run(source)).not.toThrow();
  });

  it('renders an inline script with a nonce', () => {
    const { container } = render(<ThemeScript nonce="abc" />);
    const script = container.querySelector('script');
    expect(script).toHaveAttribute('nonce', 'abc');
    expect(script?.innerHTML).toContain('data-');
  });
});
