import type { ComponentType } from 'react';
import { LazyExample } from '../components/lazy-example';

/**
 * A component page's live example, by its file under `examples/` (without `.tsx`) and its
 * export name. Every component page is one route, so importing the examples directly would
 * put every page's examples into every page's bundle; this loads each page's own on demand.
 * A wrong file or name fails the build, which renders every example.
 *
 * @example
 * const ButtonVariants = lazyExample('button/button-variants', 'ButtonVariants');
 */
export function lazyExample(file: string, name: string): ComponentType {
  function Example() {
    return <LazyExample file={file} name={name} />;
  }
  Example.displayName = name;
  return Example;
}
