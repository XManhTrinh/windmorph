import { m3GuidelinesUrl } from '../content/components/catalog';
import {
  COMPONENT_PAGE_MAP,
  COMPONENT_SLOTS,
  type ComponentPageMeta,
} from '../content/components/registry';
import {
  COMPONENT_TABS,
  componentTabHref,
  type ComponentDoc,
  type ComponentTab,
} from '../content/components/doc';
import { HookTable } from '../components/hook-table';
import { InlineCode } from '../components/inline-code';
import { Playground } from '../components/playground/playground';
import { PropsList } from '../components/props-list';
import { SpecStatus } from '../components/spec-status';
import { SpecsCard } from '../components/specs-card';
import { TokenTable } from '../components/token-table';
import { SPEC_DATA } from '../content/components/spec-data';
import {
  readComponentPropsSafe,
  readHookDocSafe,
  type ComponentPropsFile,
  type HookDocFile,
} from './component-props';
import { componentSizes, formatKilobytes } from './bundle-size';

const docs = new Map<string, Promise<ComponentDoc>>();

/**
 * A component page's written content, built once per slug: every tab of a page reads the
 * same example sources, so they share one build.
 */
export function loadComponentDoc(page: ComponentPageMeta): Promise<ComponentDoc> {
  let doc = docs.get(page.slug);
  if (!doc) {
    doc = Promise.resolve(page.loadDoc());
    docs.set(page.slug, doc);
  }
  return doc;
}

interface PropsTableData {
  name: string;
  json: ComponentPropsFile | null;
  slots?: string[];
}

/** Every documented component's generated props JSON (a missing file is skipped). */
function readTables(page: ComponentPageMeta): Promise<PropsTableData[]> {
  return Promise.all(
    page.propsComponents.map(async (name) => ({
      name,
      json: await readComponentPropsSafe(name),
      slots: COMPONENT_SLOTS[name],
    })),
  );
}

/** The tabs a page has: a tab with nothing to show is left out. */
export async function componentTabs(page: ComponentPageMeta): Promise<ComponentTab[]> {
  const doc = await loadComponentDoc(page);
  const has: Record<ComponentTab, boolean> = {
    overview: Boolean(doc.overview) || page.playground === 'full',
    api:
      Boolean(doc.api) ||
      (doc.tokens ?? []).length > 0 ||
      Boolean(page.specs) ||
      page.propsComponents.length > 0 ||
      (page.hooks ?? []).length > 0 ||
      Boolean(SPEC_DATA[page.slug]),
    accessibility: Boolean(doc.accessibility),
    guidelines:
      Boolean(doc.guidelines) ||
      Boolean(page.whenNotToUse) ||
      (page.related ?? []).length > 0 ||
      m3GuidelinesUrl(page.slug) !== null,
  };
  return COMPONENT_TABS.filter((tab) => has[tab]);
}

function SectionHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-headline-small text-on-surface">
      {children}
    </h2>
  );
}

const LINK =
  'rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary';

async function OverviewTab({ page, doc }: { page: ComponentPageMeta; doc: ComponentDoc }) {
  // The Playground drives its controls from the first documented component's props JSON.
  const playgroundName = page.propsComponents[0];
  const playgroundJson =
    page.playground === 'full' && playgroundName
      ? await readComponentPropsSafe(playgroundName)
      : null;
  return (
    <>
      {playgroundJson && playgroundName && (
        <Playground slug={page.slug} componentName={playgroundName} props={playgroundJson.props} />
      )}
      {doc.overview}
    </>
  );
}

async function ApiTab({ page, doc }: { page: ComponentPageMeta; doc: ComponentDoc }) {
  const sizes = page.pro ? [] : await componentSizes(page.propsComponents);
  const tables = (await readTables(page)).filter(
    // A component with no props and no classNames slots has nothing to list.
    ({ json, slots }) => json && (json.props.length > 0 || (slots && slots.length > 0)),
  );
  const hooks = (await Promise.all((page.hooks ?? []).map((name) => readHookDocSafe(name)))).filter(
    (hook): hook is HookDocFile => hook !== null,
  );
  const specData = SPEC_DATA[page.slug];
  return (
    <>
      {tables.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeading id="props">Props</SectionHeading>
          {tables.map(({ name, json, slots }) => (
            <div key={name} className="flex flex-col gap-3">
              {json && json.props.length > 0 && (
                <>
                  {page.propsComponents.length > 1 && (
                    <h3 className="text-title-medium text-on-surface">
                      <InlineCode dir="ltr">{name}</InlineCode>
                    </h3>
                  )}
                  <PropsList caption={`${name} props`} rows={json.props} />
                </>
              )}
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
          ))}
        </section>
      )}
      {doc.tokens && doc.tokens.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeading id="tokens">Tokens</SectionHeading>
          <p className="text-body-large text-on-surface-variant">
            M3&apos;s component tokens as CSS variables. Each is unset until you set it, on{' '}
            <InlineCode>:root</InlineCode>, a theme or any ancestor, and falls back to the default
            shown. The root carries <InlineCode>data-variant</InlineCode> (and{' '}
            <InlineCode>data-size</InlineCode> where it has sizes), which picks the variables that
            apply. See{' '}
            <a href="/customisation#component-tokens" className={LINK}>
              Component tokens
            </a>{' '}
            in the Customisation guide.
          </p>
          {doc.tokens.map((set) => (
            <TokenTable key={set.name} set={set} caption={`${page.title} tokens (${set.name})`} />
          ))}
        </section>
      )}
      {hooks.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeading id="hooks">Hooks</SectionHeading>
          {hooks.map((hook) => (
            <HookTable key={hook.displayName} doc={hook} />
          ))}
        </section>
      )}
      {specData && <SpecStatus slug={page.slug} title={page.title} data={specData} />}
      {sizes.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeading id="bundle-size">Bundle size</SectionHeading>
          <p className="text-body-large text-on-surface-variant">
            Gzipped, as published: the component and the library code it imports. React, React Aria,
            Motion and the other dependencies aren&apos;t counted, and your bundler&apos;s minifier
            makes it smaller still. CI fails a change that grows it past its budget.
          </p>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            {sizes.map(({ names, gzip }) => (
              <li key={names.join()}>
                {names.map((name, index) => (
                  <span key={name}>
                    {index > 0 && ', '}
                    <InlineCode>{name}</InlineCode>
                  </span>
                ))}
                : {formatKilobytes(gzip)}
              </li>
            ))}
          </ul>
        </section>
      )}
      {page.specs && <SpecsCard specs={page.specs} />}
      {doc.api}
    </>
  );
}

function GuidelinesTab({ page, doc }: { page: ComponentPageMeta; doc: ComponentDoc }) {
  const related = (page.related ?? [])
    .map((slug) => COMPONENT_PAGE_MAP[slug])
    .filter((relatedPage): relatedPage is ComponentPageMeta => Boolean(relatedPage));
  const m3 = m3GuidelinesUrl(page.slug);
  return (
    <>
      {doc.guidelines}
      {page.whenNotToUse && (
        <section className="flex flex-col gap-3">
          <SectionHeading id="when-not-to-use">When not to use</SectionHeading>
          <p className="text-body-large text-on-surface-variant">{page.whenNotToUse}</p>
        </section>
      )}
      {(related.length > 0 || m3) && (
        <section className="flex flex-col gap-3">
          <SectionHeading id="see-also">See also</SectionHeading>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            {m3 && (
              <li>
                <a href={m3} className={LINK}>
                  {page.title} on m3.material.io
                </a>
                : Material&apos;s own guidelines, with anatomy and specs.
              </li>
            )}
            {related.map((relatedPage) => (
              <li key={relatedPage.slug}>
                <a href={componentTabHref(relatedPage.slug, 'guidelines')} className={LINK}>
                  {relatedPage.title}
                </a>
                : {relatedPage.summary}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** One tab of a component page, rendered at build time. */
export async function ComponentTabContent({ slug, tab }: { slug: string; tab: ComponentTab }) {
  const page = COMPONENT_PAGE_MAP[slug];
  if (!page) return null;
  const doc = await loadComponentDoc(page);
  return (
    <div className="flex flex-col gap-10">
      {tab === 'overview' && <OverviewTab page={page} doc={doc} />}
      {tab === 'api' && <ApiTab page={page} doc={doc} />}
      {tab === 'accessibility' && doc.accessibility}
      {tab === 'guidelines' && <GuidelinesTab page={page} doc={doc} />}
    </div>
  );
}
