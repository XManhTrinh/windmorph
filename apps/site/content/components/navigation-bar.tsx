import { navBarTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const BarInline = lazyExample('navigation-bar/bar-inline', 'BarInline');
const BarStacked = lazyExample('navigation-bar/bar-stacked', 'BarStacked');
const BarHideOnScroll = lazyExample('navigation-bar/bar-hide-on-scroll', 'BarHideOnScroll');

/** Navigation bar page body: stacked and inline items, and hiding on scroll. */
export async function NavigationBarBody(): Promise<ComponentDoc> {
  const [stacked, inline, hideOnScroll] = await Promise.all([
    readExampleSource('navigation-bar/bar-stacked.tsx'),
    readExampleSource('navigation-bar/bar-inline.tsx'),
    readExampleSource('navigation-bar/bar-hide-on-scroll.tsx'),
  ]);
  const [stackedHtml, inlineHtml, hideOnScrollHtml] = await Promise.all([
    highlightSource(stacked),
    highlightSource(inline),
    highlightSource(hideOnScroll),
  ]);

  return {
    tokens: [navBarTokenSet],
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
          <ExampleViewer
            title="Hide on scroll"
            code={hideOnScroll}
            html={hideOnScrollHtml}
            fileName="bar-hide-on-scroll.tsx"
          >
            <BarHideOnScroll />
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
            and medium windows. With <InlineCode>iconPlacement=&quot;top&quot;</InlineCode> (the
            default) items stack the icon above the label; with{' '}
            <InlineCode>iconPlacement=&quot;start&quot;</InlineCode> the icon sits beside the label
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
            the extra space at the bar&apos;s ends; when their labels don&apos;t fit on one line
            side by side (a narrow bar, or text at up to 2× its size), they stack and share the
            width equally instead, so every label stays whole. A long label wraps between words and
            the bar grows taller. A single word too long for its item may break only where the
            browser hyphenates it for the page&apos;s <InlineCode>lang</InlineCode>; it never breaks
            bare, and a line it still overflows ends with an ellipsis. The accessible name is always
            the full label.
          </p>
          <p className="text-body-large text-on-surface-variant">
            An item&apos;s <InlineCode>badge</InlineCode> (a <InlineCode>Badge</InlineCode>)
            overlaps its icon. <InlineCode>onReselect</InlineCode> runs when the current destination
            is pressed again; M3 resets the page&apos;s scroll position to the top then.{' '}
            <InlineCode>scrollBehavior=&quot;hide-on-scroll&quot;</InlineCode> slides the bar off
            the bottom while the page scrolls down and back on any scroll up, settling shown or
            hidden when the scroll stops; the bar becomes <InlineCode>sticky</InlineCode>, so put it
            last in the scrolling layout, and pass <InlineCode>scrollRef</InlineCode> when an
            element scrolls rather than the page. It stays put under reduced motion. Don&apos;t hide
            the bar on scroll when a screen reader is active.
          </p>
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
              focus ring are pill-shaped, as in Compose&apos;s indicator ripple: a press ripples
              through the pill from the press point. Items fill the bar&apos;s height, so the whole
              64px is the touch target and inline pills sit in its middle.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
