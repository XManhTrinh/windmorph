import { ExampleViewer } from '../../components/example-viewer';
import { FabColors } from '../../examples/fab/fab-colors';
import { FabExtended } from '../../examples/fab/fab-extended';
import { FabExtendedCollapse } from '../../examples/fab/fab-extended-collapse';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** FAB page body (Fab + ExtendedFab). */
export async function FabBody() {
  const [colors, extended, collapse] = await Promise.all([
    readExampleSource('fab/fab-colors.tsx'),
    readExampleSource('fab/fab-extended.tsx'),
    readExampleSource('fab/fab-extended-collapse.tsx'),
  ]);
  const [colorsHtml, extendedHtml, collapseHtml] = await Promise.all([
    highlightSource(colors),
    highlightSource(extended),
    highlightSource(collapse),
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">Fab</code> has no visible text, so{' '}
            <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code> is required.
          </li>
          <li>
            <code className="text-on-surface">ExtendedFab</code> is named by its label; a text-only
            extended FAB needs no extra name. The label stays in the accessible name while
            collapsed.
          </li>
          <li>
            Tab moves focus; Enter or Space activates. With{' '}
            <code className="text-on-surface">href</code> the FAB renders a link.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            <code className="text-on-surface">Fab</code> sizes are default / medium / large (56 / 80
            / 96px); the small FAB is deprecated.{' '}
            <code className="text-on-surface">ExtendedFab</code> sizes are sm / md / lg (56 / 80 /
            96px tall).
          </li>
          <li>
            Shapes and icons follow Compose&apos;s code: corners large (16px) / large-increased
            (20px) / extra-large (28px); icons 24 / 28 / 36px, with the large icon 36px because
            Compose marks the 32px token incorrect.
          </li>
          <li>
            Elevation is level 3 (hover 4); <code className="text-on-surface">lowered</code> is
            level 1 (hover 2). There is no press morph and no disabled state — the types enforce the
            latter.
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
            <code className="text-on-surface">1fr</code>, so the width animates without transforms.
            Compose&apos;s whole-FAB show/hide (scale to 0.2 + fade) is deferred because it
            conflicts with the layout-safety rules.
          </li>
        </ul>
      </section>
    </>
  );
}
