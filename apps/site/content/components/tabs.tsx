import { ExampleViewer } from '../../components/example-viewer';
import { TabsPrimary } from '../../examples/tabs/tabs-primary';
import { TabsScrollable } from '../../examples/tabs/tabs-scrollable';
import { TabsSecondary } from '../../examples/tabs/tabs-secondary';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Tabs page body: primary, secondary and scrollable rows. */
export async function TabsBody() {
  const [primary, secondary, scrollable] = await Promise.all([
    readExampleSource('tabs/tabs-primary.tsx'),
    readExampleSource('tabs/tabs-secondary.tsx'),
    readExampleSource('tabs/tabs-scrollable.tsx'),
  ]);
  const [primaryHtml, secondaryHtml, scrollableHtml] = await Promise.all([
    highlightSource(primary),
    highlightSource(secondary),
    highlightSource(scrollable),
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
          scrolls instead of letting them shrink.
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Built on React Aria&apos;s tab list: arrow keys move between tabs (mirrored in RTL),
            Home and End jump to the ends, and the selection activates automatically.
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
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The 3px <code className="text-on-surface">primary</code> indicator slides on the default
            spatial spring; primary tabs size it to the content (at least 24px), secondary tabs to
            the whole tab.
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
