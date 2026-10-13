import { ExampleViewer } from '../../components/example-viewer';
import { SheetBottom } from '../../examples/sheets/sheet-bottom';
import { SheetBottomStandard } from '../../examples/sheets/sheet-bottom-standard';
import { SheetSide } from '../../examples/sheets/sheet-side';
import { SheetStandard } from '../../examples/sheets/sheet-standard';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Sheets page body: modal and standard bottom sheets, modal and standard side sheets. */
export async function SheetsBody() {
  const [bottom, bottomStandard, side, standard] = await Promise.all([
    readExampleSource('sheets/sheet-bottom.tsx'),
    readExampleSource('sheets/sheet-bottom-standard.tsx'),
    readExampleSource('sheets/sheet-side.tsx'),
    readExampleSource('sheets/sheet-standard.tsx'),
  ]);
  const [bottomHtml, bottomStandardHtml, sideHtml, standardHtml] = await Promise.all([
    highlightSource(bottom),
    highlightSource(bottomStandard),
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
          scrim. Either sheet can instead be{' '}
          <code className="text-on-surface">variant=&quot;standard&quot;</code>: a standard bottom
          sheet sits over the page without a scrim, collapsed to a peek height, and a standard side
          sheet sits in the layout and opens and closes its width. Every sheet needs a name (
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
          title="Standard bottom sheet"
          code={bottomStandard}
          html={bottomStandardHtml}
          fileName="sheet-bottom-standard.tsx"
        >
          <SheetBottomStandard />
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
            A standard bottom sheet is a non-modal dialog: it doesn&apos;t take focus, trap it or
            hide the page, which stays usable around it.
          </li>
          <li>
            A bottom sheet taller than half the window opens to half; the drag handle is a button —
            press it (or Enter / Space) to expand a half-open sheet, collapse a standard one, or
            close a fully open modal one, and its label says which (
            <code className="text-on-surface">labels.expand</code>,{' '}
            <code className="text-on-surface">labels.collapse</code>,{' '}
            <code className="text-on-surface">labels.dismiss</code>). Without a handle, the top 48px
            of the sheet still drags it.
          </li>
          <li>
            A modal bottom sheet that fills the window shows a close button (
            <code className="text-on-surface">labels.close</code>); a standard one shows a collapse
            button. <code className="text-on-surface">closeButton=&#123;false&#125;</code> hides it.
          </li>
          <li>
            Escape behaves like the back button: a fully open sheet with a half detent returns to
            half, otherwise it closes. A press on the scrim closes a dismissable modal sheet.
          </li>
          <li>
            Side sheets, modal and standard, are dialogs named by their{' '}
            <code className="text-on-surface">title</code> (or{' '}
            <code className="text-on-surface">aria-label</code>). M3 requires a close button in
            every side sheet, so one is built in (
            <code className="text-on-surface">labels.close</code>,{' '}
            <code className="text-on-surface">closeIcon</code>);{' '}
            <code className="text-on-surface">onBack</code> adds a back button (
            <code className="text-on-surface">labels.back</code>). A standard side sheet becomes{' '}
            <code className="text-on-surface">inert</code> while closed.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Bottom sheet values follow m3.material.io and Compose (
            <code className="text-on-surface">ModalBottomSheet.kt</code>,{' '}
            <code className="text-on-surface">SheetDefaults.kt</code>): up to 640px wide, a 72px top
            margin (56px, with 56px side margins, above 640px), 28px top corners,{' '}
            <code className="text-on-surface">surface-container-low</code> at level 1, a 32×4px
            handle and a 32% scrim; it shows on the default spatial spring and hides on the fast
            spatial spring. A standard sheet peeks 56px by default, as Compose&apos;s{' '}
            <code className="text-on-surface">BottomSheetScaffold</code> does.
          </li>
          <li>
            Detents follow Compose&apos;s legacy anchors — half the window when taller, else full;{' '}
            <code className="text-on-surface">skipPartiallyExpanded</code> opens fully. Dragging and
            settling port Compose&apos;s{' '}
            <code className="text-on-surface">AnchoredDraggableState</code> rules.
          </li>
          <li>
            Side sheets aren&apos;t in Compose; their values follow m3.material.io and Material
            Components Android (256px wide, 16px corners on the free edge, standard sheets open a
            grid track behind an <code className="text-on-surface">outline-variant</code> divider; a
            72px bottom action row from <code className="text-on-surface">footer</code>).
          </li>
          <li>
            Not in v1: dragging through nested scrolling, predictive back, and detents beyond half /
            full (modal) or peek / full (standard).
          </li>
        </ul>
      </section>
    </>
  );
}
