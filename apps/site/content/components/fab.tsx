import { ExampleViewer } from '../../components/example-viewer';
import { FabColors } from '../../examples/fab/fab-colors';
import { FabExtended } from '../../examples/fab/fab-extended';
import { FabExtendedCollapse } from '../../examples/fab/fab-extended-collapse';
import { FabVisibility } from '../../examples/fab/fab-visibility';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** FAB page body (Fab + ExtendedFab). */
export async function FabBody() {
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

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A floating action button represents the single most important action on a screen, such as
          compose or create. Use at most one per screen.{' '}
          <code className="text-on-surface">Fab</code> shows an icon;{' '}
          <code className="text-on-surface">ExtendedFab</code> adds a label and can collapse to the
          icon as the page scrolls.
        </p>
        <p className="text-body-large text-on-surface-variant">
          FABs have no disabled state in M3 — if an action is unavailable, hide the FAB or keep it
          enabled and handle the empty case.
        </p>
        <p className="text-body-large text-on-surface-variant">
          In compact and medium windows, place the FAB at the bottom trailing corner with 16px
          margins (<code className="text-on-surface">fixed end-4 bottom-4</code>). In expanded
          windows, consider the upper start corner, such as the navigation rail&apos;s header; a FAB
          nested in another component rests at level 0, so give it{' '}
          <code className="text-on-surface">elevation=&quot;flat&quot;</code>.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Sizes and colours"
          code={colors}
          html={colorsHtml}
          fileName="fab-colors.tsx"
        >
          <FabColors />
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
          title="Disappear and reappear"
          code={visibility}
          html={visibilityHtml}
          fileName="fab-visibility.tsx"
        >
          <FabVisibility />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">Fab</code> has no visible text, so{' '}
            <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code> is required. Its{' '}
            <code className="text-on-surface">aria-label</code> also shows in a tooltip on hover and
            keyboard focus, as M3 asks of FABs on the web; pass{' '}
            <code className="text-on-surface">tooltip={'{false}'}</code> when you wrap the FAB in
            your own <code className="text-on-surface">TooltipTrigger</code>.
          </li>
          <li>
            <code className="text-on-surface">ExtendedFab</code> is named by its label; a text-only
            extended FAB needs no extra name. The label stays in the accessible name while
            collapsed. It needs no tooltip.
          </li>
          <li>
            A hidden FAB (<code className="text-on-surface">visible={'{false}'}</code>) is{' '}
            <code className="text-on-surface">inert</code>, so it leaves the tab order and the
            accessibility tree.
          </li>
          <li>
            Tab moves focus; Enter or Space activates. With{' '}
            <code className="text-on-surface">href</code> the FAB renders a link.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Spec values and differences</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">Fab</code> sizes are default / medium / large (56 / 80
            / 96px); the small FAB is deprecated.{' '}
            <code className="text-on-surface">ExtendedFab</code> sizes are sm / md / lg (56 / 80 /
            96px tall).
          </li>
          <li>
            Corners are large (16px) / large-increased (20px) / extra-large (28px); icons follow the
            spec tokens, 24 / 28 / 32px. Extended FABs put 8 / 16 / 20px between icon and label.
          </li>
          <li>
            <code className="text-on-surface">elevation</code> is{' '}
            <code className="text-on-surface">default</code> (level 3, hover 4),{' '}
            <code className="text-on-surface">lowered</code> (level 1, hover 2) or{' '}
            <code className="text-on-surface">flat</code> (level 0, for a FAB nested in another
            component such as the navigation rail). There is no press morph and no disabled state —
            the types enforce the latter.
          </li>
          <li>
            Colour styles are <code className="text-on-surface">primary-container</code> (default),{' '}
            <code className="text-on-surface">secondary-container</code>,{' '}
            <code className="text-on-surface">tertiary-container</code>,{' '}
            <code className="text-on-surface">primary</code>,{' '}
            <code className="text-on-surface">secondary</code> and{' '}
            <code className="text-on-surface">tertiary</code>; Compose ships tokens only for the
            first two, the rest follow m3.material.io.
          </li>
          <li>
            <code className="text-on-surface">expanded</code> animates a CSS grid column between{' '}
            <code className="text-on-surface">0fr</code> and{' '}
            <code className="text-on-surface">1fr</code>, so the width animates without transforms,
            on the fast spatial and fast effects springs both ways.
          </li>
          <li>
            <code className="text-on-surface">visible</code> follows Compose&apos;s show / hide: the
            FAB expands from its centre (scale 0.2 → 1) on the fast spatial spring and fades on the
            fast effects spring. The scale is a <code className="text-on-surface">transform</code>{' '}
            set only while hidden or appearing, so it composes with Tailwind&apos;s{' '}
            <code className="text-on-surface">translate-*</code> and{' '}
            <code className="text-on-surface">scale-*</code> utilities.
          </li>
        </ul>
      </section>
    </>
  );
}
