import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const BarInline = lazyExample('navigation-bar/bar-inline', 'BarInline');
const BarStacked = lazyExample('navigation-bar/bar-stacked', 'BarStacked');

/** Navigation bar page body: stacked and inline items. */
export async function NavigationBarBody(): Promise<ComponentDoc> {
  const [stacked, inline] = await Promise.all([
    readExampleSource('navigation-bar/bar-stacked.tsx'),
    readExampleSource('navigation-bar/bar-inline.tsx'),
  ]);
  const [stackedHtml, inlineHtml] = await Promise.all([
    highlightSource(stacked),
    highlightSource(inline),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Stacked items (compact)"
            code={stacked}
            html={stackedHtml}
            fileName="bar-stacked.tsx"
          >
            <BarStacked />
          </ExampleViewer>
          <ExampleViewer
            title="Inline items, centred"
            code={inline}
            html={inlineHtml}
            fileName="bar-inline.tsx"
          >
            <BarInline />
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
            The flexible navigation bar holds 3–5 top-level destinations along the bottom of compact
            and medium windows. With <InlineCode>iconPosition=&quot;top&quot;</InlineCode> (the
            default) items stack the icon above the label; with{' '}
            <InlineCode>iconPosition=&quot;start&quot;</InlineCode> the icon sits beside the label
            in a pill, for the flexible bar in medium windows. For larger windows use a{' '}
            <InlineCode>NavigationRail</InlineCode> instead.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Items are links (<InlineCode>href</InlineCode>) or buttons (
            <InlineCode>onPress</InlineCode>) with an <InlineCode>icon</InlineCode>, an optional{' '}
            <InlineCode>selectedIcon</InlineCode> and a label; <InlineCode>selected</InlineCode>{' '}
            marks the current one, with a bold label. Stacked items share the width equally;{' '}
            <InlineCode>arrangement=&quot;centered&quot;</InlineCode> groups them within side
            padding. Items beside their icons keep their own width and are centred by default, with
            the extra space at the bar&apos;s ends. Labels never truncate: a long label wraps and
            the bar grows taller.
          </p>
          <p className="text-body-large text-on-surface-variant">
            An item&apos;s <InlineCode>badge</InlineCode> (a <InlineCode>Badge</InlineCode>)
            overlaps its icon. <InlineCode>onReselect</InlineCode> runs when the current destination
            is pressed again; M3 resets the page&apos;s scroll position to the top then.{' '}
            <InlineCode>scrollBehavior=&quot;hide-on-scroll&quot;</InlineCode> slides the bar off
            the bottom while the page scrolls down and back on any scroll up; the bar becomes{' '}
            <InlineCode>sticky</InlineCode>, so put it last in the scrolling layout, and pass{' '}
            <InlineCode>scrollRef</InlineCode> when an element scrolls rather than the page. It
            stays put under reduced motion. Don&apos;t hide the bar on scroll when a screen reader
            is active.
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
              The bar is a <InlineCode>nav</InlineCode> landmark and needs a name via{' '}
              <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode>{' '}
              (required by the types).
            </li>
            <li>
              Each item is a link or button that Tab reaches and Enter or Space activates; the Left
              and Right arrows (mirrored right to left) also move focus between items. The icon is
              hidden from assistive tech and the label names the item; a badge describes it through
              its text or <InlineCode>badgeLabel</InlineCode>.
            </li>
            <li>
              The selected item sets <InlineCode>aria-current=&quot;page&quot;</InlineCode> so the
              current destination is announced.
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
              This is Compose&apos;s short / flexible navigation bar (
              <InlineCode>ShortNavigationBar</InlineCode>), which replaces the original navigation
              bar; it is at least 64px <InlineCode>surface-container</InlineCode> with no elevation.
            </li>
            <li>
              <InlineCode>arrangement=&quot;centered&quot;</InlineCode> reproduces Compose&apos;s
              side padding of (100% − 10% × (n + 3)) / 2 for up to 6 stacked items. Inline items are
              sized to their content, 8px apart (a provisional gap; the spec gives no value).
            </li>
            <li>
              The pill grows from its centre on the default spatial spring, and the state layer and
              focus ring are pill-shaped, as in Compose&apos;s indicator ripple.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
