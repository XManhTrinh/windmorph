import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compiledCss } from '../../../test/tailwind-classes';
import { List, ListItem, ListSection, type ListProps } from './List';

/**
 * Segmented corners and dividers come from CSS in a plain list's server HTML, before the
 * list learns on the client which of its entries are sections. Each item's matching rules
 * are read from the CSS that Tailwind generates for the page's classes.
 */

interface Rule {
  selector: string;
  declarations: string;
}

/** A selector list's selectors: its commas outside parentheses. */
function selectors(list: string): string[] {
  const parts = [''];
  let depth = 0;
  for (const char of list) {
    depth += char === '(' ? 1 : char === ')' ? -1 : 0;
    if (char === ',' && depth === 0) parts.push('');
    else parts[parts.length - 1] += char;
  }
  return parts.map((part) => part.trim());
}

/** The style rules of flattened CSS (Tailwind's output has no nesting inside its layers). */
function rules(css: string): Rule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, declarations]) => ({
    selector: selector!.trim(),
    declarations: declarations!,
  }));
}

async function serverItems(props: Omit<ListProps, 'children' | 'aria-label'>) {
  const html = renderToString(
    <List aria-label="Settings" {...props}>
      <ListItem key="account">Account</ListItem>
      <ListItem key="privacy">Privacy</ListItem>
      <ListSection key="network" title="Network">
        <ListItem key="wifi">Wi-Fi</ListItem>
        <ListItem key="bluetooth" control="switch">
          Bluetooth
        </ListItem>
      </ListSection>
      <ListItem key="about" href="/about">
        About
      </ListItem>
    </List>,
  );
  const document = new DOMParser().parseFromString(html, 'text/html');
  const classes = new Set<string>();
  for (const element of document.querySelectorAll('[class]')) {
    for (const name of element.classList) classes.add(name);
  }
  const all = rules(await compiledCss(classes));
  /** Whether a rule matching the item (or its `::after`) declares `declaration`. */
  const has = (item: Element, declaration: string, pseudo = '') =>
    all.some(
      ({ selector, declarations }) =>
        declarations.includes(declaration) &&
        selectors(selector).some((part) => {
          if (pseudo ? !part.endsWith(pseudo) : part.includes('::')) return false;
          return item.matches(pseudo ? part.slice(0, -pseudo.length) : part);
        }),
    );
  return [...document.querySelectorAll('[data-slot="item"]')].map((item) => ({
    item,
    name: item.textContent?.trim().split(/\s/)[0],
    has: (declaration: string, pseudo?: string) => has(item, declaration, pseudo),
  }));
}

describe('List server HTML', () => {
  it('rounds the outer corners of each segmented group, loose items included', async () => {
    const items = await serverItems({ variant: 'segmented' });
    const corners = items.map(({ name, has }) => [
      name,
      has('border-top-left-radius: var(--md-sys-shape-corner-large)'),
      has('border-bottom-left-radius: var(--md-sys-shape-corner-large)'),
    ]);
    expect(corners).toEqual([
      ['Account', true, false],
      ['Privacy', false, true],
      ['Wi-Fi', true, false],
      ['Bluetooth', false, true],
      ['About', true, true],
    ]);
  });

  it('draws no divider under the last item of each group', async () => {
    const items = await serverItems({ dividers: 'full' });
    const hidden = items.map(({ name, has }) => [name, has('display: none', '::after')]);
    expect(hidden).toEqual([
      ['Account', false],
      ['Privacy', true],
      ['Wi-Fi', false],
      ['Bluetooth', true],
      ['About', true],
    ]);
  });
});
