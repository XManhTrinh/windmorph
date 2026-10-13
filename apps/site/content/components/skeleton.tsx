import { ExampleViewer } from '../../components/example-viewer';
import { SkeletonAnimations } from '../../examples/skeleton/skeleton-animations';
import { SkeletonCards } from '../../examples/skeleton/skeleton-cards';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Skeleton page body: when to use it, examples, accessibility and theming. */
export async function SkeletonBody() {
  const [cards, animations] = await Promise.all([
    readExampleSource('skeleton/skeleton-cards.tsx'),
    readExampleSource('skeleton/skeleton-animations.tsx'),
  ]);
  const [cardsHtml, animationsHtml] = await Promise.all([
    highlightSource(cards),
    highlightSource(animations),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A skeleton holds the place of content that is loading, in the shape of that content, so
          the page keeps its layout and people can see what is coming. It is{' '}
          <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
          <code className="text-on-surface">@windmorph/react-pro</code> and is built to M3&apos;s
          colour roles, shape scale, type scale and motion tokens.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Use a skeleton when the layout of the coming content is known (cards, list rows, text).
          Use the M3 Loading indicator for a short wait whose shape isn&apos;t known or a whole page
          loading, and a Progress indicator when progress can be measured.
        </p>
        <p className="text-body-large text-on-surface-variant">
          It is pure CSS with no client code, so it animates in server components and in streamed
          Suspense fallbacks before the page hydrates.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="A loading row of cards"
          code={cards}
          html={cardsHtml}
          fileName="skeleton-cards.tsx"
        >
          <SkeletonCards />
        </ExampleViewer>
        <ExampleViewer
          title="Pulse, shimmer or still"
          code={animations}
          html={animationsHtml}
          fileName="skeleton-animations.tsx"
        >
          <SkeletonAnimations />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Placeholders are hidden from assistive technology; nothing in a skeleton is focusable.
          </li>
          <li>
            <code className="text-on-surface">SkeletonGroup</code> requires a{' '}
            <code className="text-on-surface">label</code>, read once as status text, and marks the
            region <code className="text-on-surface">aria-busy</code> until the content replaces it.
          </li>
          <li>
            Both animations stop under reduced motion. In forced-colours mode each placeholder keeps
            an outline, since backgrounds are removed.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Theming</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The fill is <code className="text-on-surface">surface-container-highest</code> (or{' '}
            <code className="text-on-surface">surface-container-high</code> with{' '}
            <code className="text-on-surface">tone=&quot;high&quot;</code>), so it follows every
            theme, mode and contrast level.
          </li>
          <li>
            Corners come from the shape scale; text lines take the line height of a type-scale role.
          </li>
          <li>
            The shimmer highlight is <code className="text-on-surface">on-surface</code> at the
            hover state-layer opacity, and both animations use the M3 duration and easing tokens.
          </li>
        </ul>
      </section>
    </>
  );
}
