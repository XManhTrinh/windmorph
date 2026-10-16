import type { ComponentDoc } from './doc';
import { skeletonTokenSet } from '@windmorph/react-pro';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { TokenTable } from '../../components/token-table';
import { lazyExample } from '../../lib/lazy-example';

const SkeletonAnimations = lazyExample('skeleton/skeleton-animations', 'SkeletonAnimations');
const SkeletonCards = lazyExample('skeleton/skeleton-cards', 'SkeletonCards');
const SkeletonVariants = lazyExample('skeleton/skeleton-variants', 'SkeletonVariants');

/** Skeleton page body: when to use it, examples and theming. */
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
            A skeleton is pure CSS, so it animates in server components and in streamed Suspense
            fallbacks before the page hydrates. A <InlineCode>SkeletonGroup</InlineCode>&apos;s
            label is a live region that goes into the page first and takes its text a moment later,
            so it&apos;s announced even when the group appears after the page has loaded.
          </p>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="theming" className="text-headline-small text-on-surface">
            Theming &amp; tokens
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The fill is <InlineCode>surface-container-highest</InlineCode> (or{' '}
              <InlineCode>surface-container-high</InlineCode> with{' '}
              <InlineCode>tone=&quot;high&quot;</InlineCode>), so it follows every theme, mode and
              contrast level.
            </li>
            <li>
              Corners come from the shape scale (<InlineCode>corner</InlineCode>); text lines take
              the line height of a type-scale role, and a line&apos;s corner is measured on its
              visible bar.
            </li>
            <li>
              The pulse and the shimmer ease on the slow effects spring. The shimmer&apos;s
              highlight is <InlineCode>on-surface</InlineCode> at the hover state-layer opacity.
            </li>
            <li>
              Set the tokens below on a skeleton or any ancestor. Each skeleton carries{' '}
              <InlineCode>data-tokens=&quot;wm-skeleton&quot;</InlineCode>, with{' '}
              <InlineCode>data-tone</InlineCode> and <InlineCode>data-corner</InlineCode> picking
              the defaults, so a token set on a parent overrides every tone and corner.{' '}
              <InlineCode>skeletonStyles</InlineCode> no longer has <InlineCode>tone</InlineCode> or{' '}
              <InlineCode>corner</InlineCode> variants: the tokens hold them.
            </li>
          </ul>
          <TokenTable set={skeletonTokenSet} caption="Skeleton tokens" />
        </section>
      </>
    ),
  };
}
