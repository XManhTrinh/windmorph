import { ExampleViewer } from '../../components/example-viewer';
import { CardInteractive } from '../../examples/card/card-interactive';
import { CardVariants } from '../../examples/card/card-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Card page body: variants and the static / pressable / link forms. */
export async function CardBody() {
  const [variants, interactive] = await Promise.all([
    readExampleSource('card/card-variants.tsx'),
    readExampleSource('card/card-interactive.tsx'),
  ]);
  const [variantsHtml, interactiveHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(interactive),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A card groups related content and actions about a single subject. Reach for a card when a
          block of content needs its own surface; for a simple divider between sections use a{' '}
          <code className="text-on-surface">Divider</code>, and for a list of short items use a{' '}
          <code className="text-on-surface">List</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Cards come in three forms. A static card is a plain container that holds its own buttons
          and links. A pressable card (<code className="text-on-surface">onPress</code>) or a link
          card (<code className="text-on-surface">href</code>) makes the whole surface one target,
          so it must not contain other interactive content.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>A static card is not focusable; its own buttons and links handle interaction.</li>
          <li>
            A pressable card is a{' '}
            <code className="text-on-surface">div role=&quot;button&quot;</code> (a button
            can&apos;t hold headings or media). Tab focuses it, Enter or Space activates it, and it
            shows the M3 state layer and focus ring.
          </li>
          <li>
            Name an interactive card with <code className="text-on-surface">aria-labelledby</code>{' '}
            (its headline) or <code className="text-on-surface">aria-label</code>; a link card takes{' '}
            <code className="text-on-surface">href</code>.
          </li>
          <li>
            In development a pressable or link card warns if it contains buttons, links or fields,
            because interactive content can&apos;t nest.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Variants match Compose&apos;s <code className="text-on-surface">Card</code>: filled is{' '}
            <code className="text-on-surface">surface-container-highest</code>, elevated is{' '}
            <code className="text-on-surface">surface-container-low</code> at level 1, outlined is{' '}
            <code className="text-on-surface">surface</code> with a 1px outline. All have 12px
            corners and <code className="text-on-surface">on-surface</code> content.
          </li>
          <li>
            Interactive cards raise on hover following Compose&apos;s code (filled 0→1, elevated
            1→2); outlined cards do not rise on hover, as Compose keeps that level despite its
            token.
          </li>
          <li>
            Content is clipped to the corners (
            <code className="text-on-surface">overflow-hidden</code>), so media gets rounded edges;
            add <code className="text-on-surface">overflow-visible</code> to turn that off.
          </li>
          <li>
            No anatomy sub-components (headline, media, actions) in v1 — Compose ships none, and
            layout utilities cover them.
          </li>
        </ul>
      </section>
    </>
  );
}
