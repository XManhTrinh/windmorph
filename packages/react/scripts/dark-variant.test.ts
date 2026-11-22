// @vitest-environment jsdom
import { compile } from '@tailwindcss/node';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

// A path, not a URL: jsdom's `URL` stands in for Node's here.
const base = resolve(dirname(fileURLToPath(import.meta.url)), '../src/styles/');

/** The `dark:bg-surface` selectors for a device whose colour scheme is `device`. */
function selectorsFor(css: string, device: 'dark' | 'light'): string[] {
  const media =
    device === 'dark'
      ? '@media (prefers-color-scheme: dark)'
      : '@media not (prefers-color-scheme: dark)';
  const start = css.indexOf(media, css.indexOf('@layer utilities'));
  let depth = 0;
  let end = css.indexOf('{', start);
  for (; end < css.length; end++) {
    if (css[end] === '{') depth++;
    if (css[end] === '}' && --depth === 0) break;
  }
  return [...css.slice(start, end).matchAll(/(\.dark\\:bg-surface[^{]*)\{/g)].map((match) =>
    match[1]!.trim(),
  );
}

describe('the dark: variant', () => {
  let css: string;

  beforeAll(async () => {
    const compiler = await compile(`@import 'tailwindcss';\n@import './styles.css';`, {
      base,
      onDependency: () => {},
    });
    css = compiler.build(['dark:bg-surface']);
  });

  it('matches by the nearest part with a mode, nested scopes included', () => {
    document.body.innerHTML = `
      <div data-mode="light">
        <i id="page"></i>
        <div data-mode="light"><i id="light-in-page"></i>
          <div data-mode="dark"><i id="dark-in-light"></i>
            <div data-mode="light"><i id="light-in-dark-in-light"></i></div>
          </div>
        </div>
        <div data-mode="dark"><i id="dark-in-page"></i></div>
        <div data-mode="system"><i id="system-in-page"></i></div>
      </div>`;
    const dark = (device: 'dark' | 'light', page: string) => {
      document.body.firstElementChild!.setAttribute('data-mode', page);
      const selectors = selectorsFor(css, device);
      return [...document.querySelectorAll('i')]
        .filter((element) => {
          element.className = 'dark:bg-surface';
          return selectors.some((selector) => element.matches(selector));
        })
        .map((element) => element.id);
    };
    expect(dark('light', 'dark')).toEqual(['page', 'dark-in-light', 'dark-in-page']);
    expect(dark('light', 'light')).toEqual(['dark-in-light', 'dark-in-page']);
    expect(dark('light', 'system')).toEqual(['dark-in-light', 'dark-in-page']);
    expect(dark('dark', 'system')).toEqual([
      'page',
      'dark-in-light',
      'dark-in-page',
      'system-in-page',
    ]);
    expect(dark('dark', 'light')).toEqual(['dark-in-light', 'dark-in-page', 'system-in-page']);
  });
});
