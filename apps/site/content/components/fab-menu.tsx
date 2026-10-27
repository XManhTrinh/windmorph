import { fabMenuTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const FabMenuBasic = lazyExample('fab-menu/fab-menu-basic', 'FabMenuBasic');
const FabMenuColors = lazyExample('fab-menu/fab-menu-colors', 'FabMenuColors');
const FabMenuRotate = lazyExample('fab-menu/fab-menu-rotate', 'FabMenuRotate');
const FabMenuTooltip = lazyExample('fab-menu/fab-menu-tooltip', 'FabMenuTooltip');
const FabMenuWeb = lazyExample('fab-menu/fab-menu-web', 'FabMenuWeb');

/** FabMenu page body (FabMenu + FabMenuItem). */
export async function FabMenuBody(): Promise<ComponentDoc> {
  const [basic, colors, web, rotate, tooltip] = await Promise.all([
    readExampleSource('fab-menu/fab-menu-basic.tsx'),
    readExampleSource('fab-menu/fab-menu-colors.tsx'),
    readExampleSource('fab-menu/fab-menu-web.tsx'),
    readExampleSource('fab-menu/fab-menu-rotate.tsx'),
    readExampleSource('fab-menu/fab-menu-tooltip.tsx'),
  ]);
  const [basicHtml, colorsHtml, webHtml, rotateHtml, tooltipHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(colors),
    highlightSource(web),
    highlightSource(rotate),
    highlightSource(tooltip),
  ]);

  return {
    tokens: [fabMenuTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
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
          <ExampleViewer
            title="Rotating icons, lowered"
            code={rotate}
            html={rotateHtml}
            fileName="fab-menu-rotate.tsx"
          >
            <FabMenuRotate />
          </ExampleViewer>
          <ExampleViewer
            title="Tooltip"
            code={tooltip}
            html={tooltipHtml}
            fileName="fab-menu-tooltip.tsx"
          >
            <FabMenuTooltip />
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
            A FAB menu is a FAB that opens two to six closely related actions above it. Use it when
            one surface needs a few primary actions rather than a single one, but not beside a
            floating toolbar or navigation rail. The button shrinks into a 56px close button while
            the items (<InlineCode>FabMenuItem</InlineCode>, given directly as children) appear one
            after another. Every item has a label; keep its icon unless you really must drop it,
            since icons tell the items apart.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Anchor the menu to the window&apos;s trailing edge with{' '}
            <InlineCode>className</InlineCode>: 16px margins (
            <InlineCode>fixed end-4 bottom-4</InlineCode>), rising to 24px in large and extra-large
            windows (<InlineCode>large:end-6 large:bottom-6</InlineCode>
            ). The items open upwards and line up on the trailing edge, which mirrors in RTL. On
            short windows they scroll behind the close button, which stays reachable.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Keep the menu out of normal flow: <InlineCode>fixed</InlineCode>, or at the bottom of a
            box (<InlineCode>absolute end-4 bottom-4</InlineCode> in a{' '}
            <InlineCode>relative</InlineCode> one, or <InlineCode>items-end</InlineCode> in a
            fixed-height flex box). In normal flow the open list takes up room, so it pushes the
            button down and can scroll the page as it opens and closes.
          </p>
          <p className="text-body-large text-on-surface-variant">
            On the web, M3 has the FAB open a standard menu: use{' '}
            <InlineCode>presentation=&quot;menu&quot;</InlineCode> on large screens (the expanded
            window class, 840px and up), and keep the default <InlineCode>list</InlineCode> in
            compact and medium windows, choosing it per window size class. Items run{' '}
            <InlineCode>onAction</InlineCode> (or follow <InlineCode>href</InlineCode>) in either
            presentation. <InlineCode>visible</InlineCode> and <InlineCode>appear</InlineCode> work
            as on <InlineCode>Fab</InlineCode>.
          </p>
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
            <li>No shape morph: Compose&apos;s FAB menu does not use the shape library.</li>
            <li>
              The toggle button keeps its FAB&apos;s layout box (56 / 80 / 96px) in a library-owned
              anchor; open, it becomes the 56px close button with 28px corners and a 20px icon.
              Size, corners and icon follow the fast spatial spring; the colours move from the{' '}
              <InlineCode>*-container</InlineCode> role to the vibrant role on the fast effects
              spring, so they never overshoot.
            </li>
            <li>
              Items are 56px pills (min 56px wide, 24px padding, 8px icon gap, 24px icon,{' '}
              <InlineCode>title-medium</InlineCode>), 4px apart and 8px above the button.
            </li>
            <li>
              The button and the items sit at level 3, as the spec asks;{' '}
              <InlineCode>elevation</InlineCode> works as on <InlineCode>Fab</InlineCode>, with{' '}
              <InlineCode>lowered</InlineCode> (level 1) and <InlineCode>flat</InlineCode> (level
              0).
            </li>
            <li>
              <InlineCode>iconTransition=&quot;rotate&quot;</InlineCode> goes beyond the spec, which
              swaps the icons halfway through the morph: the icons turn 90° counter-clockwise as the
              menu opens (mirrored in RTL) while they crossfade, and turn back as it closes. Reduced
              motion keeps only the crossfade.
            </li>
            <li>
              Opening staggers the visible item count on the slow effects spring (the item nearest
              the button appears first); each item then springs its width on fast spatial and its
              opacity on fast effects. Closing hides the top item first.
            </li>
            <li>
              Colour sets are <InlineCode>primary | secondary | tertiary</InlineCode>{' '}
              (m3.material.io&apos;s sets; Compose&apos;s default is primary).
            </li>
            <li>A development warning flags a menu with fewer than two or more than six items.</li>
          </ul>
        </section>
      </>
    ),
  };
}
