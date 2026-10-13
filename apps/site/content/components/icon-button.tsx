import { ExampleViewer } from '../../components/example-viewer';
import { IconButtonSizes } from '../../examples/icon-button/icon-button-sizes';
import { IconButtonToggle } from '../../examples/icon-button/icon-button-toggle';
import { IconButtonVariants } from '../../examples/icon-button/icon-button-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** IconButton page body. */
export async function IconButtonBody() {
  const [variants, sizes, toggle] = await Promise.all([
    readExampleSource('icon-button/icon-button-variants.tsx'),
    readExampleSource('icon-button/icon-button-sizes.tsx'),
    readExampleSource('icon-button/icon-button-toggle.tsx'),
  ]);
  const [variantsHtml, sizesHtml, toggleHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(sizes),
    highlightSource(toggle),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Icon buttons trigger an action with just an icon, so they suit toolbars, list rows and
          dense layouts where a labelled <code className="text-on-surface">Button</code> would not
          fit. Use one only when the icon&apos;s meaning is unambiguous.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Because there is no visible text, an accessible name is <em>required</em>: every icon
          button must pass <code className="text-on-surface">aria-label</code> or{' '}
          <code className="text-on-surface">aria-labelledby</code> (the types enforce it).
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Variants"
          code={variants}
          html={variantsHtml}
          fileName="icon-button-variants.tsx"
        >
          <IconButtonVariants />
        </ExampleViewer>
        <ExampleViewer
          title="Sizes and widths"
          code={sizes}
          html={sizesHtml}
          fileName="icon-button-sizes.tsx"
        >
          <IconButtonSizes />
        </ExampleViewer>
        <ExampleViewer
          title="Toggle"
          code={toggle}
          html={toggleHtml}
          fileName="icon-button-toggle.tsx"
        >
          <IconButtonToggle />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code> is mandatory; the icon itself
            is hidden from assistive tech.
          </li>
          <li>
            Tab moves focus; Enter or Space activates. XS and S sizes carry a 48px touch target so
            the hit area stays large enough.
          </li>
          <li>
            A toggle icon button exposes <code className="text-on-surface">aria-pressed</code> and
            may swap to a <code className="text-on-surface">selectedIcon</code> when selected.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Variants are{' '}
            <code className="text-on-surface">standard | filled | tonal | outlined</code> — no
            elevated or text, matching Compose&apos;s icon button set.
          </li>
          <li>
            <code className="text-on-surface">width</code> (narrow / default / wide) is the icon
            size plus leading and trailing space; Compose&apos;s{' '}
            <code className="text-on-surface">Uniform</code> option is the default width.
          </li>
          <li>
            Standard and outlined icon buttons inherit the surrounding text colour (like
            Compose&apos;s <code className="text-on-surface">LocalContentColor</code>); the outlined
            border is drawn in that colour, and disabled is that colour at 38%.
          </li>
          <li>
            Selected toggles: standard turns <code className="text-on-surface">primary</code>,
            filled <code className="text-on-surface">primary</code>/
            <code className="text-on-surface">on-primary</code>, tonal{' '}
            <code className="text-on-surface">secondary</code>/
            <code className="text-on-surface">on-secondary</code>, outlined inverse-surface with no
            border; shape swaps round ↔ square.
          </li>
          <li>
            Reads <code className="text-on-surface">size</code> /{' '}
            <code className="text-on-surface">shape</code> /{' '}
            <code className="text-on-surface">disabled</code> from{' '}
            <code className="text-on-surface">ButtonContext</code>, but not{' '}
            <code className="text-on-surface">variant</code>, because the variant sets differ.
          </li>
        </ul>
      </section>
    </>
  );
}
