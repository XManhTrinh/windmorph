import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { ButtonLink } from '../../examples/button/button-link';
import { ButtonSizes } from '../../examples/button/button-sizes';
import { ButtonToggle } from '../../examples/button/button-toggle';
import { ButtonVariants } from '../../examples/button/button-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Button page body: purpose, live examples, accessibility and Compose differences. */
export async function ButtonBody(): Promise<ComponentDoc> {
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
          <ExampleViewer
            title="Toggle"
            code={toggle}
            html={toggleHtml}
            fileName="button-toggle.tsx"
          >
            <ButtonToggle />
          </ExampleViewer>
          <ExampleViewer title="As a link" code={link} html={linkHtml} fileName="button-link.tsx">
            <ButtonLink />
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
            Buttons let people take action with a single tap. Reach for a button when the action has
            a short text label; use an <InlineCode>IconButton</InlineCode> when an icon alone is
            clear, and a <InlineCode>Fab</InlineCode> for the one primary action on a screen.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Pick a variant by emphasis: filled for the most important action, then elevated and
            tonal, then outlined, with text buttons for the lowest emphasis. Only one high-emphasis
            button should compete for attention in a given area.
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
              The visible label names the button; the leading icon is decorative and hidden from
              assistive tech. M3 allows one icon, before the label, so there is no trailing icon.
            </li>
            <li>
              Tab moves focus to the button; Enter or Space activates it. A focus ring shows while
              navigating by keyboard.
            </li>
            <li>
              With <InlineCode>href</InlineCode> the button renders an{' '}
              <InlineCode>&lt;a&gt;</InlineCode> and behaves as a link.
            </li>
            <li>
              A toggle button exposes <InlineCode>aria-pressed</InlineCode>; its label should still
              read correctly in both states.
            </li>
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
              Values follow the M3 Expressive specs and the token files where Compose&apos;s code
              overrides them: XS padding is 16px with an 8px icon gap, small text buttons have the
              same 16px padding as the other small buttons, and toggle buttons press to the same
              corners as the others (8 / 8 / 12 / 16 / 16px). Text buttons use{' '}
              <InlineCode>primary</InlineCode>.
            </li>
            <li>
              The press morph is a CSS <InlineCode>border-radius</InlineCode> transition on the fast
              spatial spring, which bounces in the expressive scheme (Compose uses a non-bouncing
              effects spring; the spec puts corners on spatial springs). A press that starts while
              the last morph is still settling uses the fast effects spring instead, the web&apos;s
              modified curve against rapid-click resonance.
            </li>
            <li>
              Selected round toggle buttons become square and selected square ones become round (the
              latter follows m3.material.io; Compose ships only round toggles). Text buttons have no
              toggle form, enforced by the types.
            </li>
            <li>
              Disabled is container <InlineCode>on-surface</InlineCode> 10% and content{' '}
              <InlineCode>on-surface-variant</InlineCode> 38% for every variant.
            </li>
            <li>
              XS and S buttons get a 48px touch target inside the library-owned inner wrapper; the
              layout height stays 32 / 40px.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
