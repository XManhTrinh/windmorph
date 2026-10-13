import { ExampleViewer } from '../../components/example-viewer';
import { MenuBasic } from '../../examples/menu/menu-basic';
import { MenuSelection } from '../../examples/menu/menu-selection';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Menu page body: grouped actions and single selection. */
export async function MenuBody() {
  const [basic, selection] = await Promise.all([
    readExampleSource('menu/menu-basic.tsx'),
    readExampleSource('menu/menu-selection.tsx'),
  ]);
  const [basicHtml, selectionHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(selection),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A menu shows a temporary list of choices anchored to the button that opened it. Use it for
          actions or options that don&apos;t need to be visible all the time; for a persistent list
          of items use a <code className="text-on-surface">List</code>, and for choosing one value
          in a form use a selection control.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A <code className="text-on-surface">Menu</code> must sit inside a{' '}
          <code className="text-on-surface">MenuTrigger</code> (trigger first, menu second). Items
          are <code className="text-on-surface">MenuItem</code>s, optionally gathered into{' '}
          <code className="text-on-surface">MenuGroup</code>s; both are identified by a React{' '}
          <code className="text-on-surface">key</code>. The{' '}
          <code className="text-on-surface">variant</code> is{' '}
          <code className="text-on-surface">standard</code> or{' '}
          <code className="text-on-surface">vibrant</code>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Grouped actions"
          code={basic}
          html={basicHtml}
          fileName="menu-basic.tsx"
        >
          <MenuBasic />
        </ExampleViewer>
        <ExampleViewer
          title="Single selection (vibrant)"
          code={selection}
          html={selectionHtml}
          fileName="menu-selection.tsx"
        >
          <MenuSelection />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Enter, Space or the arrow keys open the menu from its trigger and focus the first (or
            last) item. ↑ / ↓ move between items, Home / End jump to the ends, and typing a few
            letters jumps to a matching label (typeahead).
          </li>
          <li>
            Enter or Space fires <code className="text-on-surface">onAction</code> with the
            item&apos;s key; in a selectable menu it toggles selection. Escape or a press outside
            closes the menu and returns focus to the trigger.
          </li>
          <li>
            Items in <code className="text-on-surface">disabledKeys</code> are skipped. A{' '}
            <code className="text-on-surface">description</code> becomes the item&apos;s accessible
            description and a <code className="text-on-surface">shortcut</code> renders as a{' '}
            <code className="text-on-surface">kbd</code>.
          </li>
          <li>
            Give an icon-only trigger an <code className="text-on-surface">aria-label</code>; a
            group with no visible title should take an{' '}
            <code className="text-on-surface">aria-label</code>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The Expressive grouped menu (Compose&apos;s{' '}
            <code className="text-on-surface">Menu.kt</code>): each group is its own surface at
            elevation 2, 2px apart, with morphing corners; loose items form implicit groups.
          </li>
          <li>
            <code className="text-on-surface">standard</code> uses{' '}
            <code className="text-on-surface">surface-container-low</code> and selects with{' '}
            <code className="text-on-surface">tertiary-container</code>;{' '}
            <code className="text-on-surface">vibrant</code> is{' '}
            <code className="text-on-surface">tertiary-container</code> with icons turning{' '}
            <code className="text-on-surface">tertiary</code> on interaction and selects with{' '}
            <code className="text-on-surface">tertiary</code>.
          </li>
          <li>
            In a selectable menu an item with no leading icon grows a check in (grid{' '}
            <code className="text-on-surface">0fr → 1fr</code>) when selected, as in Compose.
          </li>
          <li>
            <code className="text-on-surface">placement</code> defaults to{' '}
            <code className="text-on-surface">bottom start</code> with no offset; because React Aria
            resolves start / end from its locale, the menu converts them to physical sides from the
            trigger&apos;s computed direction.
          </li>
          <li>
            Not in v1: submenus. A focus fix cancels the trigger&apos;s follow-up{' '}
            <code className="text-on-surface">mousedown</code> so focus stays inside the menu after
            a mouse open.
          </li>
        </ul>
      </section>
    </>
  );
}
