import { bottomSheetTokenSet, sideSheetTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const SheetBottom = lazyExample('sheets/sheet-bottom', 'SheetBottom');
const SheetBottomStandard = lazyExample('sheets/sheet-bottom-standard', 'SheetBottomStandard');
const SheetBottomDetents = lazyExample('sheets/sheet-bottom-detents', 'SheetBottomDetents');
const SheetSide = lazyExample('sheets/sheet-side', 'SheetSide');
const SheetStandard = lazyExample('sheets/sheet-standard', 'SheetStandard');
const SheetSideLevels = lazyExample('sheets/sheet-side-levels', 'SheetSideLevels');

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
  const bottomDetents = await readExampleSource('sheets/sheet-bottom-detents.tsx');
  const bottomDetentsHtml = await highlightSource(bottomDetents);

  return {
    tokens: [bottomSheetTokenSet, sideSheetTokenSet],
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
            title="Standard bottom sheet, expanded or collapsed"
            code={bottomDetents}
            html={bottomDetentsHtml}
            fileName="sheet-bottom-detents.tsx"
          >
            <SheetBottomDetents />
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
              Compose&apos;s <InlineCode>AnchoredDraggableState</InlineCode> rules. As with
              Compose&apos;s nested scrolling, an upward swipe on a half-open sheet&apos;s content
              raises the sheet first and then scrolls the content. Moving down to a lower detent
              (Escape, the handle, the collapse button) runs on the fast effects spring, so it never
              drops below the detent; a drag&apos;s settle keeps the spatial spring and starts at
              the speed the sheet was let go with, as Compose&apos;s does.
            </li>
            <li>
              Side sheets aren&apos;t in Compose; their values follow m3.material.io and Material
              Components Android (256px wide and at most 400px, 16px corners on the free edge,
              standard sheets open and close their measured width, behind an{' '}
              <InlineCode>outline-variant</InlineCode> divider, and closing one with focus inside
              returns focus to where it came from; a 72px bottom action row from{' '}
              <InlineCode>footer</InlineCode>). Their content scrolls vertically only: anything
              wider than the sheet is clipped (m3.material.io: &ldquo;Side sheets cannot scroll
              horizontally&rdquo;).
            </li>
            <li>
              Not yet supported: predictive back, and detents beyond half / full (modal) or peek /
              full (standard).
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
