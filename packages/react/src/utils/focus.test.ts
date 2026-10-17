import { describe, expect, it } from 'vitest';
import { firstTabbable } from './focus';

describe('firstTabbable', () => {
  it('skips disabled, untabbable, inert and hidden elements', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button disabled>a</button>
      <span tabindex="-1">b</span>
      <div inert><button>c</button></div>
      <div hidden><button>d</button></div>
      <a href="#x">e</a>`;
    expect(firstTabbable(root)?.textContent).toBe('e');
    expect(firstTabbable(document.createElement('div'))).toBeNull();
  });

  it('skips elements that are not rendered, and those the caller skips', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <button class="gone">a</button>
      <div tabindex="0" data-skip>b</div>
      <button>c</button>`;
    root.querySelector<HTMLElement>('.gone')!.checkVisibility = () => false;
    expect(firstTabbable(root, (el) => el.hasAttribute('data-skip'))?.textContent).toBe('c');
    expect(firstTabbable(root)?.textContent).toBe('b');
  });
});
