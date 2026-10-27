import type { ReactNode } from 'react';

/**
 * How the server-components page checks one export.
 *
 * - `component`: rendered from the server page with minimal valid props.
 * - `client`: a component whose required props cannot cross from the server (a function,
 *   a class instance, a ref, or collection items, which React Aria reads by element type),
 *   so it is rendered from `client-examples.tsx`. It is still imported here.
 * - `context`: a context, rendered as a provider from the server page.
 * - `hook`: imported only; hooks run in client components.
 * - `value`: a function, class or constant, called or read on the server. It must not be
 *   a client reference.
 */
export type ExportCheck =
  | { kind: 'component'; render: () => ReactNode }
  | { kind: 'client'; reason: string }
  | { kind: 'context'; render: () => ReactNode }
  | { kind: 'hook' }
  | { kind: 'value'; run: () => unknown };

/** One check per value export of a module namespace, so a new export fails the typecheck. */
export type ExportChecks<Namespace> = { [Name in keyof Namespace]: ExportCheck };

/** Reads a constant on the server. */
export const read = (value: unknown): ExportCheck => ({ kind: 'value', run: () => value });

export const hook: ExportCheck = { kind: 'hook' };

/** Collection items: React Aria reads each item's element type, so they're built in a client. */
export const collection = (container: string): ExportCheck => ({
  kind: 'client',
  reason: `collection items of ${container}`,
});
