import { ExampleViewer } from '../../components/example-viewer';
import { RailInline } from '../../examples/navigation-rail/rail-inline';
import { RailStates } from '../../examples/navigation-rail/rail-states';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Navigation rail page body: an expandable rail and the collapsed/expanded layouts. */
export async function NavigationRailBody() {
  const [inline, states] = await Promise.all([
    readExampleSource('navigation-rail/rail-inline.tsx'),
    readExampleSource('navigation-rail/rail-states.tsx'),
  ]);
  const [inlineHtml, statesHtml] = await Promise.all([
    highlightSource(inline),
    highlightSource(states),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A navigation rail places a screen&apos;s top-level destinations along the start edge, for
          medium and larger windows. Collapsed it is 96px wide with the icon above each label;
          expanded it is 220–360px with the icon beside the label. Put a menu button in{' '}
          <code className="text-on-surface">header</code> to toggle{' '}
          <code className="text-on-surface">expanded</code>. A FAB in the header is an{' '}
          <code className="text-on-surface">ExtendedFab</code> given the rail&apos;s{' '}
          <code className="text-on-surface">expanded</code>, so it shows its label only while the
          rail is expanded, and <code className="text-on-surface">elevation=&quot;flat&quot;</code>,
          since a FAB nested in the rail rests at level 0 (M3). On compact windows use a{' '}
          <code className="text-on-surface">NavigationBar</code> instead.
        </p>
        <p className="text-body-large text-on-surface-variant">
          The icons stay on one line through the middle of the collapsed rail in both states, so
          only the labels and the rail&apos;s edge move. For a narrower collapsed rail, such as
          M3&apos;s 80px baseline rail, set{' '}
          <code className="text-on-surface">--m3-rail-collapsed-width</code> (for example the class{' '}
          <code className="text-on-surface">[--m3-rail-collapsed-width:80px]</code>) rather than a{' '}
          <code className="text-on-surface">w-*</code> class: every inset follows it, and the rail
          still expands.
        </p>
        <p className="text-body-large text-on-surface-variant">
          In the expanded rail the pill hugs its icon and label. In both states the new
          destination&apos;s pill expands from the centre of its icon on the default spatial spring,
          and its label turns bold. The whole row is the target. An item&apos;s{' '}
          <code className="text-on-surface">selectedIcon</code> cross-fades with its icon. Labels
          never truncate: a long label wraps, breaking between words first, and the item grows
          taller.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <code className="text-on-surface">itemAlignment=&quot;center&quot;</code> centres the
          items in the space below the header (M3 recommends it on tablets, where the middle is
          easier to reach); the header stays at the top.{' '}
          <code className="text-on-surface">divider</code> draws an{' '}
          <code className="text-on-surface">outline-variant</code> line on the edge next to the
          content. An item&apos;s <code className="text-on-surface">badge</code> (a{' '}
          <code className="text-on-surface">Badge</code>) sits on the icon while collapsed and after
          the label while expanded; <code className="text-on-surface">onReselect</code> runs when
          the current destination is pressed again. A FAB in the header should rest flat (level 0)
          in the rail.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Each <code className="text-on-surface">NavigationRailItem</code> is a link (
          <code className="text-on-surface">href</code>) or a button (
          <code className="text-on-surface">onPress</code>) with an{' '}
          <code className="text-on-surface">icon</code>, an optional{' '}
          <code className="text-on-surface">selectedIcon</code> and a label.{' '}
          <code className="text-on-surface">selected</code> marks the current destination. With{' '}
          <code className="text-on-surface">modal</code> the expanded rail opens over the page as a
          sheet with a scrim; <code className="text-on-surface">hideOnCollapse</code> hides the
          in-flow rail so only the sheet shows.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The rail is a <code className="text-on-surface">nav</code> landmark; name it with{' '}
            <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code> (required by the types) so it
            is distinct from other navigation.
          </li>
          <li>
            Each item is a real link or button, so Tab reaches it and Enter or Space activates it.
            The Up and Down arrows move focus between items (Home and End to the first and last)
            without choosing one. The icon is hidden from assistive tech; the label names the item.
          </li>
          <li>
            A badge describes its item: its text, or{' '}
            <code className="text-on-surface">badgeLabel</code> (e.g. &quot;3 new messages&quot;),
            is linked with <code className="text-on-surface">aria-describedby</code>. Give a small
            (dot) badge a <code className="text-on-surface">badgeLabel</code>.
          </li>
          <li>
            The selected item sets{' '}
            <code className="text-on-surface">aria-current=&quot;page&quot;</code>, so a screen
            reader announces the current destination. A disabled item is skipped.
          </li>
          <li>
            The modal rail is a dialog: focus starts on its first interactive element (the menu
            button, the FAB or the first destination) and stays inside, and Escape, an outside press
            or choosing an item collapses it and returns focus.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The expanded width is the widest label plus 104px of item chrome, clamped to 220–360px,
            exposed as the <code className="text-on-surface">--m3-rail-width</code> variable, so a
            consumer <code className="text-on-surface">w-*</code> class still wins.
          </li>
          <li>
            Where Compose cross-fades each label while sliding it as the rail changes mode, here the
            items switch layout at once, the labels fade in at their new place, and the rail&apos;s
            width does the spring.
          </li>
          <li>
            Selection is <code className="text-on-surface">aria-current=&quot;page&quot;</code> via
            a <code className="text-on-surface">data-current</code> attribute, because{' '}
            <code className="text-on-surface">ButtonBase</code> owns{' '}
            <code className="text-on-surface">data-selected</code>.
          </li>
        </ul>
      </section>
    </>
  );
}
