import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { FabColors } from '../../examples/fab/fab-colors';
import { FabExtended } from '../../examples/fab/fab-extended';
import { FabExtendedCollapse } from '../../examples/fab/fab-extended-collapse';
import { FabExtendedTooltip } from '../../examples/fab/fab-extended-tooltip';
import { FabVisibility } from '../../examples/fab/fab-visibility';
import { FabColorStyles } from '../../examples/fab/fab-color-styles';
import { FabElevation } from '../../examples/fab/fab-elevation';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** FAB page body (Fab + ExtendedFab). */
export async function FabBody(): Promise<ComponentDoc> {
  const [colors, extended, collapse, visibility] = await Promise.all([
    readExampleSource('fab/fab-colors.tsx'),
    readExampleSource('fab/fab-extended.tsx'),
    readExampleSource('fab/fab-extended-collapse.tsx'),
    readExampleSource('fab/fab-visibility.tsx'),
  ]);
  const [colorsHtml, extendedHtml, collapseHtml, visibilityHtml] = await Promise.all([
    highlightSource(colors),
    highlightSource(extended),
    highlightSource(collapse),
    highlightSource(visibility),
  ]);

  const [colorStylesSrc, elevationSrc, tooltipSrc] = await Promise.all([
    readExampleSource('fab/fab-color-styles.tsx'),
    readExampleSource('fab/fab-elevation.tsx'),
    readExampleSource('fab/fab-extended-tooltip.tsx'),
  ]);
  const [colorStylesSrcHtml, elevationSrcHtml, tooltipSrcHtml] = await Promise.all([
    highlightSource(colorStylesSrc),
    highlightSource(elevationSrc),
    highlightSource(tooltipSrc),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Sizes and colours"
            code={colors}
            html={colorsHtml}
            fileName="fab-colors.tsx"
          >
            <FabColors />
          </ExampleViewer>
          <ExampleViewer
            title="Colour styles"
            code={colorStylesSrc}
            html={colorStylesSrcHtml}
            fileName="fab-color-styles.tsx"
          >
            <FabColorStyles />
          </ExampleViewer>
          <ExampleViewer
            title="Elevation"
            code={elevationSrc}
            html={elevationSrcHtml}
            fileName="fab-elevation.tsx"
          >
            <FabElevation />
          </ExampleViewer>
          <ExampleViewer
            title="Extended FAB"
            code={extended}
            html={extendedHtml}
            fileName="fab-extended.tsx"
          >
            <FabExtended />
          </ExampleViewer>
          <ExampleViewer
            title="Collapse and expand"
            code={collapse}
            html={collapseHtml}
            fileName="fab-extended-collapse.tsx"
          >
            <FabExtendedCollapse />
          </ExampleViewer>
          <ExampleViewer
            title="Tooltip while collapsed"
            code={tooltipSrc}
            html={tooltipSrcHtml}
            fileName="fab-extended-tooltip.tsx"
          >
            <FabExtendedTooltip />
          </ExampleViewer>
          <ExampleViewer
            title="Disappear and reappear"
            code={visibility}
            html={visibilityHtml}
            fileName="fab-visibility.tsx"
          >
            <FabVisibility />
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
            A floating action button represents the single most important action on a screen, such
            as compose or create. Use at most one per screen. <InlineCode>Fab</InlineCode> shows an
            icon; <InlineCode>ExtendedFab</InlineCode> adds a label and can collapse to the icon as
            the page scrolls.
          </p>
          <p className="text-body-large text-on-surface-variant">
            FABs have no disabled state in M3 — if an action is unavailable, hide the FAB or keep it
            enabled and handle the empty case.
          </p>
          <p className="text-body-large text-on-surface-variant">
            M3 recommends the medium FAB (<InlineCode>size=&quot;medium&quot;</InlineCode>, 80px)
            for most layouts. The default size stays the 56px FAB, as in Compose, so set{' '}
            <InlineCode>medium</InlineCode> unless the screen is dense. Don&apos;t put an extended
            FAB beside a floating toolbar; pair the toolbar with a FAB (a development warning flags
            an extended one).
          </p>
          <p className="text-body-large text-on-surface-variant">
            In compact and medium windows, place the FAB at the bottom trailing corner with 16px
            margins (<InlineCode>fixed end-4 bottom-4</InlineCode>). In expanded windows, consider
            the upper start corner, such as the navigation rail&apos;s header; a FAB nested in
            another component rests at level 0, so give it{' '}
            <InlineCode>elevation=&quot;flat&quot;</InlineCode>.
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
              <InlineCode>Fab</InlineCode> has no visible text, so{' '}
              <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode> is
              required. Its <InlineCode>aria-label</InlineCode> also shows in a tooltip on hover and
              keyboard focus, as M3 asks of FABs on the web; pass{' '}
              <InlineCode>tooltip={'{false}'}</InlineCode> when you wrap the FAB in your own{' '}
              <InlineCode>TooltipTrigger</InlineCode>.
            </li>
            <li>
              <InlineCode>ExtendedFab</InlineCode> is named by its label; a text-only extended FAB
              needs no extra name. The label stays in the accessible name while collapsed. Expanded,
              it needs no tooltip; collapsed to the icon, it shows its label in a tooltip on hover
              and keyboard focus, like a FAB (<InlineCode>tooltip={'{false}'}</InlineCode> turns it
              off).
            </li>
            <li>
              A hidden FAB (<InlineCode>visible={'{false}'}</InlineCode>) is{' '}
              <InlineCode>inert</InlineCode>, so it leaves the tab order and the accessibility tree.
            </li>
            <li>
              Tab moves focus; Enter or Space activates. With <InlineCode>href</InlineCode> the FAB
              renders a link.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="spec-values-and-differences" className="text-headline-small text-on-surface">
            Spec values and differences
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>Fab</InlineCode> sizes are default / medium / large (56 / 80 / 96px); the
              small FAB is deprecated. <InlineCode>ExtendedFab</InlineCode> sizes are sm / md / lg
              (56 / 80 / 96px tall).
            </li>
            <li>
              Corners are large (16px) / large-increased (20px) / extra-large (28px); icons follow
              the spec tokens, 24 / 28 / 32px. Extended FABs put 8 / 16 / 20px between icon and
              label.
            </li>
            <li>
              <InlineCode>elevation</InlineCode> is <InlineCode>default</InlineCode> (level 3, hover
              4, pressed 3), <InlineCode>lowered</InlineCode> (level 1, hover 2, pressed 1) or{' '}
              <InlineCode>flat</InlineCode> (level 0, for a FAB nested in another component such as
              the navigation rail). There is no press morph and no disabled state — the types
              enforce the latter.
            </li>
            <li>
              Colour styles are <InlineCode>primary-container</InlineCode> (default),{' '}
              <InlineCode>secondary-container</InlineCode>,{' '}
              <InlineCode>tertiary-container</InlineCode>, <InlineCode>primary</InlineCode>,{' '}
              <InlineCode>secondary</InlineCode> and <InlineCode>tertiary</InlineCode>; Compose
              ships tokens only for the first two, the rest follow m3.material.io.
            </li>
            <li>
              <InlineCode>expanded</InlineCode> animates a CSS grid column between{' '}
              <InlineCode>0fr</InlineCode> and <InlineCode>1fr</InlineCode>, so the width animates
              without transforms, on the fast spatial and fast effects springs both ways.
            </li>
            <li>
              <InlineCode>visible</InlineCode> follows Compose&apos;s show / hide: the FAB expands
              from its centre (scale 0.2 → 1) on the fast spatial spring and fades on the fast
              effects spring. The scale is a <InlineCode>transform</InlineCode> set only while
              hidden or appearing, so it composes with Tailwind&apos;s{' '}
              <InlineCode>translate-*</InlineCode> and <InlineCode>scale-*</InlineCode> utilities.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
