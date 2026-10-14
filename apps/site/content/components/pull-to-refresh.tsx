import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { InlineCode } from '../../components/inline-code';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { lazyExample } from '../../lib/lazy-example';

const PullToRefreshBasic = lazyExample(
  'pull-to-refresh/pull-to-refresh-basic',
  'PullToRefreshBasic',
);
const PullToRefreshButton = lazyExample(
  'pull-to-refresh/pull-to-refresh-button',
  'PullToRefreshButton',
);
const PullToRefreshFeed = lazyExample('pull-to-refresh/pull-to-refresh-feed', 'PullToRefreshFeed');
const PullToRefreshRtl = lazyExample('pull-to-refresh/pull-to-refresh-rtl', 'PullToRefreshRtl');
const PullToRefreshThreshold = lazyExample(
  'pull-to-refresh/pull-to-refresh-threshold',
  'PullToRefreshThreshold',
);

const list = 'flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc';
const heading = 'text-headline-small text-on-surface';
const body = 'text-body-large text-on-surface-variant';

/** Pull to refresh page body. */
export async function PullToRefreshBody(): Promise<ComponentDoc> {
  const [basic, feed, button, threshold, rtl] = await Promise.all([
    readExampleSource('pull-to-refresh/pull-to-refresh-basic.tsx'),
    readExampleSource('pull-to-refresh/pull-to-refresh-feed.tsx'),
    readExampleSource('pull-to-refresh/pull-to-refresh-button.tsx'),
    readExampleSource('pull-to-refresh/pull-to-refresh-threshold.tsx'),
    readExampleSource('pull-to-refresh/pull-to-refresh-rtl.tsx'),
  ]);
  const [basicHtml, feedHtml, buttonHtml, thresholdHtml, rtlHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(feed),
    highlightSource(button),
    highlightSource(threshold),
    highlightSource(rtl),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className={heading}>
            Examples
          </h2>
          <p className={body}>
            Pull down at the top of each area with a finger, or drag with a mouse, past the
            threshold and let go.
          </p>
          <ExampleViewer
            title="Basic: a promise drives the indicator"
            code={basic}
            html={basicHtml}
            fileName="pull-to-refresh-basic.tsx"
          >
            <PullToRefreshBasic />
          </ExampleViewer>
          <ExampleViewer
            title="A list feed with refreshing controlled"
            code={feed}
            html={feedHtml}
            fileName="pull-to-refresh-feed.tsx"
          >
            <PullToRefreshFeed />
          </ExampleViewer>
          <ExampleViewer
            title="A refresh button as well"
            code={button}
            html={buttonHtml}
            fileName="pull-to-refresh-button.tsx"
          >
            <PullToRefreshButton />
          </ExampleViewer>
          <ExampleViewer
            title="Threshold, disabled and labels"
            code={threshold}
            html={thresholdHtml}
            fileName="pull-to-refresh-threshold.tsx"
          >
            <PullToRefreshThreshold />
          </ExampleViewer>
          <ExampleViewer
            title="Right to left"
            code={rtl}
            html={rtlHtml}
            fileName="pull-to-refresh-rtl.tsx"
          >
            <PullToRefreshRtl />
          </ExampleViewer>
        </section>
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className={heading}>
            Purpose
          </h2>
          <p className={body}>
            Pull to refresh reloads content with a gesture. Use it at the start of lists, grid lists
            and card collections where the newest content appears first, for content that changes
            often, so people have a good chance of seeing something new.
          </p>
          <p className={body}>
            The M3 loading indicator is the one used for pull to refresh, in its contained form,
            which stands out from the content it is drawn over.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className={heading}>
            Behaviour
          </h2>
          <ul className={list}>
            <li>
              The gesture only starts when the content is at its top and the drag goes down;
              scrolling is never blocked. The indicator follows at half the drag&apos;s speed.
            </li>
            <li>
              To make the refresh intentional, the indicator must pass a threshold (
              <InlineCode>threshold</InlineCode>, 80px). Letting go past it refreshes; pushing back
              below it, or letting go before it, cancels.
            </li>
            <li>
              The indicator stays at the threshold until <InlineCode>refreshing</InlineCode> is{' '}
              <InlineCode>false</InlineCode> (or the promise from <InlineCode>onRefresh</InlineCode>{' '}
              settles), and it never scrolls off-screen: it hangs from a sticky layer at the top of
              the area. When a sticky app bar covers the top of a scrolling page, move it down with{' '}
              <InlineCode>classNames.layer</InlineCode> (e.g. <InlineCode>top-16</InlineCode>).
            </li>
            <li>
              Wrap a scroll container (give the area a height and{' '}
              <InlineCode>overflow-y-auto</InlineCode>, or put the scrolling element inside it) or
              the whole page. The area sets <InlineCode>overscroll-behavior-y: contain</InlineCode>{' '}
              and claims the touch while pulling, so the browser&apos;s own pull to refresh and
              rubber-banding don&apos;t start as well.
            </li>
          </ul>
        </section>
      </>
    ),
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="a-way-without-the-gesture" className={heading}>
            A way without the gesture
          </h2>
          <p className={body}>
            Pull to refresh can&apos;t be the only way to refresh: not everyone can drag. Offer a
            refresh button in the app bar, a menu or next to the content that sets{' '}
            <InlineCode>refreshing</InlineCode>; the same indicator comes in and the same
            announcements are made. The component has no built-in button because where it goes
            belongs to the screen&apos;s layout.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className={heading}>
            Keyboard &amp; screen reader
          </h2>
          <ul className={list}>
            <li>
              The indicator is a <InlineCode>role=&quot;progressbar&quot;</InlineCode>: named{' '}
              <InlineCode>labels.pull</InlineCode> (&ldquo;Pull to refresh&rdquo;, with its value)
              while it follows a pull, and <InlineCode>labels.refreshing</InlineCode>{' '}
              (&ldquo;Refreshing&rdquo;) while a refresh runs. Name them for what they refresh, e.g.
              &ldquo;Refreshing messages&rdquo;.
            </li>
            <li>
              A polite live region announces <InlineCode>labels.refreshing</InlineCode> when a
              refresh starts and <InlineCode>labels.refreshed</InlineCode> (&ldquo;Refreshed&rdquo;)
              when it ends.
            </li>
            <li>
              When the area is itself the scroll container, give it keyboard access as any scrolling
              region needs: <InlineCode>tabIndex={'{0}'}</InlineCode>,{' '}
              <InlineCode>role=&quot;region&quot;</InlineCode> and an{' '}
              <InlineCode>aria-label</InlineCode>, as the examples do.
            </li>
            <li>
              It adds nothing to the tab order itself. Under{' '}
              <InlineCode>prefers-reduced-motion</InlineCode> the indicator settles on the standard
              motion scheme&apos;s spring, which doesn&apos;t overshoot, and the refreshing
              indicator only rotates.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="differences-from-compose" className={heading}>
            Differences from Compose
          </h2>
          <ul className={list}>
            <li>
              <InlineCode>PullToRefresh</InlineCode> is Compose&apos;s{' '}
              <InlineCode>PullToRefreshBox</InlineCode> with{' '}
              <InlineCode>PullToRefreshDefaults.LoadingIndicator</InlineCode>: an 80px threshold,
              the half-speed drag and its resistance past the threshold (up to twice it), a 48px{' '}
              <InlineCode>primary-container</InlineCode> circle at elevation 0, a half turn back per
              threshold of overshoot, and a crossfade to the indeterminate indicator on the default
              effects spring.
            </li>
            <li>
              It settles to the threshold or away on the fast spatial spring of the active motion
              scheme (Compose uses a default, non-bouncing spring), since it moves position.
            </li>
            <li>
              The web has no nested scrolling, so a gesture is decided as it starts: a downward drag
              with everything above it at the top pulls; anything else is left to the browser for
              the rest of the gesture. A pull pushed back to zero hands the gesture back, and
              elements whose <InlineCode>touch-action</InlineCode> blocks vertical panning keep
              their drags.
            </li>
            <li>
              Without <InlineCode>refreshing</InlineCode>, a promise returned by{' '}
              <InlineCode>onRefresh</InlineCode> keeps the indicator until it settles. There is no
              exported state object; <InlineCode>data-pulling</InlineCode> and{' '}
              <InlineCode>data-refreshing</InlineCode> on the root expose the state.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
