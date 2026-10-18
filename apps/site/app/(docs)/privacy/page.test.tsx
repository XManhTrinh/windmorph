import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { DATA_CONTROLLER } from './data-controller';
import PrivacyPage, { metadata } from './page';

function renderPage(): HTMLElement {
  const root = document.createElement('main');
  root.innerHTML = renderToStaticMarkup(<PrivacyPage />);
  document.body.replaceChildren(root);
  return root;
}

describe('the privacy notice', () => {
  it('has its own title and the sections the notice needs', () => {
    expect(metadata.title).toBe('Privacy');
    const root = renderPage();
    expect(root.querySelector('h1')?.textContent).toBe('Privacy');
    expect([...root.querySelectorAll('h2')].map((heading) => heading.textContent)).toEqual([
      'Who is responsible',
      'What we collect and why',
      'Who processes it',
      'How long we keep it',
      'Your rights',
      'The rest of the site',
    ]);
  });

  it('names who is responsible and how to reach them, from one constant', () => {
    const root = renderPage();
    expect(root.textContent).toContain(DATA_CONTROLLER.name);
    const contacts = [...root.querySelectorAll('a')].map((link) => link.getAttribute('href'));
    expect(contacts.length).toBeGreaterThan(0);
    expect(new Set(contacts)).toEqual(new Set([`mailto:${DATA_CONTROLLER.email}`]));
  });

  it('names the processor, the retention, the rights and the authority', () => {
    const text = renderPage().textContent ?? '';
    expect(text).toContain('Loops (loops.so)');
    expect(text).toContain('United States');
    expect(text).toMatch(/until you unsubscribe, or one year after the last email/i);
    for (const right of ['see the data', 'correct it', 'delete it', 'object to']) {
      expect(text).toContain(right);
    }
    expect(text).toContain('(ICO)');
    expect(text).toMatch(/no analytics/);
  });

  it('passes axe', async () => {
    renderPage();
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
