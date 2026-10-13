import type { ComponentTokenSet } from '@windmorph/react';

/**
 * A component's tokens, generated from the same set that writes its CSS variables, so the
 * table can never drift from the library: each public variable, its default and what it
 * paints. Defaults that change with a size or variant say so.
 */
export function TokenTable({ set, caption }: { set: ComponentTokenSet; caption: string }) {
  const varying = new Map<string, string[]>();
  for (const [attribute, values] of Object.entries(set.states ?? {})) {
    for (const overrides of Object.values(values)) {
      for (const token of Object.keys(overrides)) {
        const by = varying.get(token) ?? [];
        if (!by.includes(attribute)) varying.set(token, [...by, attribute]);
      }
    }
  }
  return (
    <div className="overflow-x-auto rounded-corner-large border border-outline-variant">
      <table className="w-full text-start text-body-medium text-on-surface">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-container text-label-large text-on-surface-variant">
          <tr>
            <th scope="col" className="px-4 py-3 text-start">
              Variable
            </th>
            <th scope="col" className="px-4 py-3 text-start">
              Default
            </th>
            <th scope="col" className="px-4 py-3 text-start">
              Paints
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(set.tokens).map(([token, { value, description }]) => (
            <tr key={token} className="border-t border-outline-variant align-top">
              <th scope="row" className="px-4 py-3 text-start font-plain">
                <code className="text-on-surface">{`--${set.name}-${token}`}</code>
              </th>
              <td className="px-4 py-3">
                <code className="break-all text-on-surface-variant">{value}</code>
                {varying.has(token) && (
                  <span className="block text-body-small text-on-surface-variant">
                    Varies with {varying.get(token)?.join(' and ')}.
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-on-surface-variant">{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
