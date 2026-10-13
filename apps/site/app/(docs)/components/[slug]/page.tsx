import { PropsTable } from '@windmorph/react-pro';
import type { Metadata } from 'next';
import { pageMetadata } from '../../../../lib/site-metadata';
import { notFound } from 'next/navigation';
import {
  COMPONENT_PAGES,
  COMPONENT_PAGE_MAP,
  COMPONENT_SLOTS,
} from '../../../../content/components/registry';
import { Playground } from '../../../../components/playground/playground';
import { SpecsCard } from '../../../../components/specs-card';
import { readComponentPropsSafe } from '../../../../lib/component-props';
import { InlineCode } from '../../../../components/inline-code';

interface PageParams {
  params: Promise<{ slug: string }>;
}

/** Statically generates one page per registered component (required by `output: 'export'`). */
export function generateStaticParams() {
  return COMPONENT_PAGES.map((page) => ({ slug: page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const page = COMPONENT_PAGE_MAP[slug];
  if (!page) return { title: 'Components' };
  return pageMetadata(page.title, page.summary, `/components/${slug}`);
}

export default async function ComponentPage({ params }: PageParams) {
  const { slug } = await params;
  const page = COMPONENT_PAGE_MAP[slug];
  if (!page) notFound();
  const {
    title,
    summary,
    propsComponents,
    Body,
    playground,
    specs,
    related,
    whenNotToUse,
    stability,
  } = page;

  // Read every component's generated props JSON at build time; a missing file is skipped.
  const tables = await Promise.all(
    propsComponents.map(async (name) => ({
      name,
      json: await readComponentPropsSafe(name),
      slots: COMPONENT_SLOTS[name],
    })),
  );

  // The Playground drives its controls from the first documented component's props JSON.
  const playgroundName = propsComponents[0];
  const playgroundJson =
    playground === 'full' && playgroundName
      ? tables.find((table) => table.name === playgroundName)?.json
      : null;

  const relatedPages = (related ?? [])
    .map((relatedSlug) => COMPONENT_PAGE_MAP[relatedSlug])
    .filter((relatedPage): relatedPage is NonNullable<typeof relatedPage> => Boolean(relatedPage));

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-headline-large text-on-surface">{title}</h1>
          {stability === 'preview' && (
            <span className="rounded-corner-full bg-tertiary-container px-3 py-1 text-label-medium text-on-tertiary-container">
              Preview
            </span>
          )}
        </div>
        <p className="text-body-large text-on-surface-variant">{summary}</p>
      </header>

      {playgroundJson && (
        <Playground slug={slug} componentName={playgroundName!} props={playgroundJson.props} />
      )}

      <Body />

      {specs && <SpecsCard specs={specs} />}

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Props</h2>
        {tables.map(({ name, json, slots }) => {
          if (!json) {
            console.warn(`[components] no generated props JSON for "${name}"; skipping its table.`);
            return null;
          }
          // Skip the props table (and its caption) when a component documents no props — e.g.
          // sub-components that only extend HTML attributes produce an empty `props` array.
          const hasProps = json.props.length > 0;
          const hasSlots = Boolean(slots && slots.length > 0);
          // Nothing to render for this component (no props and no slots): skip it entirely.
          if (!hasProps && !hasSlots) return null;
          return (
            <div key={name} className="flex flex-col gap-3">
              {hasProps && <PropsTable caption={`${name} props`} rows={json.props} />}
              {slots && slots.length > 0 && (
                <p className="text-body-medium text-on-surface-variant">
                  <span className="text-on-surface">{name} classNames slots:</span>{' '}
                  {slots.map((slot, index) => (
                    <span key={slot}>
                      {index > 0 && ', '}
                      <InlineCode>{slot}</InlineCode>
                    </span>
                  ))}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {(relatedPages.length > 0 || whenNotToUse) && (
        <section className="flex flex-col gap-3">
          {relatedPages.length > 0 && (
            <p className="text-body-large text-on-surface-variant">
              <span className="text-on-surface">Related:</span>{' '}
              {relatedPages.map((relatedPage, index) => (
                <span key={relatedPage.slug}>
                  {index > 0 && ', '}
                  <a
                    href={`/components/${relatedPage.slug}`}
                    className="rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                  >
                    {relatedPage.title}
                  </a>
                </span>
              ))}
            </p>
          )}
          {whenNotToUse && (
            <p className="text-body-large text-on-surface-variant">
              <span className="text-on-surface">When not to use:</span> {whenNotToUse}
            </p>
          )}
        </section>
      )}
    </article>
  );
}
