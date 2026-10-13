import { ExampleViewer } from '../../components/example-viewer';
import { ButtonLink } from '../../examples/button/button-link';
import { ButtonSizes } from '../../examples/button/button-sizes';
import { ButtonToggle } from '../../examples/button/button-toggle';
import { ButtonVariants } from '../../examples/button/button-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Button page body: purpose, live examples, accessibility and Compose differences. */
export async function ButtonBody() {
  const [variants, sizes, toggle, link] = await Promise.all([
    readExampleSource('button/button-variants.tsx'),
    readExampleSource('button/button-sizes.tsx'),
    readExampleSource('button/button-toggle.tsx'),
    readExampleSource('button/button-link.tsx'),
  ]);
  const [variantsHtml, sizesHtml, toggleHtml, linkHtml] = await Promise.all([
    highlightSource(variants),
    highlightSource(sizes),
    highlightSource(toggle),
    highlightSource(link),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Buttons let people take action with a single tap. Reach for a button when the action has a
          short text label; use an <code className="text-on-surface">IconButton</code> when an icon
          alone is clear, and a <code className="text-on-surface">Fab</code> for the one primary
          action on a screen.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Pick a variant by emphasis: filled for the most important action, then elevated and tonal,
          then outlined, with text buttons for the lowest emphasis. Only one high-emphasis button
          should compete for attention in a given area.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Variants"
          code={variants}
          html={variantsHtml}
          fileName="button-variants.tsx"
        >
          <ButtonVariants />
        </ExampleViewer>
        <ExampleViewer
          title="Sizes and shape"
          code={sizes}
          html={sizesHtml}
          fileName="button-sizes.tsx"
        >
          <ButtonSizes />
        </ExampleViewer>
        <ExampleViewer title="Toggle" code={toggle} html={toggleHtml} fileName="button-toggle.tsx">
          <ButtonToggle />
        </ExampleViewer>
        <ExampleViewer title="As a link" code={link} html={linkHtml} fileName="button-link.tsx">
          <ButtonLink />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The visible label names the button; leading and trailing icons are decorative and hidden
            from assistive tech.
          </li>
          <li>
            Tab moves focus to the button; Enter or Space activates it. A focus ring shows while
            navigating by keyboard.
          </li>
          <li>
            With <code className="text-on-surface">href</code> the button renders an{' '}
            <code className="text-on-surface">&lt;a&gt;</code> and behaves as a link.
          </li>
          <li>
            A toggle button exposes <code className="text-on-surface">aria-pressed</code>; its label
            should still read correctly in both states.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Values come from what Compose&apos;s <code className="text-on-surface">Button.kt</code>{' '}
            / <code className="text-on-surface">ToggleButton.kt</code> use, which in places
            overrides the token files: text buttons use{' '}
            <code className="text-on-surface">primary</code>, XS padding is 12px with a 4px icon
            gap, and small toggle buttons press to a 6px corner.
          </li>
          <li>
            The press morph is a CSS <code className="text-on-surface">border-radius</code>{' '}
            transition on the effects-default spring (which never bounces); toggle buttons use the
            fast-spatial spring, which does bounce.
          </li>
          <li>
            Selected round toggle buttons become square and selected square ones become round (the
            latter follows m3.material.io; Compose ships only round toggles). Text buttons have no
            toggle form, enforced by the types.
          </li>
          <li>
            Disabled is container <code className="text-on-surface">on-surface</code> 10% and
            content <code className="text-on-surface">on-surface-variant</code> 38% for every
            variant.
          </li>
          <li>
            XS and S buttons get a 48px touch target inside the library-owned inner wrapper; the
            layout height stays 32 / 40px.
          </li>
        </ul>
      </section>
    </>
  );
}
