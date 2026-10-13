import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { TopAppBarChips } from '../../examples/top-app-bar/top-app-bar-chips';
import { TopAppBarScrolling } from '../../examples/top-app-bar/top-app-bar-scrolling';
import { TopAppBarTransparent } from '../../examples/top-app-bar/top-app-bar-transparent';
import { TopAppBarVariants } from '../../examples/top-app-bar/top-app-bar-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Top app bar page body: the three sizes and scroll behaviour. */
export async function TopAppBarBody(): Promise<ComponentDoc> {
  const [variants, scrolling, chips, transparent] = await Promise.all([
    readExampleSource('top-app-bar/top-app-bar-variants.tsx'),
    readExampleSource('top-app-bar/top-app-bar-scrolling.tsx'),
    readExampleSource('top-app-bar/top-app-bar-chips.tsx'),
    readExampleSource('top-app-bar/top-app-bar-transparent.tsx'),
  ]);
  const [variantsHtml, scrollingHtml, chipsHtml, transparentHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(scrolling),
    highlightSource(chips),
    highlightSource(transparent),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
          <ExampleViewer
            title="A row of chips in the bar"
            code={chips}
            html={chipsHtml}
            fileName="top-app-bar-chips.tsx"
          >
            <TopAppBarChips />
          </ExampleViewer>
          <ExampleViewer
            title="Transparent on scroll"
            code={transparent}
            html={transparentHtml}
            fileName="top-app-bar-transparent.tsx"
          >
            <TopAppBarTransparent />
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
            A top app bar shows the current screen&apos;s title and its most important actions along
            the top. <InlineCode>small</InlineCode> is a single 64px row;{' '}
            <InlineCode>medium</InlineCode> and <InlineCode>large</InlineCode> are flexible two-row
            bars whose big title collapses into the top row as the page scrolls. A title can carry a{' '}
            <InlineCode>subtitle</InlineCode> and be centred with{' '}
            <InlineCode>titleAlign</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            It renders a <InlineCode>&lt;header&gt;</InlineCode> with a leading{' '}
            <InlineCode>navigationIcon</InlineCode> and trailing <InlineCode>actions</InlineCode>.
            Wrap the title in a heading element when it names the page. Add{' '}
            <InlineCode>scrollBehavior</InlineCode> and point <InlineCode>scrollRef</InlineCode> at
            the scroll container to react to content scrolling under the bar; leave them out for a
            static bar you position.
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
            <li>
              The bar is a <InlineCode>&lt;header&gt;</InlineCode> (a{' '}
              <InlineCode>banner</InlineCode> landmark at the top level). It does not name the page
              itself: wrap the <InlineCode>title</InlineCode> in a heading when it is the
              page&apos;s name.
            </li>
            <li>
              The navigation icon and actions are ordinary <InlineCode>IconButton</InlineCode>s, so
              each needs an <InlineCode>aria-label</InlineCode>; Tab reaches them in order.
            </li>
            <li>
              In a two-row bar only one title is announced at a time — the expanded one until it is
              half collapsed, then the top-row one — so the title is never read twice.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="differences-from-compose" className="text-headline-small text-on-surface">
            Differences from Compose
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              These are Compose&apos;s flexible bars; the non-flexible medium / large bars and the
              centre-aligned bar are superseded by <InlineCode>titleAlign</InlineCode>.
            </li>
            <li>
              Compose shrinks the bar&apos;s height through nested scrolling. On the web the bar is{' '}
              <InlineCode>sticky</InlineCode> and keeps its layout height, sliding up via a{' '}
              <InlineCode>top</InlineCode> offset so the content moves exactly with the scroll. The
              offset differs per behaviour: <InlineCode>pinned</InlineCode> stays,{' '}
              <InlineCode>exit-until-collapsed</InlineCode> collapses once, and{' '}
              <InlineCode>enter-always</InlineCode> comes back on any scroll up. A medium or large{' '}
              <InlineCode>enter-always</InlineCode> bar comes back small and expands only at the top
              of the page, as M3 asks.
            </li>
            <li>A long expanded title wraps to two lines at most (M3).</li>
            <li>
              There is no fling settle or snap, and you cannot drag the bar itself. Scroll offsets
              and colours are written as custom properties from a scroll handler, so scrolling
              causes no React renders.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
