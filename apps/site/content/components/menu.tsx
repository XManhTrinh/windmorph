import { menuTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const MenuBasic = lazyExample('menu/menu-basic', 'MenuBasic');
const MenuContext = lazyExample('menu/menu-context', 'MenuContext');
const MenuInstant = lazyExample('menu/menu-instant', 'MenuInstant');
const MenuSelection = lazyExample('menu/menu-selection', 'MenuSelection');
const MenuSheet = lazyExample('menu/menu-sheet', 'MenuSheet');
const MenuSubmenu = lazyExample('menu/menu-submenu', 'MenuSubmenu');
const MenuLayouts = lazyExample('menu/menu-layouts', 'MenuLayouts');
const MenuContainerPadding = lazyExample('menu/menu-container-padding', 'MenuContainerPadding');

/** Menu page body: grouped actions, single selection, submenus and a context menu. */
export async function MenuBody(): Promise<ComponentDoc> {
  const [basic, selection, submenu, context, sheet, instant] = await Promise.all([
    readExampleSource('menu/menu-basic.tsx'),
    readExampleSource('menu/menu-selection.tsx'),
    readExampleSource('menu/menu-submenu.tsx'),
    readExampleSource('menu/menu-context.tsx'),
    readExampleSource('menu/menu-sheet.tsx'),
    readExampleSource('menu/menu-instant.tsx'),
  ]);
  const [basicHtml, selectionHtml, submenuHtml, contextHtml, sheetHtml, instantHtml] =
    await Promise.all([
      highlightSource(basic),
      highlightSource(selection),
      highlightSource(submenu),
      highlightSource(context),
      highlightSource(sheet),
      highlightSource(instant),
    ]);

  const layouts = await readExampleSource('menu/menu-layouts.tsx');
  const layoutsHtml = await highlightSource(layouts);
  const containerPadding = await readExampleSource('menu/menu-container-padding.tsx');
  const containerPaddingHtml = await highlightSource(containerPadding);

  return {
    tokens: [menuTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Grouped actions"
            code={basic}
            html={basicHtml}
            fileName="menu-basic.tsx"
          >
            <MenuBasic />
          </ExampleViewer>
          <ExampleViewer
            title="Dividers and gaps"
            code={layouts}
            html={layoutsHtml}
            fileName="menu-layouts.tsx"
          >
            <MenuLayouts />
          </ExampleViewer>
          <ExampleViewer
            title="Single selection (vibrant)"
            code={selection}
            html={selectionHtml}
            fileName="menu-selection.tsx"
          >
            <MenuSelection />
          </ExampleViewer>
          <ExampleViewer
            title="Submenus"
            code={submenu}
            html={submenuHtml}
            fileName="menu-submenu.tsx"
          >
            <MenuSubmenu />
          </ExampleViewer>
          <ExampleViewer
            title="Context menu"
            code={context}
            html={contextHtml}
            fileName="menu-context.tsx"
          >
            <MenuContext />
          </ExampleViewer>
          <ExampleViewer
            title="A bottom sheet on phones"
            code={sheet}
            html={sheetHtml}
            fileName="menu-sheet.tsx"
          >
            <MenuSheet />
          </ExampleViewer>
          <ExampleViewer
            title="Instant menus for a dense desktop menu bar"
            code={instant}
            html={instantHtml}
            fileName="menu-instant.tsx"
          >
            <MenuInstant />
          </ExampleViewer>
          <ExampleViewer
            title="Space from the window's edges"
            code={containerPadding}
            html={containerPaddingHtml}
            fileName="menu-container-padding.tsx"
          >
            <MenuContainerPadding />
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
            A menu shows a temporary list of choices anchored to the button that opened it. Use it
            for actions or options that don&apos;t need to be visible all the time; for a persistent
            list of items use a <InlineCode>List</InlineCode>, and for choosing one value in a form
            use a selection control.
          </p>
          <p className="text-body-large text-on-surface-variant">
            A <InlineCode>Menu</InlineCode> must sit inside a <InlineCode>MenuTrigger</InlineCode>{' '}
            (trigger first, menu second), or a <InlineCode>ContextMenuTrigger</InlineCode> for a
            context menu. Items are <InlineCode>MenuItem</InlineCode>s, optionally gathered into{' '}
            <InlineCode>MenuGroup</InlineCode>s; both are identified by a React{' '}
            <InlineCode>key</InlineCode>. A <InlineCode>SubmenuTrigger</InlineCode> gives an item a
            submenu. The <InlineCode>variant</InlineCode> is <InlineCode>standard</InlineCode> or{' '}
            <InlineCode>vibrant</InlineCode>.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Groups are set apart by dividers on one surface (
            <InlineCode>layout=&quot;divider&quot;</InlineCode>, the default, as M3 recommends on
            the web) or by 2px gaps between separate surfaces (
            <InlineCode>layout=&quot;gap&quot;</InlineCode>). M3 doesn&apos;t use gaps in menus that
            scroll, so a gap menu that has to scroll switches to dividers.{' '}
            <InlineCode>density</InlineCode> (0 to −3) tightens items for dense desktop layouts.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>presentation=&quot;auto&quot;</InlineCode> opens the menu in a bottom sheet
            on compact windows (below 600px wide) and anchored to its trigger on larger ones;{' '}
            <InlineCode>&quot;sheet&quot;</InlineCode> always uses the sheet. In a sheet, a submenu
            replaces the menu&apos;s content, below a back button (
            <InlineCode>labels.back</InlineCode>).
          </p>
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
              The Expressive grouped menu (Compose&apos;s <InlineCode>Menu.kt</InlineCode>) is the{' '}
              <InlineCode>gap</InlineCode> layout: each group is its own surface at elevation 2, 2px
              apart; loose items form implicit groups. The default <InlineCode>divider</InlineCode>{' '}
              layout follows the M3 spec for the web.
            </li>
            <li>
              Items follow the M3 Menu token files rather than Compose&apos;s code: labels are{' '}
              <InlineCode>body-large</InlineCode>, with 16px of padding at each side, a 12px gap
              after the leading icon and <InlineCode>label-small</InlineCode> trailing text (the
              shortcut). Compose draws <InlineCode>label-large</InlineCode> labels with 12px of
              padding and an 8px gap on touch. Select&apos;s and Autocomplete&apos;s option lists
              share these items.
            </li>
            <li>
              Submenus aren&apos;t in Compose. While one is open, the focused menu takes 24px
              corners and the other 8px (the SegmentedMenu active and inactive shapes), as the M3
              spec describes.
            </li>
            <li>
              The menu is revealed along one axis from its anchored edge as it fades in, instead of
              Compose&apos;s uniform 80% scale, which the M3 motion spec avoids.
            </li>
            <li>
              <InlineCode>standard</InlineCode> uses <InlineCode>surface-container-low</InlineCode>{' '}
              and selects with <InlineCode>tertiary-container</InlineCode>;{' '}
              <InlineCode>vibrant</InlineCode> is <InlineCode>tertiary-container</InlineCode> with
              icons turning <InlineCode>tertiary</InlineCode> on interaction and selects with{' '}
              <InlineCode>tertiary</InlineCode>.
            </li>
            <li>
              In a selectable menu an item with no leading icon grows a check in (grid{' '}
              <InlineCode>0fr → 1fr</InlineCode>) when selected, as in Compose.
            </li>
            <li>
              <InlineCode>placement</InlineCode> defaults to <InlineCode>bottom start</InlineCode>{' '}
              with no offset; because React Aria resolves start / end from its locale, the menu
              converts them to physical sides from the trigger&apos;s computed direction.
            </li>
            <li>
              A focus fix cancels the trigger&apos;s follow-up <InlineCode>mousedown</InlineCode> so
              focus stays inside the menu after a mouse open.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
