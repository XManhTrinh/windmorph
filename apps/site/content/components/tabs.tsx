import { ExampleViewer } from '../../components/example-viewer';
import { TabsBadges } from '../../examples/tabs/tabs-badges';
import { TabsPrimary } from '../../examples/tabs/tabs-primary';
import { TabsScrollable } from '../../examples/tabs/tabs-scrollable';
import { TabsSecondary } from '../../examples/tabs/tabs-secondary';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Tabs page body: primary, secondary and scrollable rows, badges and alignment. */
export async function TabsBody() {
  const [primary, secondary, scrollable, badges] = await Promise.all([
    readExampleSource('tabs/tabs-primary.tsx'),
    readExampleSource('tabs/tabs-secondary.tsx'),
    readExampleSource('tabs/tabs-scrollable.tsx'),
    readExampleSource('tabs/tabs-badges.tsx'),
  ]);
  const [primaryHtml, secondaryHtml, scrollableHtml, badgesHtml] = await Promise.all([
    highlightSource(primary),
    highlightSource(secondary),
    highlightSource(scrollable),
    highlightSource(badges),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Tabs organise content into peer sections on one screen and switch between them. Primary
          tabs sit at the top level with a content-width indicator; secondary tabs mark a nested
          level with a full-width indicator. Each <code className="text-on-surface">Tab</code> is a
          React Stately collection item identified by its{' '}
          <code className="text-on-surface">key</code>, with a{' '}
          <code className="text-on-surface">title</code>, an optional{' '}
          <code className="text-on-surface">icon</code> and its panel as{' '}
          <code className="text-on-surface">children</code>.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Leave the panel out for tabs that only navigate. When there are more tabs than fit, use{' '}
          <code className="text-on-surface">scrollable</code> so they keep their width and the row
          scrolls instead of letting them shrink. On wide windows,{' '}
          <code className="text-on-surface">align=&quot;start&quot;</code> or{' '}
          <code className="text-on-surface">&quot;center&quot;</code> makes every fixed tab as wide
          as the widest and places the group at the leading edge or the centre. A{' '}
          <code className="text-on-surface">badge</code> marks news in a tab, and{' '}
          <code className="text-on-surface">swipeable</code> lets a horizontal swipe on the panel
          change tab; avoid it when the panel holds swipeable content such as a map.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Primary tabs with panels"
          code={primary}
          html={primaryHtml}
          fileName="tabs-primary.tsx"
        >
          <TabsPrimary />
        </ExampleViewer>
        <ExampleViewer
          title="Secondary tabs"
          code={secondary}
          html={secondaryHtml}
          fileName="tabs-secondary.tsx"
        >
          <TabsSecondary />
        </ExampleViewer>
        <ExampleViewer
          title="Scrollable"
          code={scrollable}
          html={scrollableHtml}
          fileName="tabs-scrollable.tsx"
        >
          <TabsScrollable />
        </ExampleViewer>
        <ExampleViewer
          title="Badges, centred and swipeable"
          code={badges}
          html={badgesHtml}
          fileName="tabs-badges.tsx"
        >
          <TabsBadges />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Built on React Aria&apos;s tab list with M3&apos;s keyboard pattern: arrow keys move
            focus between tabs (mirrored in RTL), Home and End jump to the ends, and Space or Enter
            selects the focused tab.{' '}
            <code className="text-on-surface">keyboardActivation=&quot;automatic&quot;</code>{' '}
            selects on focus instead.
          </li>
          <li>
            Name the row with <code className="text-on-surface">aria-label</code>. An icon-only tab
            needs its own <code className="text-on-surface">aria-label</code> (or{' '}
            <code className="text-on-surface">textValue</code> when the title is not plain text).
          </li>
          <li>
            The selected tab&apos;s panel is linked by{' '}
            <code className="text-on-surface">aria-controls</code>; a row with no panels (pure
            navigation) renders no panel and drops the link.
          </li>
          <li>
            <code className="text-on-surface">disabledKeys</code> removes a tab from the arrow-key
            order.
          </li>
          <li>
            A badge is left out of the tab&apos;s name and describes it instead through{' '}
            <code className="text-on-surface">aria-describedby</code>, so &quot;Inbox&quot; is read
            with &quot;12&quot; as its description. A small dot badge has no text; say what it means
            in the tab&apos;s label if it matters.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The <code className="text-on-surface">primary</code> indicator slides on the default
            spatial spring. Primary tabs draw it 3px high with only its top corners rounded, as wide
            as the content (at least 24px); secondary tabs draw it 2px high across the whole tab
            (m3.material.io&apos;s measurements; Compose rounds every corner and uses 3px for both).
          </li>
          <li>
            Where Compose defaults an unselected tab&apos;s colour to the selected one, the token
            colours are used (labels <code className="text-on-surface">on-surface-variant</code>,
            and <code className="text-on-surface">on-surface</code> on hover, focus or press).
          </li>
          <li>
            A scrollable row animates the selected tab to the centre on the default spatial spring.
          </li>
          <li>
            React Aria takes arrow-key direction from its locale, so Tabs reads its laid-out
            direction and supplies a matching <code className="text-on-surface">I18nProvider</code>{' '}
            locale for correct RTL behaviour.
          </li>
        </ul>
      </section>
    </>
  );
}
