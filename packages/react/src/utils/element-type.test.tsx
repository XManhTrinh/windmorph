import { createElement, lazy, type ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { elementType } from './element-type';

function Section() {
  return null;
}

/** A lazy component that has loaded, as a server-created client element arrives. */
async function loadedLazy(component: ComponentType) {
  const type = lazy(() => Promise.resolve({ default: component }));
  try {
    elementType(createElement(type));
  } catch (pending) {
    await pending;
  }
  return type;
}

describe('elementType', () => {
  it('returns a plain element type as it is', () => {
    expect(elementType(createElement(Section))).toBe(Section);
    expect(elementType(createElement('li'))).toBe('li');
  });

  it('resolves a lazy type to the component it loaded', async () => {
    const type = await loadedLazy(Section);
    expect(elementType(createElement(type))).toBe(Section);
  });

  it('suspends while a lazy type is still loading', () => {
    const type = lazy(() => new Promise<{ default: ComponentType }>(() => {}));
    expect(() => elementType(createElement(type))).toThrow();
  });
});
