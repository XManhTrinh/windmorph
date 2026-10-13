import type { ReactElement } from 'react';

const LAZY = Symbol.for('react.lazy');

interface LazyType {
  $$typeof: symbol;
  _payload: unknown;
  _init: (payload: unknown) => unknown;
}

const isLazy = (type: unknown): type is LazyType =>
  typeof type === 'object' && type !== null && (type as LazyType).$$typeof === LAZY;

/**
 * The component an element renders. An element a React Server Component creates for a
 * client component reaches the client with a lazy type (React's `React.lazy` shape) wrapping
 * the client reference, so `element.type === Component` is false there. This resolves the
 * lazy type the way React does when it renders it: to the component once its module has
 * loaded, or by suspending (throwing its promise) until then.
 */
export function elementType(element: ReactElement): unknown {
  const { type } = element;
  return isLazy(type) ? type._init(type._payload) : type;
}
