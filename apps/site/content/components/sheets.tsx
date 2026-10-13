import { ExampleViewer } from '../../components/example-viewer';
import { SheetBottom } from '../../examples/sheets/sheet-bottom';
import { SheetSide } from '../../examples/sheets/sheet-side';
import { SheetStandard } from '../../examples/sheets/sheet-standard';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Sheets page body: bottom sheet, modal side sheet and standard side sheet. */
export async function SheetsBody() {
  const [bottom, side, standard] = await Promise.all([
    readExampleSource('sheets/sheet-bottom.tsx'),
    readExampleSource('sheets/sheet-side.tsx'),
    readExampleSource('sheets/sheet-standard.tsx'),
  ]);
  const [bottomHtml, sideHtml, standardHtml] = await Promise.all([
    highlightSource(bottom),
    highlightSource(side),
    highlightSource(standard),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Sheets hold supplementary content anchored to an edge of the window. A{' '}
          <code className="text-on-surface">BottomSheet</code> rises from the bottom for actions or
          content on a compact screen; a <code className="text-on-surface">SideSheet</code> sits at
          the end edge for filters or details. For a focused task or a decision use a dialog
          instead.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Modal sheets open from a <code className="text-on-surface">SheetTrigger</code> and cover a
          scrim. A side sheet can instead be{' '}
          <code className="text-on-surface">variant=&quot;standard&quot;</code>, which sits in the
          layout and opens and closes its width. Every sheet needs a name (
          <code className="text-on-surface">aria-label</code>,{' '}
          <code className="text-on-surface">aria-labelledby</code>, or a side sheet&apos;s{' '}
          <code className="text-on-surface">title</code>).
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Bottom sheet"
          code={bottom}
          html={bottomHtml}
          fileName="sheet-bottom.tsx"
        >
          <SheetBottom />
        </ExampleViewer>
        <ExampleViewer
          title="Modal side sheet"
          code={side}
          html={sideHtml}
          fileName="sheet-side.tsx"
        >
          <SheetSide />
        </ExampleViewer>
        <ExampleViewer
          title="Standard side sheet"
          code={standard}
          html={standardHtml}
          fileName="sheet-standard.tsx"
        >
          <SheetStandard />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Modal sheets are dialogs: opening one moves focus in and contains it, the page behind is
            inert, and closing returns focus to the trigger.
          </li>
          <li>
            A bottom sheet taller than half the window opens to half; the drag handle is a button —
            press it (or Enter / Space) to expand a half-open sheet or close a fully open one, and
            its label says which (&quot;Expand sheet&quot; / &quot;Close sheet&quot;).
          </li>
          <li>
            Escape behaves like the back button: a fully open sheet with a half detent returns to
            half, otherwise it closes. A press on the scrim closes a dismissable modal sheet.
          </li>
          <li>
            A modal side sheet is named by its <code className="text-on-surface">title</code> (or{' '}
            <code className="text-on-surface">aria-label</code>); the library ships no close icon,
            so put your own <code className="text-on-surface">IconButton</code> in{' '}
            <code className="text-on-surface">actions</code>. A standard side sheet becomes{' '}
            <code className="text-on-surface">inert</code> while closed.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Bottom sheet values follow Compose (
            <code className="text-on-surface">ModalBottomSheet.kt</code>,{' '}
            <code className="text-on-surface">SheetDefaults.kt</code>): up to 640px wide, 28px top
            corners, <code className="text-on-surface">surface-container-low</code>, a 32×4px handle
            and a 32% scrim; it shows on the default spatial spring and hides on the fast effects
            spring.
          </li>
          <li>
            Detents follow Compose&apos;s legacy anchors — half the window when taller, else full;{' '}
            <code className="text-on-surface">skipPartiallyExpanded</code> opens fully. Dragging and
            settling port Compose&apos;s{' '}
            <code className="text-on-surface">AnchoredDraggableState</code> rules.
          </li>
          <li>
            Side sheets aren&apos;t in Compose; their values follow Material Components Android
            (256px wide, 16px corners on the free edge, standard sheets open a grid track). The
            header layout follows m3.material.io and is provisional.
          </li>
          <li>
            Not in v1: the standard (non-modal) bottom sheet, dragging from anywhere on the sheet,
            predictive back, and detents beyond half / full.
          </li>
        </ul>
      </section>
    </>
  );
}
