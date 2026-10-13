import { ExampleViewer } from '../../components/example-viewer';
import { EmptyStateNoPosts } from '../../examples/empty-state/empty-state-no-posts';
import { EmptyStateRetry } from '../../examples/empty-state/empty-state-retry';
import { EmptyStateSearch } from '../../examples/empty-state/empty-state-search';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Empty state page body: when to use it, examples, accessibility and theming. */
export async function EmptyStateBody() {
  const [noPosts, retry, search] = await Promise.all([
    readExampleSource('empty-state/empty-state-no-posts.tsx'),
    readExampleSource('empty-state/empty-state-retry.tsx'),
    readExampleSource('empty-state/empty-state-search.tsx'),
  ]);
  const [noPostsHtml, retryHtml, searchHtml] = await Promise.all([
    highlightSource(noPosts),
    highlightSource(retry),
    highlightSource(search),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          An empty state fills a region that has nothing to show, so it never looks blank or broken:
          no posts yet, no search results, a section that&apos;s coming soon, or a list that
          couldn&apos;t load. It says what&apos;s missing, why, and the next step. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>: M3 describes empty
          states as a pattern, and this one comes from{' '}
          <code className="text-on-surface">@windmorph/react-pro</code>, built from M3&apos;s type
          scale, container colour roles, shapes, motion tokens and the Card.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Use a Skeleton while content loads and its layout is known, a Snackbar for feedback about
          an action, and helper text for a form field&apos;s problem.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Variants, sizes and tones</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">variant</code>:{' '}
            <code className="text-on-surface">plain</code> (the default) sits on whatever surface
            it&apos;s in; <code className="text-on-surface">filled</code>,{' '}
            <code className="text-on-surface">elevated</code> and{' '}
            <code className="text-on-surface">outlined</code> wrap it in the matching Card, to sit
            among cards.
          </li>
          <li>
            <code className="text-on-surface">size</code>:{' '}
            <code className="text-on-surface">sm</code> in a list or small card,{' '}
            <code className="text-on-surface">md</code> in a section,{' '}
            <code className="text-on-surface">lg</code> for a page area. Each uses its own type
            roles, icon size and spacing.
          </li>
          <li>
            <code className="text-on-surface">tone</code> colours the icon container with a
            container role: secondary (the default), primary, tertiary, neutral, or error for
            &quot;couldn&apos;t load&quot;.
          </li>
          <li>
            <code className="text-on-surface">shape</code> is a circle or any of the 35 M3
            Expressive shapes.
          </li>
          <li>
            Give at most one filled or tonal action, and a text action second, so the empty state
            never competes with the page&apos;s main action.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>The icon is decorative and hidden; the title and description are read as text.</li>
          <li>
            <code className="text-on-surface">titleAs=&quot;h2&quot;</code> (or h3, h4) makes the
            title a heading when the empty state is a section&apos;s only content.
          </li>
          <li>
            <code className="text-on-surface">announce</code> makes it a status region, for an empty
            state that replaces results after a search or filter.
          </li>
          <li>
            It fades in on the effects spring, and appears at once under reduced motion. In
            forced-colours mode the icon keeps the text colour.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Only colour roles: the tone&apos;s container and content roles for the icon,{' '}
            <code className="text-on-surface">on-surface</code> for the title and{' '}
            <code className="text-on-surface">on-surface-variant</code> for the description, so it
            follows every theme, mode and contrast level.
          </li>
          <li>
            Override the container colour with <code className="text-on-surface">className</code>,
            and any part with <code className="text-on-surface">classNames</code> (root, media,
            icon, title, description, actions).
          </li>
        </ul>
      </section>
    </>
  );
}
