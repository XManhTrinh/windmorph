import { componentTokenList, type ComponentTokenSet } from '@windmorph/react';
import { Fragment } from 'react';
import { InlineCode } from './inline-code';

/** `filled` → `Filled`. */
const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * A component's tokens, generated from the same set that writes its CSS variables, so the
 * table can never drift from the library: each public variable, its default and what it
 * paints, plus the matching Compose token when the set names one. A scoped set's tokens are
 * grouped by the variant or size they belong to; defaults that change with a state say so.
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
  const tokens = componentTokenList(set);
  const hasCompose = tokens.some(({ compose }) => compose);
  // Rows in list order, with a heading row before each scope value's tokens.
  const groups: { heading: string | null; rows: typeof tokens }[] = [];
  for (const token of tokens) {
    const heading = token.scope ? `${label(token.scope.value)} (${token.scope.attribute})` : null;
    const last = groups.at(-1);
    if (last && last.heading === heading) last.rows.push(token);
    else groups.push({ heading, rows: [token] });
  }
  return (
    <div className="overflow-x-auto rounded-corner-large border border-outline-variant">
      <table className="w-full min-w-[40rem] text-start text-body-medium text-on-surface">
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
            {hasCompose && (
              <th scope="col" className="px-4 py-3 text-start">
                Compose
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {groups.map(({ heading, rows }, index) => (
            <Fragment key={heading ?? `own-${index}`}>
              {heading && (
                <tr className="border-t border-outline-variant bg-surface-container-low">
                  <th
                    scope="colgroup"
                    colSpan={hasCompose ? 4 : 3}
                    className="px-4 py-2 text-start text-title-small text-on-surface"
                  >
                    {heading}
                  </th>
                </tr>
              )}
              {rows.map(({ name, token, value, description, compose }) => (
                <tr key={name} className="border-t border-outline-variant align-top">
                  <th scope="row" className="px-4 py-3 text-start font-plain">
                    <InlineCode>{name}</InlineCode>
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
                  {hasCompose && (
                    <td className="px-4 py-3">
                      {compose && (
                        <code className="break-all text-on-surface-variant">{compose}</code>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
