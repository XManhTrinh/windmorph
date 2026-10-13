import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { ButtonGroupConnected } from '../../examples/button-group/button-group-connected';
import { ButtonGroupMultiple } from '../../examples/button-group/button-group-multiple';
import { ButtonGroupStandard } from '../../examples/button-group/button-group-standard';
import { ButtonGroupSizes } from '../../examples/button-group/button-group-sizes';
import { ButtonGroupPressBump } from '../../examples/button-group/button-group-press-bump';
import { ButtonGroupOverflow } from '../../examples/button-group/button-group-overflow';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** ButtonGroup page body. */
export async function ButtonGroupBody(): Promise<ComponentDoc> {
  const [standard, connected, multiple] = await Promise.all([
    readExampleSource('button-group/button-group-standard.tsx'),
    readExampleSource('button-group/button-group-connected.tsx'),
    readExampleSource('button-group/button-group-multiple.tsx'),
  ]);
  const [standardHtml, connectedHtml, multipleHtml] = await Promise.all([
    highlightSource(standard),
    highlightSource(connected),
    highlightSource(multiple),
  ]);

  const [sizesSrc, pressBumpSrc, overflowSrc] = await Promise.all([
    readExampleSource('button-group/button-group-sizes.tsx'),
    readExampleSource('button-group/button-group-press-bump.tsx'),
    readExampleSource('button-group/button-group-overflow.tsx'),
  ]);
  const [sizesSrcHtml, pressBumpSrcHtml, overflowSrcHtml] = await Promise.all([
    highlightSource(sizesSrc),
    highlightSource(pressBumpSrc),
    highlightSource(overflowSrc),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Standard"
            code={standard}
            html={standardHtml}
            fileName="button-group-standard.tsx"
          >
            <ButtonGroupStandard />
          </ExampleViewer>
          <ExampleViewer
            title="Connected, single selection"
            code={connected}
            html={connectedHtml}
            fileName="button-group-connected.tsx"
          >
            <ButtonGroupConnected />
          </ExampleViewer>
          <ExampleViewer
            title="Connected, multiple selection"
            code={multiple}
            html={multipleHtml}
            fileName="button-group-multiple.tsx"
          >
            <ButtonGroupMultiple />
          </ExampleViewer>
          <ExampleViewer
            title="Sizes and shapes"
            code={sizesSrc}
            html={sizesSrcHtml}
            fileName="button-group-sizes.tsx"
          >
            <ButtonGroupSizes />
          </ExampleViewer>
          <ExampleViewer
            title="Connected, with a press bump"
            code={pressBumpSrc}
            html={pressBumpSrcHtml}
            fileName="button-group-press-bump.tsx"
          >
            <ButtonGroupPressBump />
          </ExampleViewer>
          <ExampleViewer
            title="Overflow menu"
            code={overflowSrc}
            html={overflowSrcHtml}
            fileName="button-group-overflow.tsx"
          >
            <ButtonGroupOverflow />
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
            A button group lays out a set of related <InlineCode>Button</InlineCode> and{' '}
            <InlineCode>IconButton</InlineCode> children as a unit, sharing their size, shape and
            variant. The <InlineCode>connected</InlineCode> variant, with single or multiple
            selection, is the M3 Expressive replacement for segmented buttons.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Use a standard group for a row of independent actions, and a connected group for
            choosing between mutually related options.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="usage" className="text-headline-small text-on-surface">
            Usage
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Avoid standard icon buttons and text buttons in a group: they have no container, so
              the group has nothing to shape. In development the group warns about them.
            </li>
            <li>
              A connected group is for selection: fill it with toggle buttons. A connected group
              with no toggles warns in development; use a standard group for actions.
            </li>
            <li>
              Groups don&apos;t wrap. When a row of actions can get narrow, turn on{' '}
              <InlineCode>overflow</InlineCode>: the trailing buttons fold into a menu at the end of
              the group and come back as it widens. Put the actions in order of importance, since
              the last ones fold first.
            </li>
          </ul>
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
              Give the group an accessible name with <InlineCode>aria-label</InlineCode>.
            </li>
            <li>
              Without selection the group is a <InlineCode>toolbar</InlineCode>: Tab enters and
              leaves it, the arrow keys move between its buttons (mirrored in RTL), and Enter or
              Space activates one.
            </li>
            <li>
              Single selection renders as a <InlineCode>radiogroup</InlineCode> of radios: arrow
              keys move between options and select, and every option stays reachable.
            </li>
            <li>
              Multiple selection behaves like a set of checkboxes.{' '}
              <InlineCode>disallowEmptySelection</InlineCode> keeps at least one option chosen.
            </li>
            <li>
              With <InlineCode>overflow</InlineCode>, the &quot;More options&quot; button (rename it
              with <InlineCode>labels</InlineCode>) is the group&apos;s last stop for the arrow
              keys. Its menu lists the folded buttons by their labels: actions as menu items,
              toggles as checkable items (radio items in a single-selection group), and disabled
              buttons disabled.
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
              Press expansion (standard groups only): the pressed item grows by{' '}
              <InlineCode>expandedRatio</InlineCode> (0.15) of its width while its neighbours shrink
              by the same amount, so the group&apos;s width stays constant. On the web the group
              watches each child&apos;s <InlineCode>data-pressed</InlineCode> and animates{' '}
              <InlineCode>flex-basis</InlineCode> on the fast spatial spring;{' '}
              <InlineCode>expandedRatio=0</InlineCode> turns it off. In a connected group only the
              pressed button&apos;s shape changes.
            </li>
            <li>
              Standard groups space their buttons 18 / 12 / 8 / 8 / 8px apart (XS–XL), so small
              buttons&apos; 48px targets never overlap. Connected groups use a 2px gap and span
              their container, the buttons sharing its width equally, as Compose&apos;s{' '}
              <InlineCode>weight(1f)</InlineCode> does (add <InlineCode>*:basis-auto</InlineCode> to
              size them by their labels, or <InlineCode>w-fit</InlineCode> to hug the content).
              Outer corners are full, or the inner size in a square group; inner corners are 4 / 8 /
              8 / 16 / 20px, 4px when pressed (2px at XS, whose corners rest at 4px); selected
              buttons become fully round; and XS and S connected icon buttons are at least 48px
              wide. These are logical corners, so they mirror in RTL.
            </li>
            <li>
              Toggle buttons with a <InlineCode>value</InlineCode> join the group&apos;s React Aria
              toggle-group state; no-op selection changes that React Stately reports are not passed
              to <InlineCode>onSelectionChange</InlineCode>.
            </li>
            <li>
              <InlineCode>buttonVariant</InlineCode> reaches icon buttons too when they have that
              style (<InlineCode>filled</InlineCode>, <InlineCode>tonal</InlineCode>,{' '}
              <InlineCode>outlined</InlineCode>), so a group never mixes styles; a button&apos;s own{' '}
              <InlineCode>variant</InlineCode> wins.
            </li>
            <li>
              <InlineCode>overflow</InlineCode> is Compose&apos;s{' '}
              <InlineCode>overflowIndicator</InlineCode> with its default indicator (an icon button
              with <InlineCode>more_vert</InlineCode> and a &quot;More options&quot; tooltip). The
              menu items come from the folded buttons, and choosing one presses that button, so its
              own handler, link or selection runs. The group fills its container&apos;s width to
              measure it.
            </li>
            <li>Under reduced motion the press bump doesn&apos;t happen and the corners snap.</li>
            <li>
              Children must be direct <InlineCode>Button</InlineCode> /{' '}
              <InlineCode>IconButton</InlineCode> elements, since each is wrapped in its own context
              provider for its position.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
