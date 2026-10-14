import { Card } from '@windmorph/react';
import { PropsTable, type PropsTableRow } from '@windmorph/react-pro';
import type { PropsRecord } from '../lib/component-props';
import { InlineCode } from './inline-code';

/**
 * The table's rows: each prop, followed by the keys of an object prop (`labels.close`,
 * `classNames.root`) so every overridable string and styled part is listed with its own
 * description and default.
 */
export function propsTableRows(props: PropsRecord[]): PropsTableRow[] {
  return props.flatMap((prop) => [
    {
      name: prop.name,
      type: prop.type,
      required: prop.required,
      defaultValue: prop.defaultValue,
      description: prop.description,
    },
    ...(prop.keys ?? []),
  ]);
}

/**
 * A component's props: a table from medium windows up, and on phones a list of cards (name,
 * type, default and description stacked), so nothing scrolls sideways. Both are rendered and
 * one is hidden with CSS, so the static export needs no window check.
 */
export function PropsList({ caption, props }: { caption: string; props: PropsRecord[] }) {
  const rows = propsTableRows(props);
  return (
    <>
      <PropsTable caption={caption} rows={rows} className="hidden medium:block" />
      <ul aria-label={caption} className="flex flex-col gap-3 medium:hidden">
        {rows.map((row) => (
          <li key={row.name}>
            <Card variant="outlined" className="gap-2 p-4">
              <p className="flex flex-wrap items-center gap-1 text-title-small">
                <InlineCode dir="ltr">{row.name}</InlineCode>
                {row.required && (
                  <>
                    <span aria-hidden="true" className="text-error">
                      *
                    </span>
                    <span className="sr-only"> required</span>
                  </>
                )}
              </p>
              {row.description && (
                <p className="text-body-medium text-on-surface-variant">{row.description}</p>
              )}
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-body-small">
                {row.type && (
                  <>
                    <dt className="text-label-medium text-on-surface-variant">Type</dt>
                    <dd className="min-w-0">
                      <InlineCode dir="ltr">{row.type}</InlineCode>
                    </dd>
                  </>
                )}
                {row.defaultValue != null && row.defaultValue !== '' && (
                  <>
                    <dt className="text-label-medium text-on-surface-variant">Default</dt>
                    <dd className="min-w-0">
                      <InlineCode dir="ltr">{row.defaultValue}</InlineCode>
                    </dd>
                  </>
                )}
              </dl>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
