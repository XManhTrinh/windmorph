import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const CardInteractive = lazyExample('card/card-interactive', 'CardInteractive');
const CardVariants = lazyExample('card/card-variants', 'CardVariants');
const CardContent = lazyExample('card/card-content', 'CardContent');

/** Card page body: variants and the static / pressable / link forms. */
export async function CardBody(): Promise<ComponentDoc> {
  const [variants, interactive] = await Promise.all([
    readExampleSource('card/card-variants.tsx'),
    readExampleSource('card/card-interactive.tsx'),
  ]);
  const [variantsHtml, interactiveHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(interactive),
  ]);

  const content = await readExampleSource('card/card-content.tsx');
  const contentHtml = await highlightSource(content);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Variants"
            code={variants}
            html={variantsHtml}
            fileName="card-variants.tsx"
          >
            <CardVariants />
          </ExampleViewer>
          <ExampleViewer
            title="Pressable and link"
            code={interactive}
            html={interactiveHtml}
            fileName="card-interactive.tsx"
          >
            <CardInteractive />
          </ExampleViewer>
          <ExampleViewer
            title="Content and actions"
            code={content}
            html={contentHtml}
            fileName="card-content.tsx"
          >
            <CardContent />
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
            A card groups related content and actions about a single subject. Reach for a card when
            a block of content needs its own surface; for a simple divider between sections use a{' '}
            <InlineCode>Divider</InlineCode>, and for a list of short items use a{' '}
            <InlineCode>List</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Cards come in three forms. A static card is a plain container that holds its own buttons
            and links. A pressable card (<InlineCode>onPress</InlineCode>) or a link card (
            <InlineCode>href</InlineCode>) makes the whole surface one target, so it must not
            contain other interactive content.
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
            <li>A static card is not focusable; its own buttons and links handle interaction.</li>
            <li>
              A pressable card is a <InlineCode>div role=&quot;button&quot;</InlineCode> (a button
              can&apos;t hold headings or media). Tab focuses it, Enter or Space activates it, and
              it shows the M3 state layer and focus ring.
            </li>
            <li>
              Name an interactive card with <InlineCode>aria-labelledby</InlineCode> (its headline)
              or <InlineCode>aria-label</InlineCode>; a link card takes{' '}
              <InlineCode>href</InlineCode>.
            </li>
            <li>
              In development a pressable or link card warns if it contains buttons, links or fields,
              because interactive content can&apos;t nest.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="spec-values" className="text-headline-small text-on-surface">
            Spec values
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Filled is <InlineCode>surface-container-highest</InlineCode>, elevated is{' '}
              <InlineCode>surface-container-low</InlineCode> at level 1, outlined is{' '}
              <InlineCode>surface</InlineCode> with a 1px outline. All have 12px corners and{' '}
              <InlineCode>on-surface</InlineCode> content.
            </li>
            <li>
              Interactive cards rise one level on hover (filled and outlined 0→1, elevated 1→2) and
              drop back while pressed or keyboard-focused; a focused outlined card&apos;s border
              turns <InlineCode>on-surface</InlineCode>.
            </li>
            <li>
              Set <InlineCode>dragged</InlineCode> while a card is being moved: it rises to level 3
              (elevated to 4), as M3 asks when picking up a card.
            </li>
            <li>
              Disabled cards keep a faded container, as M3&apos;s disabled tokens ask: filled is{' '}
              <InlineCode>surface-variant</InlineCode> and elevated <InlineCode>surface</InlineCode>
              , each at 38% over the card&apos;s own colour, and the outlined border is{' '}
              <InlineCode>outline</InlineCode> at 12%. Content is{' '}
              <InlineCode>on-surface</InlineCode> at 38%.
            </li>
            <li>
              Content is clipped to the corners (<InlineCode>overflow-hidden</InlineCode>), so media
              gets rounded edges; add <InlineCode>overflow-visible</InlineCode> to turn that off.
            </li>
            <li>
              No anatomy sub-components (headline, media, actions) in v1; layout utilities cover
              them.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
