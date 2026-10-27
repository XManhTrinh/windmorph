import type { Metadata } from 'next';
import { Card } from '@windmorph/react';
import { CodeText } from '../../../components/code-text';
import { InlineCode } from '../../../components/inline-code';
import { SpecStatusTag } from '../../../components/spec-status';
import { COMPONENT_META, type ComponentMeta } from '../../../content/components/catalog';
import { componentTabHref } from '../../../content/components/doc';
import { SPEC_DATA, m3SpecUrl } from '../../../content/components/spec-data';
import { guideMetadata } from '../../../lib/site-metadata';

export const metadata: Metadata = guideMetadata('/spec-status');

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

/** One component's counts, as the summary tables show them. */
interface Summary {
  meta: ComponentMeta;
  spec?: string;
  built: number;
  differs: number;
  extensions: number;
  notBuilt: number;
  playground: boolean;
}

function summarise(meta: ComponentMeta): Summary {
  const data = SPEC_DATA[meta.slug];
  return {
    meta,
    ...(data?.spec ? { spec: data.spec } : {}),
    built: data?.covers.length ?? 0,
    differs: data?.differences?.length ?? 0,
    extensions: data?.extensions?.length ?? 0,
    notBuilt: data?.notBuilt?.length ?? 0,
    playground: meta.playground === 'full',
  };
}

const pages = COMPONENT_META.filter((meta) => meta.railGroup !== 'primitives').map(summarise);
const m3 = pages.filter((summary) => !summary.meta.pro);
const pro = pages.filter((summary) => summary.meta.pro);
const total = (rows: Summary[], key: 'built' | 'differs' | 'extensions' | 'notBuilt') =>
  rows.reduce((sum, row) => sum + row[key], 0);

const COLUMNS = [
  ['built', 'Built'],
  ['differs', 'Differs'],
  ['extensions', 'Extensions'],
  ['notBuilt', 'Not built'],
] as const;

/** A table of components from medium windows up, and a list of cards on phones. */
function SummaryTable({ rows, caption }: { rows: Summary[]; caption: string }) {
  const cell = 'px-3 py-3 text-end tabular-nums';
  return (
    <>
      <div className="hidden overflow-hidden rounded-corner-large border border-outline-variant medium:block">
        <table className="w-full border-collapse text-body-medium">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-container text-label-large text-on-surface-variant">
            <tr>
              <th scope="col" className="px-4 py-3 text-start text-label-large">
                Component
              </th>
              {COLUMNS.map(([key, label]) => (
                <th key={key} scope="col" className="px-3 py-3 text-end text-label-large">
                  {label}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-start text-label-large">
                Playground
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.meta.slug} className="border-t border-outline-variant">
                <th scope="row" className="px-4 py-3 text-start text-body-medium">
                  <a
                    href={`${componentTabHref(row.meta.slug, 'api')}#spec-status`}
                    className={LINK}
                  >
                    {row.meta.title}
                  </a>
                  {row.spec && (
                    <>
                      {' '}
                      <a
                        href={m3SpecUrl(row.spec)}
                        className={`${LINK} text-body-small`}
                        aria-label={`${row.meta.title} spec on m3.material.io`}
                      >
                        spec
                      </a>
                    </>
                  )}
                </th>
                {COLUMNS.map(([key]) => (
                  <td
                    key={key}
                    className={`${cell} ${row[key] === 0 ? 'text-on-surface-variant' : 'text-on-surface'}`}
                  >
                    {row[key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-on-surface-variant">
                  {row.playground ? 'Full' : 'Examples'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul aria-label={caption} className="flex flex-col gap-3 medium:hidden">
        {rows.map((row) => (
          <li key={row.meta.slug}>
            <Card variant="outlined" className="gap-2 p-4">
              <a
                href={`${componentTabHref(row.meta.slug, 'api')}#spec-status`}
                className={`${LINK} text-title-small`}
              >
                {row.meta.title}
              </a>
              <p className="text-body-medium text-on-surface-variant">
                {COLUMNS.map(([key, label]) => `${row[key]} ${label.toLowerCase()}`).join(' · ')}
                {' · '}
                {row.playground ? 'Playground' : 'Examples only'}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}

/** A component's differences and extensions, listed under its name. */
function Notes({ summary }: { summary: Summary }) {
  const data = SPEC_DATA[summary.meta.slug];
  const notes = [
    ...(data?.differences ?? []).map((note) => ({ ...note, status: 'differs' as const })),
    ...(data?.extensions ?? []).map((note) => ({ ...note, status: 'extension' as const })),
  ];
  if (notes.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-title-medium text-on-surface">
        <a href={`${componentTabHref(summary.meta.slug, 'api')}#spec-status`} className={LINK}>
          {summary.meta.title}
        </a>
      </h3>
      <ul className="flex flex-col gap-3">
        {notes.map((note) => (
          <li key={`${note.status}-${note.item}`} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <SpecStatusTag status={note.status} />
              {/* Keeps the status and the item apart, read aloud and in the Markdown twin. */}
              <span className="sr-only">: </span>
              <span className="text-body-large text-on-surface">
                <CodeText text={note.item} />
              </span>
            </div>
            <p className="text-body-medium text-on-surface-variant">
              <CodeText text={note.note} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SpecStatusPage() {
  const stats = [
    ['Material 3 components', m3.length],
    ['Spec items built', total(m3, 'built')],
    ['Deliberate differences', total(m3, 'differs')],
    ['Extensions beyond the spec', total(pages, 'extensions')],
  ] as const;
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-headline-large text-on-surface">Spec status</h1>
        <p className="text-body-large text-on-surface-variant">
          Where every component stands against the{' '}
          <a href="https://m3.material.io/components" className={LINK}>
            Material 3 Expressive spec
          </a>
          : the variants and configurations it builds, each shown in a live example, where it
          deliberately differs, and what it adds. The spec is the authority, and its M3 Expressive
          column wins over the original M3 one. Each component&apos;s API tab has its own table,
          built from the same data.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 medium:grid-cols-4">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col-reverse justify-end gap-1 rounded-corner-large bg-surface-container p-4"
          >
            <dt className="text-label-large text-on-surface-variant">{label}</dt>
            <dd className="text-headline-medium text-on-surface tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-4">
        <h2 id="material-3" className="text-headline-small text-on-surface">
          Material 3 components
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Built: spec variants, configurations and main uses with a live example. Differs: a
          deliberate difference from the spec. Extensions: API or behaviour the spec doesn&apos;t
          have. Not built: a spec item left out, with the reason on the component&apos;s API tab
          (the deprecated navigation drawer, original navigation rail and bar, small FAB, segmented
          button and bottom app bar are never built).
        </p>
        <SummaryTable rows={m3} caption="Material 3 components' spec status" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 id="windmorph-pro" className="text-headline-small text-on-surface">
          Windmorph Pro components
        </h2>
        <p className="text-body-large text-on-surface-variant">
          Not part of Material Design 3: components from{' '}
          <InlineCode>@windmorph/react-pro</InlineCode>, built on M3&apos;s colour roles, type
          scale, shapes and motion. Built counts their own variants and configurations.
        </p>
        <SummaryTable rows={pro} caption="Windmorph Pro components' status" />
      </section>

      <section className="flex flex-col gap-6">
        <h2 id="differences-and-extensions" className="text-headline-small text-on-surface">
          Differences and extensions
        </h2>
        {pages.map((summary) => (
          <Notes key={summary.meta.slug} summary={summary} />
        ))}
      </section>
    </article>
  );
}
