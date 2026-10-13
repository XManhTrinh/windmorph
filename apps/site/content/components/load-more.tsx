import { loadMoreTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { TokenTable } from '../../components/token-table';
import { LoadMoreList } from '../../examples/load-more/load-more-list';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** LoadMore page body: purpose, example, behaviour, accessibility and tokens. */
export async function LoadMoreBody() {
  const source = await readExampleSource('load-more/load-more-list.tsx');
  const html = await highlightSource(source);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          The end of a list that loads a page at a time: it loads the next page as the end comes
          near, with Load more as the keyboard and screen-reader fallback, shows what the app wants
          while loading, and offers Retry when a page fails. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
          <InlineCode>@windmorph/react-pro</InlineCode>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="A list a page at a time"
          code={source}
          html={html}
          fileName="load-more-list.tsx"
        >
          <LoadMoreList />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Behaviour</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <InlineCode>status</InlineCode> is the app&apos;s: <InlineCode>idle</InlineCode>,{' '}
            <InlineCode>loading</InlineCode>, <InlineCode>error</InlineCode> or{' '}
            <InlineCode>done</InlineCode>.
          </li>
          <li>
            With <InlineCode>auto</InlineCode> (default) it calls{' '}
            <InlineCode>onLoadMore</InlineCode> once per idle state as the end comes within{' '}
            <InlineCode>rootMargin</InlineCode> (800px) of the viewport. A list in its own scrolling
            box should turn <InlineCode>auto</InlineCode> off, as in the example.
          </li>
          <li>
            It never retries by itself after a failure, so a failing page isn&apos;t requested in a
            loop.
          </li>
          <li>
            <InlineCode>loading</InlineCode> replaces the default loading indicator (e.g. a skeleton
            of one item); <InlineCode>end</InlineCode> shows once everything is loaded.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Load more and Retry are buttons; the failure&apos;s message is announced politely (
            <InlineCode>{'role="status"'}</InlineCode>).
          </li>
          <li>
            Every word comes from <InlineCode>labels</InlineCode>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming &amp; tokens</h2>
        <p className="text-body-large text-on-surface-variant">
          Set the tokens below on it or any ancestor. Style the parts with{' '}
          <InlineCode>classNames</InlineCode> (<InlineCode>root</InlineCode>,{' '}
          <InlineCode>button</InlineCode>, <InlineCode>error</InlineCode>).
        </p>
        <TokenTable set={loadMoreTokenSet} caption="Load more tokens" />
      </section>
    </>
  );
}
