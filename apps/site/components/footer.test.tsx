import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Footer } from './footer';

describe('the footer', () => {
  it('links the repository, npm, the licence, Pro, sponsoring and privacy', () => {
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<Footer />);
    const links = [...root.querySelectorAll('nav a')].map((link) => [
      link.textContent,
      link.getAttribute('href'),
    ]);
    expect(links).toEqual([
      ['GitHub', 'https://github.com/XManhTrinh/windmorph'],
      ['npm', 'https://www.npmjs.com/package/@windmorph/react'],
      ['MIT licence', 'https://github.com/XManhTrinh/windmorph/blob/main/LICENSE'],
      ['Windmorph Pro', '/pro'],
      ['Sponsor', 'https://github.com/sponsors/XManhTrinh'],
      ['Privacy', '/privacy'],
    ]);
  });
});
