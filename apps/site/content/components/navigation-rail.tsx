import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const RailHideOnCollapse = lazyExample(
  'navigation-rail/rail-hide-on-collapse',
  'RailHideOnCollapse',
);
const RailInline = lazyExample('navigation-rail/rail-inline', 'RailInline');
const RailModal = lazyExample('navigation-rail/rail-modal', 'RailModal');
const RailStates = lazyExample('navigation-rail/rail-states', 'RailStates');

/** Navigation rail page body: an expandable rail, its layouts and the modal rail. */
export async function NavigationRailBody(): Promise<ComponentDoc> {
  const [inline, states, modal, hidden] = await Promise.all([
    readExampleSource('navigation-rail/rail-inline.tsx'),
    readExampleSource('navigation-rail/rail-states.tsx'),
    readExampleSource('navigation-rail/rail-modal.tsx'),
    readExampleSource('navigation-rail/rail-hide-on-collapse.tsx'),
  ]);
  const [inlineHtml, statesHtml, modalHtml, hiddenHtml] = await Promise.all([
    highlightSource(inline),
    highlightSource(states),
    highlightSource(modal),
    highlightSource(hidden),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Expandable rail"
            code={inline}
            html={inlineHtml}
            fileName="rail-inline.tsx"
          >
            <RailInline />
          </ExampleViewer>
          <ExampleViewer
            title="Collapsed and expanded"
            code={states}
            html={statesHtml}
            fileName="rail-states.tsx"
          >
            <RailStates />
          </ExampleViewer>
          <ExampleViewer
            title="Modal expanded rail"
            code={modal}
            html={modalHtml}
            fileName="rail-modal.tsx"
          >
            <RailModal />
          </ExampleViewer>
          <ExampleViewer
            title="Hidden while collapsed"
            code={hidden}
            html={hiddenHtml}
            fileName="rail-hide-on-collapse.tsx"
          >
            <RailHideOnCollapse />
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
            A navigation rail places a screen&apos;s top-level destinations along the start edge,
            for medium and larger windows. Collapsed it is 96px wide with the icon above each label;
            expanded it is 220–360px with the icon beside the label. Put a menu button in{' '}
            <InlineCode>header</InlineCode> to toggle <InlineCode>expanded</InlineCode>. A FAB in
            the header is an <InlineCode>ExtendedFab</InlineCode> given the rail&apos;s{' '}
            <InlineCode>expanded</InlineCode>, so it shows its label only while the rail is
            expanded, and <InlineCode>elevation=&quot;flat&quot;</InlineCode>, since a FAB nested in
            the rail rests at level 0 (M3). On compact windows use a{' '}
            <InlineCode>NavigationBar</InlineCode> instead.
          </p>
          <p className="text-body-large text-on-surface-variant">
            The icons stay on one line through the middle of the collapsed rail in both states, so
            only the labels and the rail&apos;s edge move. For a narrower collapsed rail, such as
            M3&apos;s 80px baseline rail, set <InlineCode>--m3-rail-collapsed-width</InlineCode>{' '}
            (for example the class <InlineCode>[--m3-rail-collapsed-width:80px]</InlineCode>) rather
            than a <InlineCode>w-*</InlineCode> class: every inset follows it, and the rail still
            expands.
          </p>
          <p className="text-body-large text-on-surface-variant">
            In the expanded rail the pill hugs its icon and label. In both states the new
            destination&apos;s pill expands from the centre of its icon on the default spatial
            spring, and its label turns bold. The whole row is the target. An item&apos;s{' '}
            <InlineCode>selectedIcon</InlineCode> cross-fades with its icon. Labels never truncate:
            a long label wraps, breaking between words first, and the item grows taller. While the
            rail widens, labels stay on one line, clipped by the rail, so no icon moves. A press
            ripples through the pill.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>itemAlignment=&quot;center&quot;</InlineCode> centres the items in the space
            below the header (M3 recommends it on tablets, where the middle is easier to reach); the
            header stays at the top. <InlineCode>divider</InlineCode> draws an{' '}
            <InlineCode>outline-variant</InlineCode> line on the edge next to the content. An
            item&apos;s <InlineCode>badge</InlineCode> (a <InlineCode>Badge</InlineCode>) sits on
            the icon while collapsed and after the label while expanded;{' '}
            <InlineCode>onReselect</InlineCode> runs when the current destination is pressed again.
            A FAB in the header should rest flat (level 0) in the rail.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Each <InlineCode>NavigationRailItem</InlineCode> is a link (
            <InlineCode>href</InlineCode>) or a button (<InlineCode>onPress</InlineCode>) with an{' '}
            <InlineCode>icon</InlineCode>, an optional <InlineCode>selectedIcon</InlineCode> and a
            label. <InlineCode>selected</InlineCode> marks the current destination. With{' '}
            <InlineCode>modal</InlineCode> the expanded rail opens over the page as a sheet with a
            scrim; <InlineCode>hideOnCollapse</InlineCode> hides the in-flow rail so only the sheet
            shows.
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
              The rail is a <InlineCode>nav</InlineCode> landmark; name it with{' '}
              <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode>{' '}
              (required by the types) so it is distinct from other navigation.
            </li>
            <li>
              Each item is a real link or button, so Tab reaches it and Enter or Space activates it.
              The Up and Down arrows move focus between items (Home and End to the first and last)
              without choosing one. The icon is hidden from assistive tech; the label names the
              item.
            </li>
            <li>
              A badge describes its item: its text, or <InlineCode>badgeLabel</InlineCode> (e.g.
              &quot;3 new messages&quot;), is linked with <InlineCode>aria-describedby</InlineCode>.
              Give a small (dot) badge a <InlineCode>badgeLabel</InlineCode>.
            </li>
            <li>
              The selected item sets <InlineCode>aria-current=&quot;page&quot;</InlineCode>, so a
              screen reader announces the current destination. A disabled item is skipped.
            </li>
            <li>
              The modal rail is a dialog: focus starts on its first interactive element (the menu
              button, the FAB or the first destination) and stays inside, and Escape, an outside
              press or choosing an item collapses it and returns focus.
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
              The expanded width is the widest label plus 104px of item chrome, clamped to
              220–360px, exposed as the <InlineCode>--m3-rail-width</InlineCode> variable, so a
              consumer <InlineCode>w-*</InlineCode> class still wins.
            </li>
            <li>
              Where Compose cross-fades each label while sliding it as the rail changes mode, here
              the items switch layout at once, the labels fade in at their new place, and the
              rail&apos;s width does the spring.
            </li>
            <li>
              Selection is <InlineCode>aria-current=&quot;page&quot;</InlineCode> via a{' '}
              <InlineCode>data-current</InlineCode> attribute, because{' '}
              <InlineCode>ButtonBase</InlineCode> owns <InlineCode>data-selected</InlineCode>.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
