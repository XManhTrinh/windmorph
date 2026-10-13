import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const CarouselActions = lazyExample('carousel/carousel-actions', 'CarouselActions');
const CarouselLayouts = lazyExample('carousel/carousel-layouts', 'CarouselLayouts');
const CarouselMultiBrowse = lazyExample('carousel/carousel-multibrowse', 'CarouselMultiBrowse');
const CarouselVariants = lazyExample('carousel/carousel-variants', 'CarouselVariants');
const CarouselHero = lazyExample('carousel/carousel-hero', 'CarouselHero');

/** Carousel page body: multi-browse, uncontained, multi-aspect, hero and full-screen. */
export async function CarouselBody(): Promise<ComponentDoc> {
  const [multi, variants, layouts, actions] = await Promise.all([
    readExampleSource('carousel/carousel-multibrowse.tsx'),
    readExampleSource('carousel/carousel-variants.tsx'),
    readExampleSource('carousel/carousel-layouts.tsx'),
    readExampleSource('carousel/carousel-actions.tsx'),
  ]);
  const [multiHtml, variantsHtml, layoutsHtml, actionsHtml] = await Promise.all([
    highlightSource(multi),
    highlightSource(variants),
    highlightSource(layouts),
    highlightSource(actions),
  ]);

  const hero = await readExampleSource('carousel/carousel-hero.tsx');
  const heroHtml = await highlightSource(hero);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Multi-browse"
            code={multi}
            html={multiHtml}
            fileName="carousel-multibrowse.tsx"
          >
            <CarouselMultiBrowse />
          </ExampleViewer>
          <ExampleViewer title="Hero" code={hero} html={heroHtml} fileName="carousel-hero.tsx">
            <CarouselHero />
          </ExampleViewer>
          <ExampleViewer
            title="Uncontained and hero"
            code={variants}
            html={variantsHtml}
            fileName="carousel-variants.tsx"
          >
            <CarouselVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Multi-aspect and full-screen"
            code={layouts}
            html={layoutsHtml}
            fileName="carousel-layouts.tsx"
          >
            <CarouselLayouts />
          </ExampleViewer>
          <ExampleViewer
            title="Items that open something"
            code={actions}
            html={actionsHtml}
            fileName="carousel-actions.tsx"
          >
            <CarouselActions />
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
            A carousel is a scrollable row (or column) of items whose sizes change along
            Compose&apos;s keylines as they scroll. Use it to browse a set of images or cards; for a
            static grid of equal items use a layout utility instead.
          </p>
          <p className="text-body-large text-on-surface-variant">
            The <InlineCode>variant</InlineCode> is <InlineCode>multi-browse</InlineCode> (large,
            medium and small items), <InlineCode>uncontained</InlineCode> (fixed-size items, the
            last cut off), <InlineCode>multi-aspect</InlineCode> (uncontained, with items of their
            own widths from 9:16 to 16:9), <InlineCode>hero</InlineCode> (one large item with small
            ones beside it) or <InlineCode>full-screen</InlineCode> (one edge-to-edge item at a
            time, vertical by default). Give the carousel its cross-axis size with{' '}
            <InlineCode>className</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            On a vertically scrolling page, put a &quot;Show all&quot; button (or an arrow icon
            button beside the carousel&apos;s header) below the carousel, leading to a page of every
            item, so all items can be seen without scrolling sideways. Don&apos;t put buttons inside
            the carousel or over it.
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
              The carousel is a <InlineCode>region</InlineCode> with{' '}
              <InlineCode>aria-roledescription=&quot;carousel&quot;</InlineCode> and needs a name (
              <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode>).
            </li>
            <li>
              Each item is a <InlineCode>group</InlineCode> described as a &quot;slide&quot; and
              labelled &quot;n of N&quot; with numbers in the locale;{' '}
              <InlineCode>labels.slide</InlineCode> translates it.
            </li>
            <li>
              The container never takes focus: Tab lands on the first item, and Tab or the arrow
              keys (mirrored right to left) move between items, scrolling each into place; Home and
              End go to the first and last. Up and Down (Left and Right in a vertical carousel)
              leave it for the next or previous control.
            </li>
            <li>
              With <InlineCode>onAction</InlineCode>, Space or Enter activates the focused item, as
              does a press; <InlineCode>disabledIndexes</InlineCode> turns items off.
            </li>
            <li>
              Under reduced motion items don&apos;t change size as they scroll: every item keeps the
              large size, unmasked, and a hero carousel shows part of the next item. Let such a
              carousel reach the window&apos;s edges.
            </li>
            <li>Touch, trackpads and mouse drag scroll it; snapping pauses while dragging.</li>
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
              The keylines are a TypeScript port of Compose&apos;s <InlineCode>carousel</InlineCode>{' '}
              package; with 360px, a 186px preferred size and 8px spacing that gives 186 · 118 · 40,
              mirrored at the end, as Compose does.
            </li>
            <li>
              Compose drives a pager; here the carousel scrolls natively and a library-owned mask
              layer inside each item is translated and clipped on every scroll frame, so the root
              and slots are never transformed and nothing re-renders while scrolling.
            </li>
            <li>
              Hero and full-screen snap one item at a time; a multi-browse fling crosses several
              items and then snaps; uncontained and multi-aspect scroll freely unless{' '}
              <InlineCode>snap=&quot;item&quot;</InlineCode>.
            </li>
            <li>
              Padding follows the spec: 16px before and after the items and 8px across them
              (uncontained and multi-aspect: 16px before only; full-screen: none), set with{' '}
              <InlineCode>contentPadding</InlineCode>. As in Compose, items scroll over the start
              and end padding.
            </li>
            <li>
              Items are masked with 28px (extra-large) corners, tightening to 20px while pressed,
              and spacing defaults to 8px (16px full-screen). Deviations: no parallax helper, and
              before hydration items render unmasked at the preferred size.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
