import { ExampleViewer } from '../../components/example-viewer';
import { SplitButtonBasic } from '../../examples/split-button/split-button-basic';
import { SplitButtonVariants } from '../../examples/split-button/split-button-variants';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** SplitButton page body. */
export async function SplitButtonBody() {
  const [basic, variants] = await Promise.all([
    readExampleSource('split-button/split-button-basic.tsx'),
    readExampleSource('split-button/split-button-variants.tsx'),
  ]);
  const [basicHtml, variantsHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(variants),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A split button offers one primary action plus a menu of related, less common ones. The
          leading half runs the main action; the trailing half opens a{' '}
          <code className="text-on-surface">Menu</code>. Use it when a default action has a few
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The leading button is named by its label; the trailing button&apos;s name comes from the
            required <code className="text-on-surface">menuLabel</code>.
          </li>
          <li>
            Both halves are separately focusable. Enter or Space runs the leading action or opens
            the menu.
          </li>
          <li>
            The trailing button reports <code className="text-on-surface">aria-expanded</code>; the
            menu follows standard menu keyboard behaviour (arrow keys, Escape to close) and React
            Aria names it after its trigger.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Variants are{' '}
            <code className="text-on-surface">filled | tonal | outlined | elevated</code> — Compose
            has no text split button. Sizes run <code className="text-on-surface">xs</code>–
            <code className="text-on-surface">xl</code>; colours and elevation are shared with
            Button.
          </li>
          <li>
            The two halves sit 2px apart, each at least 48px wide, with full outer corners. Inner
            corners are 4 / 4 / 4 / 8 / 12px and press to 8 / 12 / 12 / 20 / 20px (Compose uses only
            the pressed corner tokens).
          </li>
          <li>
            While its menu is open the trailing button becomes a circle with a persistent 10% layer
            of its content colour, drawn as an <code className="text-on-surface">inset-shadow</code>{' '}
            so it composes with elevation.
          </li>
          <li>
            The chevron turns over on the effects-default spring; the trailing icon is optically
            centred (shifted by 0.11 × the corner difference) with a logical offset that mirrors in
            RTL.
          </li>
          <li>
            The per-size asymmetric corners and optical offset are not expressible through the
            public <code className="text-on-surface">Button</code> /{' '}
            <code className="text-on-surface">IconButton</code>, so the halves build on{' '}
            <code className="text-on-surface">ButtonBase</code>; the leading half is shielded from
            the menu&apos;s trigger context.
          </li>
        </ul>
      </section>
    </>
  );
}
