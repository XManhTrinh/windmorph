import { ExampleViewer } from '../../components/example-viewer';
import { FabMenuBasic } from '../../examples/fab-menu/fab-menu-basic';
import { FabMenuColors } from '../../examples/fab-menu/fab-menu-colors';
import { FabMenuWeb } from '../../examples/fab-menu/fab-menu-web';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** FabMenu page body (FabMenu + FabMenuItem). */
export async function FabMenuBody() {
  const [basic, colors, web] = await Promise.all([
    readExampleSource('fab-menu/fab-menu-basic.tsx'),
    readExampleSource('fab-menu/fab-menu-colors.tsx'),
    readExampleSource('fab-menu/fab-menu-web.tsx'),
  ]);
  const [basicHtml, colorsHtml, webHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(colors),
    highlightSource(web),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A FAB menu is a FAB that opens two to six closely related actions above it. Use it when
          one surface needs a few primary actions rather than a single one, but not beside a
          floating toolbar or navigation rail. The button shrinks into a 56px close button while the
          items (<InlineCode>FabMenuItem</InlineCode>, given directly as children) appear one after
          another. Every item has a label; keep its icon unless you really must drop it, since icons
          tell the items apart.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Anchor the menu to the window&apos;s trailing edge with <InlineCode>className</InlineCode>
          : 16px margins (<InlineCode>fixed end-4 bottom-4</InlineCode>), rising to 24px in large
          and extra-large windows (<InlineCode>large:end-6 large:bottom-6</InlineCode>
          ). The items open upwards and line up on the trailing edge, which mirrors in RTL. On short
          windows they scroll behind the close button, which stays reachable.
        </p>
        <p className="text-body-large text-on-surface-variant">
          On the web and in large windows, M3 has the FAB open a standard menu instead: set{' '}
          <InlineCode>presentation=&quot;menu&quot;</InlineCode>, and choose it per window size
          class if you like. Items run <InlineCode>onAction</InlineCode> (or follow{' '}
          <InlineCode>href</InlineCode>) in either presentation. <InlineCode>visible</InlineCode>{' '}
          and <InlineCode>appear</InlineCode> work as on <InlineCode>Fab</InlineCode>.
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
        <ExampleViewer
          title="Menu on the web"
          code={web}
          html={webHtml}
          fileName="fab-menu-web.tsx"
        >
          <FabMenuWeb />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The button&apos;s name (<InlineCode>aria-label</InlineCode> or{' '}
            <InlineCode>aria-labelledby</InlineCode>) is required; it reports{' '}
            <InlineCode>aria-expanded</InlineCode> and <InlineCode>aria-controls</InlineCode>.
          </li>
          <li>
            DOM order is the button then the items (shown above it), so Tab moves from the button to
            the top item. ↓ from the button and ↑ / ↓ between items move focus; ↑ from the top item
            and ↓ from the bottom one return to the button.
          </li>
          <li>
            Escape, an outside press, or choosing an item closes the menu. Hidden items are{' '}
            <InlineCode>inert</InlineCode>, so they are skipped while closed.
          </li>
          <li>Each item is named by its label; its icon is hidden from assistive tech.</li>
          <li>
            With <InlineCode>presentation=&quot;menu&quot;</InlineCode> it follows the menu pattern:
            the button has <InlineCode>aria-haspopup</InlineCode>, the items are{' '}
            <InlineCode>menuitem</InlineCode>s, and arrows, typeahead and Escape work as in any{' '}
            <InlineCode>Menu</InlineCode>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Spec values and differences</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>No shape morph: Compose&apos;s FAB menu does not use the shape library.</li>
          <li>
            The toggle button keeps its FAB&apos;s layout box (56 / 80 / 96px) in a library-owned
            anchor; open, it becomes the 56px close button with 28px corners and a 20px icon. Size,
            corners, container colour (<InlineCode>*-container</InlineCode> → the vibrant role) and
            icon all follow one fast spatial spring. Elevation is level 3.
          </li>
          <li>
            Items are 56px pills (min 56px wide, 24px padding, 8px icon gap, 24px icon,{' '}
            <InlineCode>title-medium</InlineCode>) at level 3, 4px apart and 8px above the button.
          </li>
          <li>
            Opening staggers the visible item count on the slow effects spring (the item nearest the
            button appears first); each item then springs its width on fast spatial and its opacity
            on fast effects. Closing hides the top item first.
          </li>
          <li>
            Colour sets are <InlineCode>primary | secondary | tertiary</InlineCode>{' '}
            (m3.material.io&apos;s sets; Compose&apos;s default is primary).
          </li>
          <li>A development warning flags a menu with fewer than two or more than six items.</li>
        </ul>
      </section>
    </>
  );
}
