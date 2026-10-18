'use client';

import {
  Suspense,
  createElement,
  use,
  useCallback,
  useEffect,
  useRef,
  type ComponentType,
} from 'react';

type ExampleModule = Record<string, ComponentType | undefined>;

const examples = new Map<string, Promise<ComponentType>>();

/**
 * The example `name` exported by `examples/<file>.tsx`, loaded on demand. The template
 * import gives every example file its own chunk, so a page downloads only the examples it
 * shows. Each request is kept for the session, so a component always gets the same
 * promise, and so the same component, back.
 */
function loadExample(file: string, name: string): Promise<ComponentType> {
  const key = `${file}#${name}`;
  let example = examples.get(key);
  if (!example) {
    example = import(`../examples/${file}.tsx`).then((module: ExampleModule) => {
      const component = module[name];
      if (!component) throw new Error(`examples/${file}.tsx has no export named ${name}`);
      return component;
    });
    examples.set(key, example);
  }
  return example;
}

/** The loaded example. It suspends until its chunk has arrived. */
function LoadedExample({ file, name }: { file: string; name: string }) {
  // `loadExample` caches per file and name, so this is the same component on every render.
  return createElement(use(loadExample(file, name)));
}

/** Runs `onReady` once it has mounted: after its sibling example has loaded and hydrated. */
function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

/**
 * Renders a live example from `examples/` without adding it to the page's own bundle. Its
 * own Suspense boundary lets the rest of the page hydrate at once while the example's chunk
 * loads; until then the example keeps its server-rendered HTML. The wrapper takes no layout
 * box (`display: contents`) and gets `data-ready` once the example is interactive, which
 * the browser tests wait for.
 */
export function LazyExample({ file, name }: { file: string; name: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const markReady = useCallback(() => wrapper.current?.setAttribute('data-ready', ''), []);
  return (
    <div ref={wrapper} className="contents" data-example={file}>
      <Suspense>
        <LoadedExample file={file} name={name} />
        <Ready onReady={markReady} />
      </Suspense>
    </div>
  );
}
