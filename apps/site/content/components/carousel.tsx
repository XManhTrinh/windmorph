import { ExampleViewer } from '../../components/example-viewer';
import { CarouselActions } from '../../examples/carousel/carousel-actions';
import { CarouselLayouts } from '../../examples/carousel/carousel-layouts';
import { CarouselMultiBrowse } from '../../examples/carousel/carousel-multibrowse';
import { CarouselVariants } from '../../examples/carousel/carousel-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Carousel page body: multi-browse, uncontained, multi-aspect, hero and full-screen. */
export async function CarouselBody() {
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

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A carousel is a scrollable row (or column) of items whose sizes change along
          Compose&apos;s keylines as they scroll. Use it to browse a set of images or cards; for a
          static grid of equal items use a layout utility instead.
        </p>
        <p className="text-body-large text-on-surface-variant">
          The <code className="text-on-surface">variant</code> is{' '}
          <code className="text-on-surface">multi-browse</code> (large, medium and small items),{' '}
          <code className="text-on-surface">uncontained</code> (fixed-size items, the last cut off),{' '}
          <code className="text-on-surface">multi-aspect</code> (uncontained, with items of their
          own widths from 9:16 to 16:9), <code className="text-on-surface">hero</code> (one large
          item with small ones beside it) or <code className="text-on-surface">full-screen</code>{' '}
          (one edge-to-edge item at a time, vertical by default). Give the carousel its cross-axis
          size with <code className="text-on-surface">className</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          On a vertically scrolling page, put a &quot;Show all&quot; button (or an arrow icon button
          beside the carousel&apos;s header) below the carousel, leading to a page of every item, so
          all items can be seen without scrolling sideways. Don&apos;t put buttons inside the
          carousel or over it.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Multi-browse"
          code={multi}
          html={multiHtml}
          fileName="carousel-multibrowse.tsx"
        >
          <CarouselMultiBrowse />
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

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The carousel is a <code className="text-on-surface">region</code> with{' '}
            <code className="text-on-surface">aria-roledescription=&quot;carousel&quot;</code> and
            needs a name (<code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code>).
          </li>
          <li>
            Each item is a <code className="text-on-surface">group</code> described as a
            &quot;slide&quot; and labelled &quot;n of N&quot; with numbers in the locale;{' '}
            <code className="text-on-surface">labels.slide</code> translates it.
          </li>
          <li>
            The container never takes focus: Tab lands on the first item, and Tab or the arrow keys
            (mirrored right to left) move between items, scrolling each into place; Home and End go
            to the first and last. Up and Down (Left and Right in a vertical carousel) leave it for
            the next or previous control.
          </li>
          <li>
            With <code className="text-on-surface">onAction</code>, Space or Enter activates the
            focused item, as does a press; <code className="text-on-surface">disabledIndexes</code>{' '}
            turns items off.
          </li>
          <li>
            Under reduced motion items don&apos;t change size as they scroll: every item keeps the
            large size, unmasked, and a hero carousel shows part of the next item. Let such a
            carousel reach the window&apos;s edges.
          </li>
          <li>Touch, trackpads and mouse drag scroll it; snapping pauses while dragging.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The keylines are a TypeScript port of Compose&apos;s{' '}
            <code className="text-on-surface">carousel</code> package; with 360px, a 186px preferred
            size and 8px spacing that gives 186 · 118 · 40, mirrored at the end, as Compose does.
          </li>
          <li>
            Compose drives a pager; here the carousel scrolls natively and a library-owned mask
            layer inside each item is translated and clipped on every scroll frame, so the root and
            slots are never transformed and nothing re-renders while scrolling.
          </li>
          <li>
            Hero and full-screen snap one item at a time; a multi-browse fling crosses several items
            and then snaps; uncontained and multi-aspect scroll freely unless{' '}
            <code className="text-on-surface">snap=&quot;item&quot;</code>.
          </li>
          <li>
            Padding follows the spec: 16px before and after the items and 8px across them
            (uncontained and multi-aspect: 16px before only; full-screen: none), set with{' '}
            <code className="text-on-surface">contentPadding</code>. As in Compose, items scroll
            over the start and end padding.
          </li>
          <li>
            Items are masked with 28px (extra-large) corners, tightening to 20px while pressed, and
            spacing defaults to 8px (16px full-screen). Deviations: no parallax helper, and before
            hydration items render unmasked at the preferred size.
          </li>
        </ul>
      </section>
    </>
  );
}
