import { createElement, type ComponentType } from 'react';
import type * as LoadOnDemand from '../src/utils/load-on-demand';
import type { OnDemandComponent } from '../src/utils/load-on-demand';

/**
 * Tests of parts loaded on demand, without importing a component's whole graph afresh for each
 * test (`vi.resetModules`), which took 10-20s a file under a loaded run: mock the loader once per
 * file with this, and call `resetOnDemand()` before each test so every part starts with nothing
 * loaded again.
 *
 * ```ts
 * vi.mock('../../utils/load-on-demand', async (importOriginal) =>
 *   (await import('../../../test/on-demand')).mockOnDemand(importOriginal),
 * );
 * ```
 *
 * A part whose loader names a module given to `loadControl` loads through that control: the
 * test can count its loads, hold them back (`hold`) or fail them (`fail`).
 *
 * Only the parts are reset: the modules stay imported for the whole file. After the first test
 * that loads a part, its real `import()` is cached and resolves at once, so a test that needs
 * the moment while a part loads must `hold()` it; and any other module state (a component's
 * module-level caches, the idle queue) carries from one test to the next.
 */
export async function mockOnDemand(importOriginal: () => Promise<unknown>) {
  const original = (await importOriginal()) as typeof LoadOnDemand;
  const onDemand = <P extends object>(
    load: () => Promise<ComponentType<P>>,
  ): OnDemandComponent<P> => {
    const source = String(load);
    const controlled = () => {
      requests.count += 1;
      const control = [...controls].find(([module]) => source.includes(module))?.[1];
      if (!control) return load();
      control.loads += 1;
      return control.gate.then(() => {
        if (control.fail) throw new Error('The network is down');
        return load();
      });
    };
    let inner = original.onDemand(controlled);
    const part: OnDemandComponent<P> = {
      preload: () => inner.preload(),
      Component: (props: P) => createElement(inner.Component, props),
      loaded: () => inner.loaded(),
      subscribe: (listener) => inner.subscribe(listener),
    };
    parts.push({
      source,
      part: part as unknown as OnDemandComponent<object>,
      reset: () => {
        inner = original.onDemand(controlled);
      },
    });
    return part;
  };
  return { ...original, onDemand };
}

/** A module's loads: counted, held back or failed. */
export interface LoadControl {
  loads: number;
  fail: boolean;
  gate: Promise<void>;
  /** Holds the next loads back until the returned function is called. */
  hold: () => () => void;
}

const controls = new Map<string, LoadControl>();
const parts: { source: string; part: OnDemandComponent<object>; reset: () => void }[] = [];

/** Every load asked for, of any part (counted as it's asked for, at once). */
export const requests = { count: 0 };

/** The loads of the parts whose loader names `module`. */
export function loadControl(module: string): LoadControl {
  let control = controls.get(module);
  if (!control) {
    const made: LoadControl = {
      loads: 0,
      fail: false,
      gate: Promise.resolve(),
      hold: () => {
        let release = () => {};
        made.gate = new Promise<void>((resolve) => (release = resolve));
        return () => release();
      },
    };
    control = made;
    controls.set(module, control);
  }
  return control;
}

/** The part whose loader names `module` (the first made). */
export function partOf(module: string): OnDemandComponent<object> {
  return parts.find(({ source }) => source.includes(module))!.part;
}

/** Every part back to nothing loaded, and every control and count to its start. */
export function resetOnDemand() {
  for (const { reset } of parts) reset();
  for (const control of controls.values()) {
    control.loads = 0;
    control.fail = false;
    control.gate = Promise.resolve();
  }
  requests.count = 0;
}
