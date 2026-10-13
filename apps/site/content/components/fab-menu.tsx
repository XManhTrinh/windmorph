import { ExampleViewer } from '../../components/example-viewer';
import { FabMenuBasic } from '../../examples/fab-menu/fab-menu-basic';
import { FabMenuColors } from '../../examples/fab-menu/fab-menu-colors';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** FabMenu page body (FabMenu + FabMenuItem). */
export async function FabMenuBody() {
  const [basic, colors] = await Promise.all([
    readExampleSource('fab-menu/fab-menu-basic.tsx'),
    readExampleSource('fab-menu/fab-menu-colors.tsx'),
  ]);
  const [basicHtml, colorsHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(colors),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A FAB menu is a FAB that opens a short stack of related actions above it. Use it when one
          surface needs a few primary actions rather than a single one. The button shrinks into a
          56px close button while the items (<code className="text-on-surface">FabMenuItem</code>)
          appear one after another.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Position the menu with <code className="text-on-surface">className</code> (for example{' '}
          <code className="text-on-surface">fixed end-4 bottom-4</code>); the items open upwards.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Anchored menu"
          code={basic}
          html={basicHtml}
          fileName="fab-menu-basic.tsx"
        >
          <FabMenuBasic />
        </ExampleViewer>
        <ExampleViewer
          title="Colours"
          code={colors}
          html={colorsHtml}
          fileName="fab-menu-colors.tsx"
        >
          <FabMenuColors />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The button&apos;s name (<code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code>) is required; it reports{' '}
            <code className="text-on-surface">aria-expanded</code> and{' '}
            <code className="text-on-surface">aria-controls</code>.
          </li>
          <li>
            DOM order is the button then the items (shown above it), so Tab moves from the button to
            the top item. ↓ from the button and ↑ / ↓ between items move focus; ↑ from the top item
            and ↓ from the bottom one return to the button.
          </li>
          <li>
            Escape, an outside press, or choosing an item closes the menu. Hidden items are{' '}
            <code className="text-on-surface">inert</code>, so they are skipped while closed.
          </li>
          <li>Each item is named by its label; its icon is hidden from assistive tech.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>No shape morph: Compose&apos;s FAB menu does not use the shape library.</li>
          <li>
            The toggle button keeps its FAB&apos;s layout box (56 / 80 / 96px) in a library-owned
            anchor; open, it becomes the 56px close button with 28px corners and a 20px icon. Size,
            corners, container colour (<code className="text-on-surface">*-container</code> → the
            vibrant role) and icon all follow one fast spatial spring. Elevation is level 3.
          </li>
          <li>
            Items are 56px pills (min 56px wide, 24px padding, 8px icon gap, 24px icon,{' '}
            <code className="text-on-surface">title-medium</code>), 4px apart and 8px above the
            button, with no elevation (Compose&apos;s item surface leaves its level-3 token unused).
          </li>
          <li>
            Opening staggers the visible item count on the slow effects spring (the item nearest the
            button appears first); each item then springs its width on fast spatial and its opacity
            on fast effects. Closing hides the top item first.
          </li>
          <li>
            Colour sets are <code className="text-on-surface">primary | secondary | tertiary</code>{' '}
            (m3.material.io&apos;s sets; Compose&apos;s default is primary), and{' '}
            <code className="text-on-surface">align</code> is logical, so it mirrors in RTL.
          </li>
        </ul>
      </section>
    </>
  );
}
