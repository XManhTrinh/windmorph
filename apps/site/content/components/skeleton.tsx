import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { SkeletonAnimations } from '../../examples/skeleton/skeleton-animations';
import { SkeletonCards } from '../../examples/skeleton/skeleton-cards';
import { SkeletonVariants } from '../../examples/skeleton/skeleton-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Skeleton page body: when to use it, examples, accessibility and theming. */
export async function SkeletonBody(): Promise<ComponentDoc> {
  const [cards, animations, skeletonVariants] = await Promise.all([
    readExampleSource('skeleton/skeleton-cards.tsx'),
    readExampleSource('skeleton/skeleton-animations.tsx'),
    readExampleSource('skeleton/skeleton-variants.tsx'),
  ]);
  const [cardsHtml, animationsHtml, skeletonVariantsHtml] = await Promise.all([
    highlightSource(cards),
    highlightSource(animations),
    highlightSource(skeletonVariants),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
          <ExampleViewer
            title="Shapes and tones"
            code={skeletonVariants}
            html={skeletonVariantsHtml}
            fileName="skeleton-variants.tsx"
          >
            <SkeletonVariants />
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
            A skeleton holds the place of content that is loading, in the shape of that content, so
            the page keeps its layout and people can see what is coming. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>: it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode> and is built to M3&apos;s colour roles,
            shape scale, type scale and motion tokens.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Use a skeleton when the layout of the coming content is known (cards, list rows, text).
            Use the M3 Loading indicator for a short wait whose shape isn&apos;t known or a whole
            page loading, and a Progress indicator when progress can be measured.
          </p>
          <p className="text-body-large text-on-surface-variant">
            It is pure CSS with no client code, so it animates in server components and in streamed
            Suspense fallbacks before the page hydrates.
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
              Placeholders are hidden from assistive technology; nothing in a skeleton is focusable.
            </li>
            <li>
              <InlineCode>SkeletonGroup</InlineCode> requires a <InlineCode>label</InlineCode>, read
              once as status text, and marks the region <InlineCode>aria-busy</InlineCode> until the
              content replaces it.
            </li>
            <li>
              Both animations stop under reduced motion. In forced-colours mode each placeholder
              keeps an outline, since backgrounds are removed.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The fill is <InlineCode>surface-container-highest</InlineCode> (or{' '}
              <InlineCode>surface-container-high</InlineCode> with{' '}
              <InlineCode>tone=&quot;high&quot;</InlineCode>), so it follows every theme, mode and
              contrast level.
            </li>
            <li>
              Corners come from the shape scale; text lines take the line height of a type-scale
              role.
            </li>
            <li>
              The shimmer highlight is <InlineCode>on-surface</InlineCode> at the hover state-layer
              opacity, and both animations use the M3 duration and easing tokens.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
