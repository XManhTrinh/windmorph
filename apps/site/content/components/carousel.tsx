import { ExampleViewer } from '../../components/example-viewer';
import { CarouselMultiBrowse } from '../../examples/carousel/carousel-multibrowse';
import { CarouselVariants } from '../../examples/carousel/carousel-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Carousel page body: multi-browse, uncontained and hero. */
export async function CarouselBody() {
  const [multi, variants] = await Promise.all([
    readExampleSource('carousel/carousel-multibrowse.tsx'),
    readExampleSource('carousel/carousel-variants.tsx'),
  ]);
  const [multiHtml, variantsHtml] = await Promise.all([
    highlightSource(multi),
    highlightSource(variants),
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
          <code className="text-on-surface">uncontained</code> (fixed-size items, the last cut off)
          or <code className="text-on-surface">hero</code> (one large item with small ones beside
          it). Give the carousel its cross-axis size with{' '}
          <code className="text-on-surface">className</code>.
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
            &quot;slide&quot; and labelled &quot;n of N&quot;.
          </li>
          <li>
            The scroller is focusable: the arrow keys scroll it natively, as do touch and trackpads;
            mouse drag scrolls too, pausing snapping while dragging.
          </li>
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
          <li>Multi-browse and hero snap one item at a time; uncontained does not snap.</li>
          <li>
            Items are masked with 28px (extra-large) corners and spacing defaults to 8px.
            Deviations: no content padding, no parallax helper, and before hydration items render
            unmasked at the preferred size.
          </li>
        </ul>
      </section>
    </>
  );
}
