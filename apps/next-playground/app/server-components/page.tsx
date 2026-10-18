import * as Core from '@windmorph/react';
import * as NextEntry from '@windmorph/react/next';
import * as Primitives from '@windmorph/react/primitives';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { ExportCheck } from './check';
import { ClientExample } from './client-examples';
import { coreChecks } from './core-checks';
import { nextChecks } from './next-checks';
import { primitivesChecks } from './primitives-checks';

export const metadata: Metadata = { title: 'Server components', robots: { index: false } };

const ENTRIES: {
  entry: string;
  namespace: Record<string, unknown>;
  checks: Record<string, ExportCheck>;
}[] = [
  { entry: '@windmorph/react', namespace: Core, checks: coreChecks },
  { entry: '@windmorph/react/primitives', namespace: Primitives, checks: primitivesChecks },
  { entry: '@windmorph/react/next', namespace: NextEntry, checks: nextChecks },
];

const CLIENT_REFERENCE = Symbol.for('react.client.reference');

/** A `"use client"` module's exports reach a server component as client references. */
function isClientReference(value: unknown) {
  return (
    (typeof value === 'function' || (typeof value === 'object' && value !== null)) &&
    (value as { $$typeof?: unknown }).$$typeof === CLIENT_REFERENCE
  );
}

/** A short, plain-text description of a value computed on the server. */
function describe(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value.slice(0, 48));
  if (typeof value !== 'object' || value === null) return String(value);
  if (Array.isArray(value)) return `array of ${value.length}`;
  const name = value.constructor === Object ? 'object' : value.constructor.name;
  return `${name} with ${Object.keys(value).length} keys`;
}

type Status = 'ok' | 'error';

function evaluate(name: string, value: unknown, check: ExportCheck): [Status, ReactNode] {
  switch (check.kind) {
    case 'component':
    case 'context':
      return ['ok', check.render()];
    case 'client':
      return ['ok', <ClientExample name={name} />];
    case 'hook':
      return ['ok', typeof value];
    case 'value': {
      if (isClientReference(value)) {
        return ['error', 'a client reference: it cannot run on the server'];
      }
      try {
        return ['ok', describe(check.run())];
      } catch (error) {
        return ['error', error instanceof Error ? error.message : String(error)];
      }
    }
  }
}

/**
 * Imports every value export of `@windmorph/react`, `/primitives` and `/next` into a server
 * component: renders each component from here, calls each function on the server, and
 * lists any export without a check. The e2e suite asserts it renders and hydrates cleanly.
 */
export default function ServerComponentsPage() {
  return (
    <main className="flex flex-col gap-8 p-4 medium:p-8">
      <h1 className="text-headline-medium">Server components</h1>
      {ENTRIES.map(({ entry, namespace, checks }) => {
        const names = Object.keys(namespace).sort();
        const missing = names.filter((name) => !(name in checks));
        const stale = Object.keys(checks).filter((name) => !(name in namespace));
        return (
          <section key={entry} data-entry={entry} className="flex flex-col gap-4">
            <h2 className="text-title-large">{entry}</h2>
            <p data-testid="unchecked" className="text-body-medium">
              {[...missing, ...stale].join(', ')}
            </p>
            <ul className="grid gap-4 medium:grid-cols-2 expanded:grid-cols-3">
              {names
                .filter((name) => name in checks)
                .map((name) => {
                  const value = namespace[name];
                  const check = checks[name]!;
                  const [status, content] = evaluate(name, value, check);
                  return (
                    <li
                      key={name}
                      data-export={name}
                      data-kind={check.kind}
                      data-reference={isClientReference(value) ? 'client' : 'server'}
                      data-status={status}
                      className="relative flex min-w-0 flex-col gap-2 overflow-hidden rounded-corner-medium border border-outline-variant p-3"
                    >
                      <h3 className="text-label-large">{name}</h3>
                      <div className="text-body-small">{content}</div>
                    </li>
                  );
                })}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
