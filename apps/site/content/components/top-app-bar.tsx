import { ExampleViewer } from '../../components/example-viewer';
import { TopAppBarScrolling } from '../../examples/top-app-bar/top-app-bar-scrolling';
import { TopAppBarVariants } from '../../examples/top-app-bar/top-app-bar-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Top app bar page body: the three sizes and scroll behaviour. */
export async function TopAppBarBody() {
  const [variants, scrolling] = await Promise.all([
    readExampleSource('top-app-bar/top-app-bar-variants.tsx'),
    readExampleSource('top-app-bar/top-app-bar-scrolling.tsx'),
  ]);
  const [variantsHtml, scrollingHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(scrolling),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A top app bar shows the current screen&apos;s title and its most important actions along
          the top. <code className="text-on-surface">small</code> is a single 64px row;{' '}
          <code className="text-on-surface">medium</code> and{' '}
          <code className="text-on-surface">large</code> are flexible two-row bars whose big title
          collapses into the top row as the page scrolls. A title can carry a{' '}
          <code className="text-on-surface">subtitle</code> and be centred with{' '}
          <code className="text-on-surface">titleAlign</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          It renders a <code className="text-on-surface">&lt;header&gt;</code> with a leading{' '}
          <code className="text-on-surface">navigationIcon</code> and trailing{' '}
          <code className="text-on-surface">actions</code>. Wrap the title in a heading element when
          it names the page. Add <code className="text-on-surface">scrollBehavior</code> and point{' '}
          <code className="text-on-surface">scrollRef</code> at the scroll container to react to
          content scrolling under the bar; leave them out for a static bar you position.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Sizes"
          code={variants}
          html={variantsHtml}
          fileName="top-app-bar-variants.tsx"
        >
          <TopAppBarVariants />
        </ExampleViewer>
        <ExampleViewer
          title="Scroll behaviour"
          code={scrolling}
          html={scrollingHtml}
          fileName="top-app-bar-scrolling.tsx"
        >
          <TopAppBarScrolling />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The bar is a <code className="text-on-surface">&lt;header&gt;</code> (a{' '}
            <code className="text-on-surface">banner</code> landmark at the top level). It does not
            name the page itself: wrap the <code className="text-on-surface">title</code> in a
            heading when it is the page&apos;s name.
          </li>
          <li>
            The navigation icon and actions are ordinary{' '}
            <code className="text-on-surface">IconButton</code>s, so each needs an{' '}
            <code className="text-on-surface">aria-label</code>; Tab reaches them in order.
          </li>
          <li>
            In a two-row bar only one title is announced at a time — the expanded one until it is
            half collapsed, then the top-row one — so the title is never read twice.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            These are Compose&apos;s flexible bars; the non-flexible medium / large bars and the
            centre-aligned bar are superseded by <code className="text-on-surface">titleAlign</code>
            .
          </li>
          <li>
            Compose shrinks the bar&apos;s height through nested scrolling. On the web the bar is{' '}
            <code className="text-on-surface">sticky</code> and keeps its layout height, sliding up
            via a <code className="text-on-surface">top</code> offset so the content moves exactly
            with the scroll. The offset differs per behaviour:{' '}
            <code className="text-on-surface">pinned</code> stays,{' '}
            <code className="text-on-surface">exit-until-collapsed</code> collapses once, and{' '}
            <code className="text-on-surface">enter-always</code> comes back on any scroll up.
          </li>
          <li>
            There is no fling settle or snap, and you cannot drag the bar itself. Scroll offsets and
            colours are written as custom properties from a scroll handler, so scrolling causes no
            React renders.
          </li>
        </ul>
      </section>
    </>
  );
}
