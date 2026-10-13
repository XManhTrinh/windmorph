import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { SheetBottom } from '../../examples/sheets/sheet-bottom';
import { SheetBottomStandard } from '../../examples/sheets/sheet-bottom-standard';
import { SheetSide } from '../../examples/sheets/sheet-side';
import { SheetStandard } from '../../examples/sheets/sheet-standard';
import { SheetSideLevels } from '../../examples/sheets/sheet-side-levels';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Sheets page body: modal and standard bottom sheets, modal and standard side sheets. */
export async function SheetsBody(): Promise<ComponentDoc> {
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

  const sideLevels = await readExampleSource('sheets/sheet-side-levels.tsx');
  const sideLevelsHtml = await highlightSource(sideLevels);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
            title="Side sheet with levels"
            code={sideLevels}
            html={sideLevelsHtml}
            fileName="sheet-side-levels.tsx"
          >
            <SheetSideLevels />
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
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Sheets hold supplementary content anchored to an edge of the window. A{' '}
            <InlineCode>BottomSheet</InlineCode> rises from the bottom for actions or content on a
            compact screen; a <InlineCode>SideSheet</InlineCode> sits at the end edge for filters or
            details. For a focused task or a decision use a dialog instead.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Modal sheets open from a <InlineCode>SheetTrigger</InlineCode> and cover a scrim. Either
            sheet can instead be <InlineCode>variant=&quot;standard&quot;</InlineCode>: a standard
            bottom sheet sits over the page without a scrim, collapsed to a peek height, and a
            standard side sheet sits in the layout and opens and closes its width. Every sheet needs
            a name (<InlineCode>aria-label</InlineCode>, <InlineCode>aria-labelledby</InlineCode>,
            or a side sheet&apos;s <InlineCode>title</InlineCode>).
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
              Modal sheets are dialogs: opening one moves focus in and contains it, the page behind
              is inert, and closing returns focus to the trigger.
            </li>
            <li>
              A standard bottom sheet is a non-modal dialog: it doesn&apos;t take focus, trap it or
              hide the page, which stays usable around it.
            </li>
            <li>
              A bottom sheet taller than half the window opens to half; the drag handle is a button
              — press it (or Enter / Space) to expand a half-open sheet, collapse a standard one, or
              close a fully open modal one, and its label says which (
              <InlineCode>labels.expand</InlineCode>, <InlineCode>labels.collapse</InlineCode>,{' '}
              <InlineCode>labels.dismiss</InlineCode>). Without a handle, the top 48px of the sheet
              still drags it.
            </li>
            <li>
              A modal bottom sheet that fills the window shows a close button (
              <InlineCode>labels.close</InlineCode>); a standard one shows a collapse button.{' '}
              <InlineCode>closeButton=&#123;false&#125;</InlineCode> hides it.
            </li>
            <li>
              Escape behaves like the back button: a fully open sheet with a half detent returns to
              half, otherwise it closes. A press on the scrim closes a dismissable modal sheet.
            </li>
            <li>
              Side sheets, modal and standard, are dialogs named by their{' '}
              <InlineCode>title</InlineCode> (or <InlineCode>aria-label</InlineCode>). M3 requires a
              close button in every side sheet, so one is built in (
              <InlineCode>labels.close</InlineCode>, <InlineCode>closeIcon</InlineCode>);{' '}
              <InlineCode>onBack</InlineCode> adds a back button (
              <InlineCode>labels.back</InlineCode>
              ). A standard side sheet becomes <InlineCode>inert</InlineCode> while closed.
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
              Bottom sheet values follow m3.material.io and Compose (
              <InlineCode>ModalBottomSheet.kt</InlineCode>,{' '}
              <InlineCode>SheetDefaults.kt</InlineCode>
              ): up to 640px wide, a 72px top margin (56px, with 56px side margins, above 640px),
              28px top corners, <InlineCode>surface-container-low</InlineCode> at level 1, a 32×4px
              handle and a 32% scrim; it shows on the default spatial spring and hides on the fast
              spatial spring, moving 112% of its size so the spring&apos;s overshoot stays out of
              view. A standard sheet peeks 56px by default, as Compose&apos;s{' '}
              <InlineCode>BottomSheetScaffold</InlineCode> does.
            </li>
            <li>
              Detents follow Compose&apos;s legacy anchors — half the window when taller, else full;{' '}
              <InlineCode>skipPartiallyExpanded</InlineCode> opens fully. Dragging and settling port
              Compose&apos;s <InlineCode>AnchoredDraggableState</InlineCode> rules.
            </li>
            <li>
              Side sheets aren&apos;t in Compose; their values follow m3.material.io and Material
              Components Android (256px wide and at most 400px, 16px corners on the free edge,
              standard sheets open a grid track behind an <InlineCode>outline-variant</InlineCode>{' '}
              divider; a 72px bottom action row from <InlineCode>footer</InlineCode>). Their content
              scrolls vertically only: anything wider than the sheet is clipped (m3.material.io:
              &ldquo;Side sheets cannot scroll horizontally&rdquo;).
            </li>
            <li>
              Not in v1: dragging through nested scrolling, predictive back, and detents beyond half
              / full (modal) or peek / full (standard).
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
