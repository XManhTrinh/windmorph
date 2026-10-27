import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import NotFound, { metadata } from './not-found';

describe('the 404 page', () => {
  it('has its own title, says what happened, and links back', () => {
    expect(metadata.title).toBe('Page not found');
    const root = document.createElement('div');
    root.innerHTML = renderToStaticMarkup(<NotFound />);
    expect(root.querySelector('h1')?.textContent).toBe('Page not found');
    expect([...root.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/components',
      '/getting-started',
    ]);
    expect(root.textContent).not.toMatch(/404/);
  });
});
