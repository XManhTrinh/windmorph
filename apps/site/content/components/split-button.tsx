import { ExampleViewer } from '../../components/example-viewer';
import { SplitButtonBasic } from '../../examples/split-button/split-button-basic';
import { SplitButtonIcon } from '../../examples/split-button/split-button-icon';
import { SplitButtonVariants } from '../../examples/split-button/split-button-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** SplitButton page body. */
export async function SplitButtonBody() {
  const [basic, variants, icon] = await Promise.all([
    readExampleSource('split-button/split-button-basic.tsx'),
    readExampleSource('split-button/split-button-variants.tsx'),
    readExampleSource('split-button/split-button-icon.tsx'),
  ]);
  const [basicHtml, variantsHtml, iconHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(variants),
    highlightSource(icon),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A split button offers one primary action plus a menu of related, less common ones. The
          leading half runs the main action, with a label, an icon or both; the trailing half opens
          a <InlineCode>Menu</InlineCode>, or any other overlay through an enclosing trigger such as
          a <InlineCode>DialogTrigger</InlineCode>. Use it when a default action has a few
          alternatives — for example &ldquo;Send&rdquo; with &ldquo;Send later&rdquo; and
          &ldquo;Save draft&rdquo;.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Action with a menu"
          code={basic}
          html={basicHtml}
          fileName="split-button-basic.tsx"
        >
          <SplitButtonBasic />
        </ExampleViewer>
        <ExampleViewer
          title="Variants"
          code={variants}
          html={variantsHtml}
          fileName="split-button-variants.tsx"
        >
          <SplitButtonVariants />
        </ExampleViewer>
        <ExampleViewer
          title="Icon only"
          code={icon}
          html={iconHtml}
          fileName="split-button-icon.tsx"
        >
          <SplitButtonIcon />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The leading button is named by its label, or by <InlineCode>leadingLabel</InlineCode>{' '}
            when it shows only an icon; the trailing button&apos;s name comes from the required{' '}
            <InlineCode>menuLabel</InlineCode>. At XS and S both halves have 48px touch targets.
          </li>
          <li>
            Both halves are separately focusable. Enter or Space runs the leading action or opens
            the menu.
          </li>
          <li>
            The trailing button reports <InlineCode>aria-expanded</InlineCode>; the menu follows
            standard menu keyboard behaviour (arrow keys, Escape to close) and React Aria names it
            after its trigger.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Variants are <InlineCode>filled | tonal | outlined | elevated</InlineCode> — Compose has
            no text split button. Sizes run <InlineCode>xs</InlineCode>–<InlineCode>xl</InlineCode>;
            colours and elevation are shared with Button.
          </li>
          <li>
            The two halves sit 2px apart, each at least 48px wide, with full outer corners. Inner
            corners are 4 / 4 / 4 / 8 / 12px and change to 8 / 12 / 12 / 20 / 20px when hovered,
            keyboard-focused or pressed (Compose uses only the pressed tokens). The menu opens 4px
            below, aligned with the trailing button&apos;s end edge.
          </li>
          <li>
            While its menu is open the trailing button becomes a circle with a persistent 10% layer
            of its content colour, drawn as an <InlineCode>inset-shadow</InlineCode> so it composes
            with elevation.
          </li>
          <li>
            The chevron turns over inwards (towards the leading button) on the standard
            scheme&apos;s fast spatial spring, whatever the active scheme, as the spec asks. At rest
            it sits −1 / −1 / −2 / −3 / −6px from the centre, a logical offset that mirrors in RTL,
            and it can&apos;t be replaced.
          </li>
          <li>
            The per-size asymmetric corners and optical offset are not expressible through the
            public <InlineCode>Button</InlineCode> / <InlineCode>IconButton</InlineCode>, so the
            halves build on <InlineCode>ButtonBase</InlineCode>; the leading half is shielded from
            the menu&apos;s trigger context.
          </li>
        </ul>
      </section>
    </>
  );
}
