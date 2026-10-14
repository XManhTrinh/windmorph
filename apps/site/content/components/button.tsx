import { buttonTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const ButtonLink = lazyExample('button/button-link', 'ButtonLink');
const ButtonSizes = lazyExample('button/button-sizes', 'ButtonSizes');
const ButtonToggle = lazyExample('button/button-toggle', 'ButtonToggle');
const ButtonVariants = lazyExample('button/button-variants', 'ButtonVariants');
const ButtonShapes = lazyExample('button/button-shapes', 'ButtonShapes');
const ButtonToggleVariants = lazyExample('button/button-toggle-variants', 'ButtonToggleVariants');

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

  const [shapesSrc, toggleVariantsSrc] = await Promise.all([
    readExampleSource('button/button-shapes.tsx'),
    readExampleSource('button/button-toggle-variants.tsx'),
  ]);
  const [shapesSrcHtml, toggleVariantsSrcHtml] = await Promise.all([
    highlightSource(shapesSrc),
    highlightSource(toggleVariantsSrc),
  ]);

  return {
    tokens: [buttonTokenSet],
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
            title="Shapes"
            code={shapesSrc}
            html={shapesSrcHtml}
            fileName="button-shapes.tsx"
          >
            <ButtonShapes />
          </ExampleViewer>
          <ExampleViewer
            title="Toggle"
            code={toggle}
            html={toggleHtml}
            fileName="button-toggle.tsx"
          >
            <ButtonToggle />
          </ExampleViewer>
          <ExampleViewer
            title="Toggle colour styles"
            code={toggleVariantsSrc}
            html={toggleVariantsSrcHtml}
            fileName="button-toggle-variants.tsx"
          >
            <ButtonToggleVariants />
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
        <section className="flex flex-col gap-3">
          <h2 id="usage" className="text-headline-small text-on-surface">
            Usage
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Use one filled button per page or view, for its most important action; give the others
              less emphasis.
            </li>
            <li>
              Keep labels short. A label never wraps or truncates, so a long one can be wider than a
              phone screen: at compact widths use a smaller size, a shorter label, or a{' '}
              <InlineCode>ButtonGroup</InlineCode> with <InlineCode>overflow</InlineCode>.
            </li>
            <li>
              Keep a toggle&apos;s label about the same length in both states (Star / Starred), so
              the button doesn&apos;t jump in width when it changes. Pair an outlined icon with its
              filled form through <InlineCode>selectedLeadingIcon</InlineCode>.
            </li>
          </ul>
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
              <InlineCode>&lt;a&gt;</InlineCode> and behaves as a link: Enter follows it, and Space
              scrolls the page as it does on any link, rather than activating it. Use a button
              without <InlineCode>href</InlineCode> for actions.
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
              A pressed button shows the pressed elevation (elevated level 1, filled and tonal 0)
              even while the pointer is over it.
            </li>
            <li>
              The leading and trailing space is measured from the container&apos;s edge, so the
              outlined style&apos;s outline comes out of its padding and an outlined button is the
              same size as a filled one. Change the outline width with{' '}
              <InlineCode>--m3-button-border</InlineCode>, which sets the border and the padding
              together.
            </li>
            <li>
              XS and S buttons are at least 32 and 40px tall and grow with a large browser font
              size, as Compose&apos;s buttons do; a stretching flex or grid parent doesn&apos;t make
              them taller. The XS split button&apos;s halves do the same.
            </li>
            <li>
              A disabled outlined button dims its outline to 10%; a selected outlined toggle has no
              outline, disabled or not.
            </li>
            <li>
              Toggles take <InlineCode>selectedLeadingIcon</InlineCode>, shown instead of{' '}
              <InlineCode>leadingIcon</InlineCode> while selected (the filled form of the outlined
              icon), so an uncontrolled toggle can swap its icon too.
            </li>
            <li>
              Under reduced motion the press and selection morphs snap to their new corners; colours
              and elevation still fade.
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
