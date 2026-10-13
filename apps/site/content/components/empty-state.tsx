import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { EmptyStateNoPosts } from '../../examples/empty-state/empty-state-no-posts';
import { EmptyStateRetry } from '../../examples/empty-state/empty-state-retry';
import { EmptyStateSearch } from '../../examples/empty-state/empty-state-search';
import { EmptyStateVariants } from '../../examples/empty-state/empty-state-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Empty state page body: when to use it, examples, accessibility and theming. */
export async function EmptyStateBody(): Promise<ComponentDoc> {
  const [noPosts, retry, search, emptyStateVariants] = await Promise.all([
    readExampleSource('empty-state/empty-state-no-posts.tsx'),
    readExampleSource('empty-state/empty-state-retry.tsx'),
    readExampleSource('empty-state/empty-state-search.tsx'),
    readExampleSource('empty-state/empty-state-variants.tsx'),
  ]);
  const [noPostsHtml, retryHtml, searchHtml, emptyStateVariantsHtml] = await Promise.all([
    highlightSource(noPosts),
    highlightSource(retry),
    highlightSource(search),
    highlightSource(emptyStateVariants),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="No posts yet, in a card"
            code={noPosts}
            html={noPostsHtml}
            fileName="empty-state-no-posts.tsx"
          >
            <EmptyStateNoPosts />
          </ExampleViewer>
          <ExampleViewer
            title="Couldn't load, with a retry"
            code={retry}
            html={retryHtml}
            fileName="empty-state-retry.tsx"
          >
            <EmptyStateRetry />
          </ExampleViewer>
          <ExampleViewer
            title="No results, in an Expressive shape"
            code={search}
            html={searchHtml}
            fileName="empty-state-search.tsx"
          >
            <EmptyStateSearch />
          </ExampleViewer>
          <ExampleViewer
            title="Variants and sizes"
            code={emptyStateVariants}
            html={emptyStateVariantsHtml}
            fileName="empty-state-variants.tsx"
          >
            <EmptyStateVariants />
          </ExampleViewer>
        </section>
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            An empty state fills a region that has nothing to show, so it never looks blank or
            broken: no posts yet, no search results, a section that&apos;s coming soon, or a list
            that couldn&apos;t load. It says what&apos;s missing, why, and the next step. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>: M3 describes empty
            states as a pattern, and this one comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>, built from M3&apos;s type scale,
            container colour roles, shapes, motion tokens and the Card.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Use a Skeleton while content loads and its layout is known, a Snackbar for feedback
            about an action, and helper text for a form field&apos;s problem.
          </p>
        </section>
      </>
    ),
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className="text-headline-small text-on-surface">
            Keyboard &amp; screen reader
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>The icon is decorative and hidden; the title and description are read as text.</li>
            <li>
              <InlineCode>titleAs=&quot;h2&quot;</InlineCode> (or h3, h4) makes the title a heading
              when the empty state is a section&apos;s only content.
            </li>
            <li>
              <InlineCode>announce</InlineCode> makes it a status region, for an empty state that
              replaces results after a search or filter.
            </li>
            <li>
              It fades in on the effects spring, and appears at once under reduced motion. In
              forced-colours mode the icon keeps the text colour.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="variants-sizes-and-tones" className="text-headline-small text-on-surface">
            Variants, sizes and tones
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>variant</InlineCode>: <InlineCode>plain</InlineCode> (the default) sits on
              whatever surface it&apos;s in; <InlineCode>filled</InlineCode>,{' '}
              <InlineCode>elevated</InlineCode> and <InlineCode>outlined</InlineCode> wrap it in the
              matching Card, to sit among cards.
            </li>
            <li>
              <InlineCode>size</InlineCode>: <InlineCode>sm</InlineCode> in a list or small card,{' '}
              <InlineCode>md</InlineCode> in a section, <InlineCode>lg</InlineCode> for a page area.
              Each uses its own type roles, icon size and spacing.
            </li>
            <li>
              <InlineCode>tone</InlineCode> colours the icon container with a container role:
              secondary (the default), primary, tertiary, neutral, or error for &quot;couldn&apos;t
              load&quot;.
            </li>
            <li>
              <InlineCode>shape</InlineCode> is a circle or any of the 35 M3 Expressive shapes.
            </li>
            <li>
              Give at most one filled or tonal action, and a text action second, so the empty state
              never competes with the page&apos;s main action.
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Only colour roles: the tone&apos;s container and content roles for the icon,{' '}
              <InlineCode>on-surface</InlineCode> for the title and{' '}
              <InlineCode>on-surface-variant</InlineCode> for the description, so it follows every
              theme, mode and contrast level.
            </li>
            <li>
              Override the container colour with <InlineCode>className</InlineCode>, and any part
              with <InlineCode>classNames</InlineCode> (root, media, icon, title, description,
              actions).
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
