import { Card } from '@windmorph/react';
import { Tag } from '@windmorph/react-pro';
import { m3SpecUrl, type ComponentSpecData } from '../content/components/spec-data';
import {
  SPEC_STATUS_LABELS,
  specStatusRows,
  type SpecStatusKind,
  type SpecStatusRow,
} from '../content/components/spec-data/status';
import { CodeText } from './code-text';

/** Each status's tag colour: built reads as done, a difference as a caution. */
const STATUS_COLORS = {
  built: 'success',
  differs: 'warning',
  extension: 'tertiary',
  'not-built': 'neutral',
} as const satisfies Record<SpecStatusKind, string>;

const KIND_LABELS = {
  variant: 'Variant',
  configuration: 'Configuration',
  'use case': 'Use case',
} as const;

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

export function SpecStatusTag({ status }: { status: SpecStatusKind }) {
  return (
    <Tag size="sm" color={STATUS_COLORS[status]}>
      {SPEC_STATUS_LABELS[status]}
    </Tag>
  );
}

/** A row's details: the spec table and examples of a covered item, or the note of the rest. */
function Details({ row }: { row: SpecStatusRow }) {
  if (row.status !== 'built') return <CodeText text={row.note ?? ''} />;
  return (
    <>
      {row.kind && KIND_LABELS[row.kind]}
      {row.examples && row.examples.length > 0 && (
        <>
          {' · '}
          {row.examples.map((example, index) => (
            <span key={example.id}>
              {index > 0 && ', '}
              <a href={example.href} className={LINK}>
                {example.label}
              </a>
            </span>
          ))}
        </>
      )}
    </>
  );
}

/**
 * A component's spec status on its API tab: what it covers of the M3 Expressive spec, each
 * item linked to the live examples that show it, then its deliberate differences, its
 * extensions beyond the spec and what isn't built. Built from the catalog's spec data. A table
 * from medium windows up and a list of cards on phones. A Server Component.
 */
export function SpecStatus({
  slug,
  title,
  data,
}: {
  slug: string;
  title: string;
  data: ComponentSpecData;
}) {
  const rows = specStatusRows(slug, data);
  const caption = `${title} spec status`;
  return (
    <section className="flex flex-col gap-4">
      <h2 id="spec-status" className="text-headline-small text-on-surface">
        Spec status
      </h2>
      <p className="text-body-large text-on-surface-variant">
        {data.spec ? (
          <>
            Built to the{' '}
            <a href={m3SpecUrl(data.spec)} className={LINK}>
              M3 Expressive {title.toLowerCase()} spec
            </a>
            . Each item of its variants and configurations links to a live example; where the M3
            Expressive column of the spec differs from the original M3 one, it wins.
          </>
        ) : (
          <>
            Not part of Material Design 3: a Windmorph Pro component, built on M3&apos;s colour
            roles, type scale, shapes and motion. Its variants and configurations each link to a
            live example.
          </>
        )}
      </p>
      <div className="hidden overflow-hidden rounded-corner-large border border-outline-variant medium:block">
        <table className="w-full table-fixed border-collapse text-start text-body-medium [overflow-wrap:anywhere]">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-container text-label-large text-on-surface-variant">
            <tr>
              <th scope="col" className="w-[30%] px-4 py-3 text-start text-label-large">
                Item
              </th>
              <th scope="col" className="w-28 px-4 py-3 text-start text-label-large">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-start text-label-large">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.status}-${row.item}`}
                className="border-t border-outline-variant align-top"
              >
                <th scope="row" className="px-4 py-3 text-start text-body-medium text-on-surface">
                  <CodeText text={row.item} />
                </th>
                <td className="px-4 py-3">
                  <SpecStatusTag status={row.status} />
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  <Details row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* The table's rows again as cards for phones: the Markdown twin keeps the table only. */}
      <ul aria-label={caption} data-markdown="skip" className="flex flex-col gap-3 medium:hidden">
        {rows.map((row) => (
          <li key={`${row.status}-${row.item}`}>
            <Card variant="outlined" className="gap-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-title-small text-on-surface">
                  <CodeText text={row.item} />
                </p>
                <SpecStatusTag status={row.status} />
              </div>
              <p className="text-body-medium text-on-surface-variant">
                <Details row={row} />
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
